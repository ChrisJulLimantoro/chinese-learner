import type { GraderOutput, Question, Word } from "./types";

export type WordFacts = Pick<Word, "simplified" | "pinyin" | "meanings">;

function describeWord(word: WordFacts): string {
  return `${word.simplified} (${word.pinyin}) — ${word.meanings.slice(0, 2).join("; ")}`;
}

export function templateFeedback(word: WordFacts, correct: boolean): string {
  return correct ? `Correct. ${describeWord(word)}` : `Answer: ${describeWord(word)}`;
}

function verdict(correct: boolean, naturalness: number, normalized: string, feedback: string): GraderOutput {
  return {
    correct,
    naturalness,
    normalized_answer: normalized,
    feedback,
    issues: [],
    confused_with: null,
    accept_for_cache: false,
  };
}

export function templateVerdict(word: WordFacts, correct: boolean, normalized: string): GraderOutput {
  return verdict(correct, correct ? 5 : 1, normalized, templateFeedback(word, correct));
}

export function selfGradeVerdict(question: Question, word: WordFacts, normalized: string): GraderOutput {
  const reference = question.reference_answer ?? describeWord(word);
  const feedback = `Model answer: ${reference}`;
  return { ...verdict(false, 3, normalized, feedback), self_grade: true, reference_answer: reference };
}
