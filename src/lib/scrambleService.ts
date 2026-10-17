import type { SupabaseClient } from "@supabase/supabase-js";
import { getProfile, recordStudyActivity } from "./services";
import { rescheduleFromRecognition } from "./srs";
import {
  BOARD_SIZE,
  isScrambleLength,
  orderCandidates,
  pickSeedWords,
  pointsFor,
  shortMeaning,
  shuffleTiles,
} from "./scramble";
import type { IndexedWord, ScrambleBoard, SrsSnapshot, WordResult } from "./scramble";

const PAGE_SIZE = 1000;
const MAX_RESULTS = 60;
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

async function fetchIndexWords(supabase: SupabaseClient, level: number): Promise<IndexedWord[]> {
  const rows: WordRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const page = await fetchWordPage(supabase, level, from);
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows.map(toIndexedWord).filter((w) => isScrambleLength(w.simplified) && w.meaning);
}

async function fetchSrsSnapshots(supabase: SupabaseClient, userId: string, wordIds?: number[]): Promise<SrsSnapshot[]> {
  let query = supabase.from("srs_state").select("word_id, next_review_at, mastered").eq("user_id", userId);
  if (wordIds) query = query.in("word_id", wordIds);
  const { data } = await query.limit(PAGE_SIZE);
  return (data ?? []) as SrsSnapshot[];
}

export async function startScramble(supabase: SupabaseClient, userId: string): Promise<ScrambleBoard> {
  const profile = await getProfile(supabase, userId);
  const [index, srs] = await Promise.all([
    fetchIndexWords(supabase, profile.current_hsk_level),
    fetchSrsSnapshots(supabase, userId),
  ]);
  const ordered = orderCandidates(index, srs, Date.now() / 1000, profile.current_hsk_level);
  const seededWords = pickSeedWords(ordered, BOARD_SIZE);
  return { tiles: shuffleTiles(seededWords), index, seeded: seededWords.map((w) => w.id) };
}

function firstResultPerWord(results: WordResult[]): WordResult[] {
  const byWord = new Map<number, WordResult>();
  results.filter((r) => Number.isInteger(r.wordId)).slice(0, MAX_RESULTS).forEach((r) => byWord.has(r.wordId) || byWord.set(r.wordId, r));
  return [...byWord.values()];
}

async function fetchScopeWords(supabase: SupabaseClient, wordIds: number[], level: number): Promise<Map<number, WordRow>> {
  const { data } = await supabase.from("words").select(WORD_COLUMNS).in("id", wordIds).lte("hsk_level", level);
  const rows = ((data ?? []) as WordRow[]).filter((w) => isScrambleLength(w.simplified));
  return new Map(rows.map((w) => [w.id, w]));
}

function scoreOf(results: WordResult[], words: Map<number, WordRow>): number {
  return results.reduce((sum, r) => sum + (r.correct ? pointsFor(words.get(r.wordId)!.simplified) : 0), 0);
}

export async function submitScramble(
  supabase: SupabaseClient,
  userId: string,
  submitted: WordResult[]
): Promise<{ score: number }> {
  const profile = await getProfile(supabase, userId);
  const unique = firstResultPerWord(submitted);
  const words = await fetchScopeWords(supabase, unique.map((r) => r.wordId), profile.current_hsk_level);
  const results = unique.filter((r) => words.has(r.wordId));
  await rescheduleFromRecognition(supabase, userId, results);
  await recordStudyActivity(supabase, userId);
  const score = scoreOf(results, words);
  await supabase.from("scramble_runs").insert({ user_id: userId, score, found: results });
  return { score };
}
