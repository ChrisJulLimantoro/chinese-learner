import type { Reading } from "./types";

type SoundSource = { simplified: string; readings: Reading[] };
export type SoundIndex = { syllablesByChar: Map<string, Set<string>>; charsBySyllable: Map<string, Map<string, number>> };

function syllables(pinyin: string): string[] {
  return pinyin.trim().toLowerCase().split(/\s+/);
}

function alignedPairs(simplified: string, pinyin: string): [string, string][] {
  const chars = Array.from(simplified);
  const sounds = syllables(pinyin);
  return chars.length === sounds.length ? chars.map((c, i) => [c, sounds[i]]) : [];
}

function recordPair(index: SoundIndex, [char, syllable]: [string, string]): void {
  index.syllablesByChar.set(char, (index.syllablesByChar.get(char) ?? new Set()).add(syllable));
  const counts = index.charsBySyllable.get(syllable) ?? new Map<string, number>();
  index.charsBySyllable.set(syllable, counts.set(char, (counts.get(char) ?? 0) + 1));
}

export function buildSoundIndex(words: SoundSource[]): SoundIndex {
  const index: SoundIndex = { syllablesByChar: new Map(), charsBySyllable: new Map() };
  const pairs = words.flatMap((w) => w.readings.flatMap((r) => alignedPairs(w.simplified, r.pinyin)));
  pairs.forEach((pair) => recordPair(index, pair));
  return index;
}

function isPolyphone(index: SoundIndex, char: string): boolean {
  return (index.syllablesByChar.get(char)?.size ?? 0) > 1;
}

export function homophoneFor(index: SoundIndex, syllable: string, exclude: string): string | null {
  const candidates = [...(index.charsBySyllable.get(syllable) ?? [])];
  const unambiguous = candidates.filter(([char]) => char !== exclude && !isPolyphone(index, char));
  return unambiguous.reduce<[string, number] | null>((best, c) => (!best || c[1] > best[1] ? c : best), null)?.[0] ?? null;
}

function spokenChar(index: SoundIndex, [char, syllable]: [string, string]): string {
  return isPolyphone(index, char) ? (homophoneFor(index, syllable, char) ?? char) : char;
}

export function spokenText(index: SoundIndex, simplified: string, pinyin: string): string {
  const pairs = alignedPairs(simplified, pinyin);
  return pairs.length > 0 ? pairs.map((pair) => spokenChar(index, pair)).join("") : simplified;
}

export function withSpokenReadings<T extends SoundSource>(index: SoundIndex, word: T): T {
  if (word.readings.length < 2) return word;
  const readings = word.readings.map((r) => ({ ...r, spoken: spokenText(index, word.simplified, r.pinyin) }));
  return { ...word, readings };
}
