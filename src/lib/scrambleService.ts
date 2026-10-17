import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "./supabase/admin";
import { getProfile, recordStudyActivity } from "./services";
import { rescheduleFromRecognition } from "./srs";
import {
  BOARD_SIZE,
  isScrambleLength,
  formableWords,
  orderCandidates,
  pickSeedWords,
  pointsFor,
  shortMeaning,
  shuffleTiles,
  withMeaningOptions,
} from "./scramble";
import type { IndexedWord, ScrambleBoard, SrsSnapshot, WordChoice, WordResult } from "./scramble";

const PAGE_SIZE = 1000;
const MAX_RESULTS = 60;
const INDEX_REVALIDATE_SECONDS = 86_400;
const WORD_COLUMNS = "id, simplified, pinyin, hsk_level, meanings, pos";

type WordRow = { id: number; simplified: string; pinyin: string; hsk_level: number; meanings: string[] | null; pos: string[] | null };

function toIndexedWord(row: WordRow): IndexedWord {
  return {
    id: row.id,
    simplified: row.simplified,
    pinyin: row.pinyin,
    meaning: shortMeaning(row.meanings ?? []),
    level: row.hsk_level,
    pos: row.pos ?? [],
  };
}

async function fetchWordPage(supabase: SupabaseClient, level: number, from: number): Promise<WordRow[]> {
  const { data } = await supabase
    .from("words")
    .select(WORD_COLUMNS)
    .lte("hsk_level", level)
    .order("id")
    .range(from, from + PAGE_SIZE - 1);
  return (data ?? []) as WordRow[];
}

async function fetchIndexWords(level: number): Promise<IndexedWord[]> {
  const supabase = createAdminClient();
  const rows: WordRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const page = await fetchWordPage(supabase, level, from);
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows.map(toIndexedWord).filter((w) => isScrambleLength(w.simplified) && w.meaning);
}

const cachedIndexWords = unstable_cache(fetchIndexWords, ["scramble-index-words"], {
  revalidate: INDEX_REVALIDATE_SECONDS,
  tags: ["words"],
});

async function fetchSrsPage(supabase: SupabaseClient, userId: string, from: number): Promise<SrsSnapshot[]> {
  const { data } = await supabase
    .from("srs_state")
    .select("word_id, next_review_at, mastered")
    .eq("user_id", userId)
    .order("word_id")
    .range(from, from + PAGE_SIZE - 1);
  return (data ?? []) as SrsSnapshot[];
}

async function fetchSrsSnapshots(supabase: SupabaseClient, userId: string): Promise<SrsSnapshot[]> {
  const rows: SrsSnapshot[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const page = await fetchSrsPage(supabase, userId, from);
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

function buildBoard(index: IndexedWord[], srs: SrsSnapshot[], level: number) {
  const ordered = orderCandidates(index, srs, Date.now() / 1000, level);
  const seededWords = pickSeedWords(ordered, BOARD_SIZE);
  const tiles = shuffleTiles(seededWords);
  const seeded = seededWords.map((w) => w.id);
  const formable = formableWords(index, tiles, new Set(seeded));
  return { tiles, seeded, words: withMeaningOptions(formable, index) };
}

async function insertActiveRun(
  supabase: SupabaseClient,
  userId: string,
  board: Omit<ScrambleBoard, "runId">
): Promise<number> {
  const row = { user_id: userId, status: "active", tiles: board.tiles, seeded: board.seeded, formable: board.words.map((w) => w.id) };
  const { data, error } = await supabase.from("scramble_runs").insert(row).select("id").single();
  if (error) throw new Error(`Failed to start scramble: ${error.message}`);
  return data.id as number;
}

export async function startScramble(supabase: SupabaseClient, userId: string): Promise<ScrambleBoard> {
  const profile = await getProfile(supabase, userId);
  const level = profile.current_hsk_level;
  const [index, srs] = await Promise.all([cachedIndexWords(level), fetchSrsSnapshots(supabase, userId)]);
  const board = buildBoard(index, srs, level);
  return { runId: await insertActiveRun(supabase, userId, board), ...board };
}

function firstChoicePerWord(choices: WordChoice[]): WordChoice[] {
  const byWord = new Map<number, WordChoice>();
  choices.filter((c) => Number.isInteger(c.wordId)).slice(0, MAX_RESULTS).forEach((c) => byWord.has(c.wordId) || byWord.set(c.wordId, c));
  return [...byWord.values()];
}

function gradeChoices(choices: WordChoice[], words: Map<number, WordRow>): WordResult[] {
  return choices.map((c) => ({ wordId: c.wordId, correct: shortMeaning(words.get(c.wordId)!.meanings ?? []) === c.meaning }));
}

async function loadActiveRun(supabase: SupabaseClient, userId: string, runId: number): Promise<Set<number>> {
  const { data } = await supabase.from("scramble_runs").select("status, formable").eq("id", runId).eq("user_id", userId).single();
  if (!data || data.status !== "active") throw new Error("Scramble run is not active.");
  return new Set((data.formable ?? []) as number[]);
}

async function fetchResultWords(supabase: SupabaseClient, wordIds: number[]): Promise<Map<number, WordRow>> {
  const { data } = await supabase.from("words").select(WORD_COLUMNS).in("id", wordIds);
  return new Map(((data ?? []) as WordRow[]).map((w) => [w.id, w]));
}

function scoreOf(results: WordResult[], words: Map<number, WordRow>): number {
  return results.reduce((sum, r) => sum + (r.correct ? pointsFor(words.get(r.wordId)!.simplified) : 0), 0);
}

async function completeRun(supabase: SupabaseClient, userId: string, runId: number, score: number, found: WordResult[]): Promise<void> {
  const { data } = await supabase
    .from("scramble_runs")
    .update({ status: "completed", score, found })
    .eq("id", runId)
    .eq("user_id", userId)
    .eq("status", "active")
    .select("id");
  if (!data?.length) throw new Error("Scramble run is not active.");
}

export async function submitScramble(
  supabase: SupabaseClient,
  userId: string,
  runId: number,
  submitted: WordChoice[]
): Promise<{ score: number }> {
  const formable = await loadActiveRun(supabase, userId, runId);
  const choices = firstChoicePerWord(submitted).filter((c) => formable.has(c.wordId));
  const words = await fetchResultWords(supabase, choices.map((c) => c.wordId));
  const results = gradeChoices(choices, words);
  const score = scoreOf(results, words);
  await completeRun(supabase, userId, runId, score, results);
  await rescheduleFromRecognition(supabase, userId, results);
  await recordStudyActivity(supabase, userId);
  return { score };
}
