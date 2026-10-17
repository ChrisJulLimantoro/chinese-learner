import { toneDistractors } from "./pinyin";
import { shortMeaning, shuffle } from "./scramble";
import type { Question, Word } from "./types";

const OPTION_COUNT = 4;

export function buildToneQuestion(word: Word, random: () => number = Math.random): Question | null {
  const readings = word.readings.map((r) => r.pinyin);
  const distractors = toneDistractors(word.pinyin, readings, random, OPTION_COUNT - 1, word.simplified);
  if (distractors.length < OPTION_COUNT - 1) return null;
  return toneQuestionOf(word, shuffle([word.pinyin, ...distractors], random));
}

function toneQuestionOf(word: Word, options: string[]): Question {
  const meaning = shortMeaning(word.meanings);
  return {
    type: "tone_pick",
    prompt: `${word.simplified} — ${meaning}`,
    target_word: word.simplified,
    context: meaning,
    options,
    accepted_answers: [word.pinyin],
  };
}
