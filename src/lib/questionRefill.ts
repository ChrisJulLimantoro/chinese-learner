import { MIN_PER_PREFERRED_TYPE, QUESTIONS_FLOOR, QUESTIONS_PER_FILL, QUESTIONS_PER_WORD } from "./config";
import { QUESTION_TYPES } from "./llm";
import type { QuestionType } from "./questionBoxes";

export type PoolStats = { bank_size: number; type_counts: Record<string, number>; exhausted: boolean };

const LLM_TYPES = new Set<QuestionType>(QUESTION_TYPES);

export function needsGeneration(stats: Pick<PoolStats, "bank_size" | "exhausted">): boolean {
  if (stats.bank_size >= QUESTIONS_PER_WORD) return false;
  return stats.bank_size < QUESTIONS_FLOOR || stats.exhausted;
}

export function wantedCount(bankSize: number): number {
  return Math.min(QUESTIONS_PER_FILL, QUESTIONS_PER_WORD - bankSize);
}

function nextRequiredType(counts: Map<QuestionType, number>, size: number, preferred: QuestionType[]): QuestionType {
  const lacking = (t: QuestionType) => LLM_TYPES.has(t) && (counts.get(t) ?? 0) < MIN_PER_PREFERRED_TYPE;
  return preferred.find(lacking) ?? rotation(preferred)[size % rotation(preferred).length];
}

function rotation(preferred: QuestionType[]): QuestionType[] {
  const generatable = preferred.filter((t) => LLM_TYPES.has(t));
  return generatable.length > 0 ? generatable : QUESTION_TYPES;
}

export function requiredTypes(stats: PoolStats, preferred: QuestionType[]): QuestionType[] {
  const counts = new Map(Object.entries(stats.type_counts) as [QuestionType, number][]);
  return Array.from({ length: wantedCount(stats.bank_size) }, (_, i) => {
    const type = nextRequiredType(counts, stats.bank_size + i, preferred);
    counts.set(type, (counts.get(type) ?? 0) + 1);
    return type;
  });
}
