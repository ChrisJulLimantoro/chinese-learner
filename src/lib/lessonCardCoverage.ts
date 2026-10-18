import { pinyinKey } from "./pinyin";
import type { LessonCard, Reading } from "./types";

type Card = LessonCard | null | undefined;

function exampleReadings(card: LessonCard): Set<string> {
  return new Set(card.examples.flatMap((e) => (e.reading ? [pinyinKey(e.reading)] : [])));
}

export function missingExampleReadings(card: LessonCard, readings: Reading[]): string[] {
  const covered = exampleReadings(card);
  return readings.map((r) => r.pinyin).filter((p) => !covered.has(pinyinKey(p)));
}

function hasTaggedExamples(card: LessonCard): boolean {
  return card.examples.some((e) => Boolean(e.reading));
}

export function needsReadingExamples(card: Card, readings: Reading[]): boolean {
  return Boolean(card) && readings.length > 1 && !hasTaggedExamples(card!);
}
