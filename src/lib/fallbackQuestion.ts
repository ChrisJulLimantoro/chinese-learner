import { USE_STUB } from "./config";
import { stubQuestions } from "./llm";
import { shortMeaning } from "./scramble";
import { buildToneQuestion } from "./toneQuestion";
import type { Question, Word } from "./types";

function leakFreeMeanings(word: Word): string[] {
  const clean = word.meanings.filter((m) => !m.includes(word.simplified));
  return clean.length > 0 ? clean : word.meanings;
}

export function buildGlossQuestion(word: Word): Question {
  const meaning = shortMeaning(leakFreeMeanings(word));
  return {
    type: "gloss_to_word",
    prompt: `Type the Mandarin word that means: ${meaning}`,
    target_word: word.simplified,
    context: meaning,
    target_hint: `${word.simplified} (${word.pinyin})`,
    accepted_answers: [],
  };
}

function lastResortQuestion(word: Word): Question {
  return USE_STUB ? stubQuestions([word])[0] : buildGlossQuestion(word);
}

export function fallbackQuestion(word: Word, random: () => number = Math.random): Question {
  return buildToneQuestion(word, random) ?? lastResortQuestion(word);
}
