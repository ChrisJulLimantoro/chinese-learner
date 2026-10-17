/**
 * srs.ts — Leitner 5-box SRS: promote/demote, mastery, selection helpers.
 * Faithful port of srs.py.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  BOX_INTERVALS,
  MASTERY_BOX,
  MASTERY_EXTRA_CORRECT,
  MAINTENANCE_INTERVAL,
  LEAK_PLUGGER_THRESHOLD,
  LOWER_LEVEL_REVIEW_SHARE,
  MASTERY_PERCENT,
  LEVEL_FLOOR,
} from "./config";
import type { Outcome, SrsState, Word, Reading } from "./types";

// ---------------------------------------------------------------------------
// Core SRS update
// ---------------------------------------------------------------------------

export async function ensureSrsState(
  supabase: SupabaseClient,
  userId: string,
  wordId: number
): Promise<void> {
  // Upsert with do-nothing on conflict — box 1, next_review_at 0 (unix seconds)
  await supabase.from("srs_state").upsert(
    { user_id: userId, word_id: wordId, box: 1, next_review_at: 0 },
    { onConflict: "user_id,word_id", ignoreDuplicates: true }
  );
}

export type SrsOutcomeFlags = { outcome: Outcome; overTimer: boolean; hesitated: boolean };
type SrsProgress = Pick<SrsState, "box" | "correct_count" | "wrong_count" | "hesitated_count" | "lapse_streak" | "box5_correct">;

function isCleanCorrect({ outcome, overTimer, hesitated }: SrsOutcomeFlags): boolean {
  return outcome === "correct" && !overTimer && !hesitated;
}

function nextCounts(row: SrsProgress, flags: SrsOutcomeFlags): SrsProgress {
  return {
    box: row.box,
    correct_count: row.correct_count + (flags.outcome === "correct" ? 1 : 0),
    wrong_count: row.wrong_count + (flags.outcome === "wrong" ? 1 : 0),
    hesitated_count: row.hesitated_count + (flags.outcome === "hesitated" ? 1 : 0),
    lapse_streak: row.lapse_streak + (flags.outcome === "wrong" ? 1 : 0),
    box5_correct: row.box5_correct,
  };
}

function nextBox(box: number, flags: SrsOutcomeFlags): number {
  if (flags.outcome === "wrong") return Math.max(1, box - 1);
  return isCleanCorrect(flags) ? Math.min(5, box + 1) : box;
}

function applyLeakPlugger(progress: SrsProgress): SrsProgress {
  if (progress.lapse_streak < LEAK_PLUGGER_THRESHOLD) return progress;
  return { ...progress, box: 1, lapse_streak: 0, box5_correct: 0 };
}

function resetStreakOnSolidRecall(row: SrsProgress, flags: SrsOutcomeFlags): SrsProgress {
  return isCleanCorrect(flags) && row.box >= 3 ? { ...row, lapse_streak: 0 } : row;
}

function nextBox5Correct(row: SrsProgress, flags: SrsOutcomeFlags, box: number): number {
  if (box !== MASTERY_BOX || row.box !== MASTERY_BOX) return 0;
  return row.box5_correct + (isCleanCorrect(flags) ? 1 : 0);
}

export function computeProgress(row: SrsProgress, flags: SrsOutcomeFlags): SrsProgress {
  const counted = resetStreakOnSolidRecall(nextCounts(row, flags), flags);
  const box = nextBox(row.box, flags);
  return applyLeakPlugger({ ...counted, box, box5_correct: nextBox5Correct(row, flags, box) });
}

export function isMastered(progress: SrsProgress): boolean {
  return progress.box === MASTERY_BOX && progress.box5_correct >= MASTERY_EXTRA_CORRECT;
}

function nextReviewAfter(progress: SrsProgress): number {
  const interval = isMastered(progress) ? MAINTENANCE_INTERVAL : BOX_INTERVALS[progress.box];
  return Date.now() / 1000 + interval;
}

export function emptySrsState(userId: string, wordId: number): SrsState {
  return {
    user_id: userId,
    word_id: wordId,
    box: 1,
    next_review_at: 0,
    correct_count: 0,
    wrong_count: 0,
    hesitated_count: 0,
    lapse_streak: 0,
    box5_correct: 0,
    mastered: false,
  };
}

export function advanceSrsState(row: SrsState, flags: SrsOutcomeFlags): SrsState {
  const progress = computeProgress(row, flags);
  return { ...row, ...progress, next_review_at: nextReviewAfter(progress), mastered: isMastered(progress) };
}

export type RecognitionResult = { wordId: number; correct: boolean };

function nextReviewFromRecognition(row: SrsState, correct: boolean, now: number): number | null {
  if (row.mastered) return null;
  if (correct) return row.next_review_at <= now ? now + BOX_INTERVALS[row.box] : null;
  const soon = now + BOX_INTERVALS[1];
  return soon < row.next_review_at ? soon : null;
}

function isDue(row: SrsState, now: number): boolean {
  return row.next_review_at <= now;
}

function rescheduledOffSchedule(row: SrsState, flags: SrsOutcomeFlags, now: number): SrsState {
  const nextReviewAt = nextReviewFromRecognition(row, flags.outcome !== "wrong", now);
  return nextReviewAt === null ? row : { ...row, next_review_at: nextReviewAt };
}

export function applyAnswer(row: SrsState, flags: SrsOutcomeFlags, now: number = Date.now() / 1000): SrsState {
  return isDue(row, now) ? advanceSrsState(row, flags) : rescheduledOffSchedule(row, flags, now);
}

function rescheduledRow(row: SrsState | undefined, correct: boolean, now: number): SrsState | null {
  const nextReviewAt = row ? nextReviewFromRecognition(row, correct, now) : null;
  return row && nextReviewAt !== null ? { ...row, next_review_at: nextReviewAt } : null;
}

async function fetchSrsRows(supabase: SupabaseClient, userId: string, wordIds: number[]): Promise<Map<number, SrsState>> {
  const { data } = await supabase.from("srs_state").select("*").eq("user_id", userId).in("word_id", wordIds);
  return new Map(((data ?? []) as SrsState[]).map((row) => [row.word_id, row]));
}

export async function rescheduleFromRecognition(
  supabase: SupabaseClient,
  userId: string,
  results: RecognitionResult[]
): Promise<void> {
  const rows = await fetchSrsRows(supabase, userId, results.map((r) => r.wordId));
  const now = Date.now() / 1000;
  const changed = results.flatMap((r) => rescheduledRow(rows.get(r.wordId), r.correct, now) ?? []);
  if (changed.length > 0) await supabase.from("srs_state").upsert(changed, { onConflict: "user_id,word_id" });
}

// ---------------------------------------------------------------------------
// Word selection
// ---------------------------------------------------------------------------

export async function getUnseenWords(
  supabase: SupabaseClient,
  userId: string,
  size: number,
  level: number
): Promise<Word[]> {
  // Words at this level with NO srs_state row for this user
  const { data } = await supabase
    .from("words")
    .select(`
      *,
      srs_state!left(user_id)
    `)
    .eq("hsk_level", level)
    .is("srs_state.user_id", null)
    .order("frequency_rank", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true })
    .limit(size);

  return (data ?? []).map(normalizeWord);
}

export async function getDueWords(
  supabase: SupabaseClient,
  userId: string,
  size: number,
  level: number
): Promise<Word[]> {
  const nowSeconds = Date.now() / 1000;
  const lowerSize = level > 1 ? Math.max(1, Math.floor(size * LOWER_LEVEL_REVIEW_SHARE)) : 0;
  const currentSize = size - lowerSize;

  // Current level due
  const { data: current } = await supabase
    .from("words")
    .select("*, srs_state!inner(box, next_review_at, mastered, correct_count, wrong_count, hesitated_count, box5_correct, user_id)")
    .eq("hsk_level", level)
    .eq("srs_state.user_id", userId)
    .lte("srs_state.next_review_at", nowSeconds)
        .order("srs_state(next_review_at)", { ascending: true })
    .limit(currentSize);

  // Lower level due
  let lower: unknown[] = [];
  if (lowerSize > 0) {
    const { data: lowerData } = await supabase
      .from("words")
      .select("*, srs_state!inner(box, next_review_at, mastered, correct_count, wrong_count, hesitated_count, box5_correct, user_id)")
      .lt("hsk_level", level)
      .eq("srs_state.user_id", userId)
      .lte("srs_state.next_review_at", nowSeconds)
            .order("srs_state(next_review_at)", { ascending: true })
      .limit(lowerSize);
    lower = lowerData ?? [];
  }

  return [...(current ?? []), ...lower].map(normalizeWord);
}

export async function getMixedWords(
  supabase: SupabaseClient,
  userId: string,
  size: number,
  level: number
): Promise<Word[]> {
  const due = await getDueWords(supabase, userId, size, level);
  if (due.length >= size) return due.slice(0, size);
  const remaining = size - due.length;
  const unseen = await getUnseenWords(supabase, userId, remaining, level);
  return [...due, ...unseen];
}

export async function countDue(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const nowSeconds = Date.now() / 1000;
  const { count } = await supabase
    .from("srs_state")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .lte("next_review_at", nowSeconds);
  return count ?? 0;
}

export async function checkProgression(
  supabase: SupabaseClient,
  userId: string,
  level: number
): Promise<boolean> {
  const { count: total } = await supabase
    .from("words")
    .select("*", { count: "exact", head: true })
    .eq("hsk_level", level);

  const { count: mastered } = await supabase
    .from("srs_state")
    .select("*, words!inner(hsk_level)", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("mastered", true)
    .eq("words.hsk_level", level);

  const totalCnt = total ?? 0;
  const masteredCnt = mastered ?? 0;

  if (totalCnt === 0) return false;
  return masteredCnt >= LEVEL_FLOOR && masteredCnt / totalCnt >= MASTERY_PERCENT;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeWord(row: Record<string, unknown>): Word {
  return {
    id: row.id as number,
    simplified: row.simplified as string,
    traditional: row.traditional as string | null,
    pinyin: row.pinyin as string,
    hsk_level: row.hsk_level as number,
    frequency_rank: row.frequency_rank as number | null,
    pos: Array.isArray(row.pos) ? row.pos as string[] : [],
    meanings: Array.isArray(row.meanings) ? row.meanings as string[] : [],
    measure_word: row.measure_word as { mw: string; pinyin: string } | null,
    lesson_card: row.lesson_card as null,
    readings: Array.isArray(row.readings) ? row.readings as Reading[] : [
      { pinyin: row.pinyin as string, traditional: row.traditional as string | null, meanings: Array.isArray(row.meanings) ? row.meanings as string[] : [] }
    ],
  };
}
