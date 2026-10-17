import { shuffle } from "./scramble";

const TONE_MARKS: Record<string, string> = {
  a: "āáǎà",
  e: "ēéěè",
  i: "īíǐì",
  o: "ōóǒò",
  u: "ūúǔù",
  ü: "ǖǘǚǜ",
};
const NEUTRAL_TONE = 5;
const TONES = [1, 2, 3, 4, NEUTRAL_TONE];
const VOWEL_RUN = new RegExp(`([aeiouü${Object.values(TONE_MARKS).join("")}]+)`);
const MARKED = new Map(
  Object.entries(TONE_MARKS).flatMap(([base, marks]) =>
    Array.from(marks).map((mark, i) => [mark, { base, tone: i + 1 }] as const)
  )
);

export type ParsedPinyin = { fillers: string[]; nuclei: string[] };
type ToneChange = [index: number, tone: number];

export function parsePinyin(pinyin: string): ParsedPinyin {
  const parts = pinyin.split(VOWEL_RUN);
  return { fillers: parts.filter((_, i) => i % 2 === 0), nuclei: parts.filter((_, i) => i % 2 === 1) };
}

function joinPinyin({ fillers, nuclei }: ParsedPinyin): string {
  return fillers.map((filler, i) => filler + (nuclei[i] ?? "")).join("");
}

function stripTones(nucleus: string): string {
  return Array.from(nucleus).map((c) => MARKED.get(c)?.base ?? c).join("");
}

export function toneOf(nucleus: string): number {
  const marked = Array.from(nucleus).map((c) => MARKED.get(c)?.tone);
  return marked.find((tone) => tone !== undefined) ?? NEUTRAL_TONE;
}

function markIndex(plain: string): number {
  if (plain.includes("a")) return plain.indexOf("a");
  if (plain.includes("e")) return plain.indexOf("e");
  if (plain.includes("ou")) return plain.indexOf("o");
  return plain.length - 1;
}

export function withTone(nucleus: string, tone: number): string {
  const plain = stripTones(nucleus);
  if (tone === NEUTRAL_TONE) return plain;
  const at = markIndex(plain);
  return plain.slice(0, at) + TONE_MARKS[plain[at]][tone - 1] + plain.slice(at + 1);
}

export function pinyinKey(pinyin: string): string {
  return pinyin.toLowerCase().replace(/[\s']+/g, "");
}

function otherTones(nucleus: string): number[] {
  return TONES.filter((tone) => tone !== toneOf(nucleus));
}

function singleChanges(parsed: ParsedPinyin): ToneChange[][] {
  return parsed.nuclei.flatMap((n, i) => otherTones(n).map((tone): ToneChange[] => [[i, tone]]));
}

function changesAt(parsed: ParsedPinyin, i: number, j: number): ToneChange[][] {
  const lefts = otherTones(parsed.nuclei[i]);
  return lefts.flatMap((a) => otherTones(parsed.nuclei[j]).map((b): ToneChange[] => [[i, a], [j, b]]));
}

function pairChanges(parsed: ParsedPinyin): ToneChange[][] {
  const indexes = parsed.nuclei.map((_, i) => i);
  return indexes.flatMap((i) => indexes.slice(i + 1).flatMap((j) => changesAt(parsed, i, j)));
}

function applyChanges(parsed: ParsedPinyin, changes: ToneChange[]): string {
  const nuclei = [...parsed.nuclei];
  changes.forEach(([i, tone]) => (nuclei[i] = withTone(nuclei[i], tone)));
  return joinPinyin({ ...parsed, nuclei });
}

export function toneDistractors(
  pinyin: string,
  readings: string[],
  random: () => number = Math.random,
  count: number = 3
): string[] {
  const parsed = parsePinyin(pinyin);
  const excluded = new Set([pinyin, ...readings].map(pinyinKey));
  const changes = [...shuffle(singleChanges(parsed), random), ...shuffle(pairChanges(parsed), random)];
  const unique = new Map(changes.map((c) => applyChanges(parsed, c)).map((p) => [pinyinKey(p), p]));
  return [...unique].filter(([key]) => !excluded.has(key)).slice(0, count).map(([, p]) => p);
}
