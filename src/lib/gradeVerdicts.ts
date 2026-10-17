import { correctExtras, findNearSynonym, synonymExplanation, wrongExtras } from "./lessonFeedback";
import type { GraderOutput, LessonCard, Question, Word } from "./types";

export type WordFacts = Pick<Word, "simplified" | "pinyin" | "meanings"> & { lesson_card?: LessonCard | null };

function describeWord(word: WordFacts): string {
  return `${word.simplified} (${word.pinyin}) — ${word.meanings.slice(0, 2).join("; ")}`;
}

function baseFeedback(word: WordFacts, correct: boolean): string {
  return correct ? `Correct. ${describeWord(word)}` : `Answer: ${describeWord(word)}`;
}

function extraLines(word: WordFacts, correct: boolean, normalized: string): string[] {
  if (correct) return correctExtras(word.lesson_card);
  const synonym = findNearSynonym(word.lesson_card, normalized);
  return synonym ? [synonymExplanation(synonym)] : wrongExtras(word.lesson_card);
}

export function templateFeedback(word: WordFacts, correct: boolean, normalized: string): string {
  return [baseFeedback(word, correct), ...extraLines(word, correct, normalized)].join(" ");
}

function verdict(
  correct: boolean,
  naturalness: number,
  normalized: string,
  feedback: string,
  confusedWith: string | null = null
): GraderOutput {
  return {
    correct,
    naturalness,
    normalized_answer: normalized,
    feedback,
    issues: [],
    confused_with: confusedWith,
    accept_for_cache: false,
  };
}

export function templateVerdict(word: WordFacts, correct: boolean, normalized: string): GraderOutput {
  const confusedWith = correct ? null : (findNearSynonym(word.lesson_card, normalized)?.word ?? null);
  return verdict(correct, correct ? 5 : 1, normalized, templateFeedback(word, correct, normalized), confusedWith);
}

export function selfGradeVerdict(question: Question, word: WordFacts, normalized: string): GraderOutput {
  const reference = question.reference_answer ?? describeWord(word);
  const feedback = `Model answer: ${reference}`;
  return { ...verdict(false, 3, normalized, feedback), self_grade: true, reference_answer: reference };
}
