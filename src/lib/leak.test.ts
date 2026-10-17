import { test } from "node:test";
import assert from "node:assert/strict";
import { isUsableQuestion } from "./llm";
import type { Question } from "./types";

function cloze(prompt: string, helperWords: string[] = []): Question {
  return {
    type: "cloze",
    prompt,
    target_word: "人",
    context: "",
    context_helpers: helperWords.map((word) => ({ word, gloss: "x" })),
    accepted_answers: [],
  };
}

test("single-char target inside a helper word is not a leak", () => {
  assert.equal(isUsableQuestion(cloze("别___说话，大人在睡觉。", ["大人"]), { simplified: "人" }), true);
});

test("single-char target standing alone in the prompt is a leak", () => {
  assert.equal(isUsableQuestion(cloze("这个人___在睡觉。", ["大人"]), { simplified: "人" }), false);
});

test("single-char target as a helper word is a leak", () => {
  assert.equal(isUsableQuestion(cloze("___在睡觉。", ["人"]), { simplified: "人" }), false);
});

test("multi-char target keeps the substring check", () => {
  const q = { ...cloze("他在学习___。"), target_word: "学习" };
  assert.equal(isUsableQuestion(q, { simplified: "学习" }), false);
});
