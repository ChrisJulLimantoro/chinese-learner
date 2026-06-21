/**
 * srs.ts — Leitner 5-box SRS: promote/demote, mastery, selection helpers.
 * Faithful port of srs.py.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  BOX_INTERVALS,
  MASTERY_BOX,
  MASTERY_EXTRA_CORRECT,
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

export async function updateSrs(
  supabase: SupabaseClient,
  userId: string,
  wordId: number,
  outcome: Outcome,
  overTimer: boolean = false,
  hesitated: boolean = false
): Promise<SrsState> {
  await ensureSrsState(supabase, userId, wordId);

  const { data: row } = await supabase
    .from("srs_state")
    .select("*")
    .eq("user_id", userId)
    .eq("word_id", wordId)
    .single();

  let box: number = row.box;
  let correctCount: number = row.correct_count;
  let wrongCount: number = row.wrong_count;
  let hesitatedCount: number = row.hesitated_count;

  // Determine new counts
  if (outcome === "correct" && !hesitated) {
    correctCount += 1;
  } else if (outcome === "wrong") {
    wrongCount += 1;
  } else if (outcome === "hesitated") {
    hesitatedCount += 1;
    correctCount += 1; // counts as correct, no promotion
  }

  // Determine new box
  const noPromote = overTimer || hesitated || outcome === "hesitated";

  if (outcome === "wrong") {
    box = Math.max(1, box - 1);
  } else if (outcome === "correct" && !noPromote) {
    box = Math.min(5, box + 1);
  }
  // else: stay

  // Leak-plugger: wrong_count cumulative — never resets, port as-is
  if (wrongCount >= LEAK_PLUGGER_THRESHOLD) {
    box = 1;
  }

  // Mastery: box 5 + enough correct
  const mastered = box === MASTERY_BOX && correctCount >= MASTERY_EXTRA_CORRECT;

  const interval = BOX_INTERVALS[box] ?? BOX_INTERVALS[5];
  const nowSeconds = Date.now() / 1000;
  const nextReviewAt = nowSeconds + interval;

  const { data: updated } = await supabase
    .from("srs_state")
    .update({
      box,
      next_review_at: nextReviewAt,
      correct_count: correctCount,
      wrong_count: wrongCount,
      hesitated_count: hesitatedCount,
      mastered,
    })
    .eq("user_id", userId)
    .eq("word_id", wordId)
    .select()
    .single();

  return updated as SrsState;
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
    .select("*, srs_state!inner(box, next_review_at, mastered, correct_count, wrong_count, hesitated_count, user_id)")
    .eq("hsk_level", level)
    .eq("srs_state.user_id", userId)
    .lte("srs_state.next_review_at", nowSeconds)
    .eq("srs_state.mastered", false)
    .order("srs_state(next_review_at)", { ascending: true })
    .limit(currentSize);

  // Lower level due
  let lower: unknown[] = [];
  if (lowerSize > 0) {
    const { data: lowerData } = await supabase
      .from("words")
      .select("*, srs_state!inner(box, next_review_at, mastered, correct_count, wrong_count, hesitated_count, user_id)")
      .lt("hsk_level", level)
      .eq("srs_state.user_id", userId)
      .lte("srs_state.next_review_at", nowSeconds)
      .eq("srs_state.mastered", false)
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
    .lte("next_review_at", nowSeconds)
    .eq("mastered", false);
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
