import { DRILL_TIMER_SECONDS } from "./config";

export const BOARD_SIZE = 50;
export const MAX_WORD_LENGTH = 3;
export const SCRAMBLE_SECONDS = DRILL_TIMER_SECONDS;
const OPTION_COUNT = 4;
const POINTS_PER_CHAR = 10;
const MAX_PICK_ATTEMPTS = 50;

export type IndexedWord = { id: number; simplified: string; pinyin: string; meaning: string; level: number };
export type Tile = { id: number; char: string };
export type ScrambleBoard = { tiles: Tile[]; index: IndexedWord[] };
export type WordResult = { wordId: number; correct: boolean };
export type SrsSnapshot = { word_id: number; next_review_at: number; mastered: boolean };

export function isScrambleLength(simplified: string): boolean {
  return simplified.length >= 1 && simplified.length <= MAX_WORD_LENGTH;
}

export function shortMeaning(meanings: string[]): string {
  return meanings.slice(0, 2).join("; ");
}

export function pointsFor(simplified: string): number {
  return simplified.length * POINTS_PER_CHAR;
}

function swap<T>(items: T[], i: number, j: number): void {
  [items[i], items[j]] = [items[j], items[i]];
}

export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) swap(copy, i, Math.floor(random() * (i + 1)));
  return copy;
}

export function buildWordIndex(words: IndexedWord[]): Map<string, IndexedWord> {
  const index = new Map<string, IndexedWord>();
  words.forEach((w) => index.has(w.simplified) || index.set(w.simplified, w));
  return index;
}

export function levelPools(words: IndexedWord[]): Map<number, IndexedWord[]> {
  const pools = new Map<number, IndexedWord[]>();
  words.forEach((w) => (pools.get(w.level) ?? pools.set(w.level, []).get(w.level)!).push(w));
  return pools;
}

export function orderCandidates(words: IndexedWord[], srs: SrsSnapshot[], nowSeconds: number, level: number): IndexedWord[] {
  const srsById = new Map(srs.map((s) => [s.word_id, s]));
  const isDue = (w: IndexedWord) => isDueRow(srsById.get(w.id), nowSeconds);
  const due = words.filter(isDue);
  const seen = words.filter((w) => srsById.has(w.id) && !isDue(w));
  const unseen = words.filter((w) => !srsById.has(w.id) && w.level === level);
  return [...shuffle(due), ...shuffle(seen), ...shuffle(unseen)];
}

export function isDueRow(row: SrsSnapshot | undefined, nowSeconds: number): boolean {
  return Boolean(row) && !row!.mastered && row!.next_review_at <= nowSeconds;
}

type SeedState = { picked: IndexedWord[]; remaining: number };

function takeIfFits(state: SeedState, word: IndexedWord): SeedState {
  const length = word.simplified.length;
  if (length > state.remaining) return state;
  state.picked.push(word);
  state.remaining -= length;
  return state;
}

export function pickSeedWords(ordered: IndexedWord[], size: number = BOARD_SIZE): IndexedWord[] {
  return ordered.reduce(takeIfFits, { picked: [], remaining: size }).picked;
}

export function shuffleTiles(words: IndexedWord[]): Tile[] {
  const chars = words.flatMap((w) => Array.from(w.simplified));
  return shuffle(chars.map((char, id) => ({ id, char })));
}

function randomEntry<T>(pool: T[], random: () => number): T {
  return pool[Math.floor(random() * pool.length)];
}

function collectDistractors(word: IndexedWord, pool: IndexedWord[], random: () => number): Set<string> {
  const meanings = new Set<string>([word.meaning]);
  for (let tries = 0; meanings.size < OPTION_COUNT && tries < MAX_PICK_ATTEMPTS; tries++) {
    meanings.add(randomEntry(pool, random).meaning);
  }
  return meanings;
}

export function meaningOptions(word: IndexedWord, pool: IndexedWord[], random: () => number = Math.random): string[] {
  if (pool.length === 0) return [word.meaning];
  return shuffle([...collectDistractors(word, pool, random)], random);
}
