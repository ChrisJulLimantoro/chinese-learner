import { normalize } from "./normalize";
import { SKIPPED_ANSWER } from "./skippedAnswer";
import { templateVerdict } from "./gradeVerdicts";
import type { WordFacts } from "./gradeVerdicts";
import type { GraderOutput, Question } from "./types";

export function matchesTarget(question: Question, normalized: string, traditional?: string | null): boolean {
  if (question.type === "en_to_zh") return false;
  return acceptedTargets(question, traditional).some((a) => normalize(a) === normalized);
}

function acceptedTargets(question: Question, traditional?: string | null): string[] {
  const accepted = question.accepted_answers ?? [];
  if (question.type === "tone_pick") return accepted;
  return [question.target_word, ...accepted, ...(traditional ? [traditional] : [])];
}

export function resolveDeterministic(word: WordFacts, question: Question, normalized: string): GraderOutput | null {
  if (normalized === SKIPPED_ANSWER) return templateVerdict(word, false, normalized);
  if (question.type === "tone_pick") return templateVerdict(word, matchesTarget(question, normalized, word.traditional), normalized);
  if (matchesTarget(question, normalized, word.traditional)) return templateVerdict(word, true, normalized);
  return null;
}
