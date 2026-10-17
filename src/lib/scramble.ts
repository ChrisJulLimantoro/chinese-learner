import { DRILL_TIMER_SECONDS } from "./config";

export const BOARD_SIZE = 50;
export const MAX_WORD_LENGTH = 3;
export const SCRAMBLE_SECONDS = DRILL_TIMER_SECONDS;
const OPTION_COUNT = 4;
const POINTS_BY_LENGTH = [0, 5, 20, 40];

export type IndexedWord = { id: number; simplified: string; pinyin: string; meaning: string; level: number; pos: string[] };
export type Tile = { id: number; char: string };
export type ScrambleBoard = { tiles: Tile[]; index: IndexedWord[]; seeded: number[] };
export type WordResult = { wordId: number; correct: boolean };
export type SrsSnapshot = { word_id: number; next_review_at: number; mastered: boolean };

export function isScrambleLength(simplified: string): boolean {
  return simplified.length >= 1 && simplified.length <= MAX_WORD_LENGTH;
}

export function shortMeaning(meanings: string[]): string {
  return meanings.slice(0, 2).join("; ");
}

export function pointsFor(simplified: string): number {
  return POINTS_BY_LENGTH[simplified.length] ?? 0;
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

const STOPWORDS = new Set(["the", "and", "for", "one", "sth", "sb", "etc", "not", "with", "from", "into"]);
const MIN_TOKEN_LENGTH = 3;

export type DistractorPools = {
  byLevelPos: Map<string, IndexedWord[]>;
  byLevel: Map<number, IndexedWord[]>;
  all: IndexedWord[];
  tokens: Map<number, Set<string>>;
};

export function meaningTokens(meaning: string): Set<string> {
  const words = meaning.toLowerCase().split(/[^a-z]+/);
  return new Set(words.filter((w) => w.length >= MIN_TOKEN_LENGTH && !STOPWORDS.has(w)));
}

function posKey(level: number, pos: string): string {
  return `${level}|${pos}`;
}

function pushTo<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  const bucket = map.get(key) ?? [];
  bucket.push(value);
  map.set(key, bucket);
}

export function buildDistractorPools(words: IndexedWord[]): DistractorPools {
  const pools: DistractorPools = { byLevelPos: new Map(), byLevel: new Map(), all: words, tokens: new Map() };
  words.forEach((w) => {
    pushTo(pools.byLevel, w.level, w);
    w.pos.forEach((p) => pushTo(pools.byLevelPos, posKey(w.level, p), w));
    pools.tokens.set(w.id, meaningTokens(w.meaning));
  });
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

function tokensOf(word: IndexedWord, pools: DistractorPools): Set<string> {
  return pools.tokens.get(word.id) ?? meaningTokens(word.meaning);
}

function sharesToken(a: Set<string>, b: Set<string>): boolean {
  return [...a].some((token) => b.has(token));
}

function isValidDistractor(candidate: IndexedWord, word: IndexedWord, pools: DistractorPools, chosen: Set<string>): boolean {
  if (candidate.simplified === word.simplified || chosen.has(candidate.meaning)) return false;
  return !sharesToken(tokensOf(candidate, pools), tokensOf(word, pools));
}

function distractorTiers(word: IndexedWord, pools: DistractorPools): IndexedWord[][] {
  const samePos = word.pos.flatMap((p) => pools.byLevelPos.get(posKey(word.level, p)) ?? []);
  return [samePos, pools.byLevel.get(word.level) ?? [], pools.all];
}

function fillFromTier(chosen: Set<string>, tier: IndexedWord[], word: IndexedWord, pools: DistractorPools, random: () => number): void {
  for (const candidate of shuffle(tier, random)) {
    if (chosen.size >= OPTION_COUNT) return;
    if (isValidDistractor(candidate, word, pools, chosen)) chosen.add(candidate.meaning);
  }
}

function collectDistractors(word: IndexedWord, pools: DistractorPools, random: () => number): Set<string> {
  const chosen = new Set<string>([word.meaning]);
  distractorTiers(word, pools).forEach((tier) => fillFromTier(chosen, tier, word, pools, random));
  return chosen;
}

export function meaningOptions(word: IndexedWord, pools: DistractorPools, random: () => number = Math.random): string[] {
  return shuffle([...collectDistractors(word, pools, random)], random);
}
