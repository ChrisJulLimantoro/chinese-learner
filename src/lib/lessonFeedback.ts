import { normalize } from "./normalize";
import type { LessonCard } from "./types";

type Card = LessonCard | null | undefined;
type Synonym = LessonCard["near_synonyms"][number];

export function findNearSynonym(card: Card, normalized: string): Synonym | null {
  return card?.near_synonyms?.find((s) => normalize(s.word) === normalized) ?? null;
}

export function synonymExplanation(synonym: Synonym): string {
  return `You wrote ${synonym.word} (${synonym.pinyin}), a near synonym: ${synonym.distinction}`;
}

function exampleLine(card: Card): string[] {
  const example = card?.examples?.[0];
  return example ? [`e.g. ${example.hanzi} (${example.pinyin}) — ${example.gloss}`] : [];
}

function mistakeLine(card: Card): string[] {
  const mistake = card?.common_mistakes?.[0];
  return mistake ? [`Watch out: ${mistake}`] : [];
}

export function wrongExtras(card: Card): string[] {
  return [...exampleLine(card), ...mistakeLine(card)];
}

export function correctExtras(card: Card): string[] {
  return exampleLine(card);
}
