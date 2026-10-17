import { test } from "node:test";
import assert from "node:assert/strict";
import { matchesTarget, resolveDeterministic } from "./deterministicGrading";
import { normalize } from "./normalize";
import { SKIPPED_ANSWER } from "./skippedAnswer";
import type { Question } from "./types";

const word = { simplified: "个", traditional: "個", pinyin: "gè", meanings: ["piece"] };

function question(overrides: Partial<Question> = {}): Question {
  return { type: "gloss_to_word", prompt: "p", target_word: "个", context: "", accepted_answers: ["只"], ...overrides };
}

test("target and accepted answers match", () => {
  assert.equal(matchesTarget(question(), normalize("个")), true);
  assert.equal(matchesTarget(question(), normalize("只")), true);
  assert.equal(matchesTarget(question(), normalize("人")), false);
});

test("traditional form matches when provided", () => {
  assert.equal(matchesTarget(question(), normalize("個"), "個"), true);
  assert.equal(matchesTarget(question(), normalize("個")), false);
});

test("en_to_zh never matches deterministically", () => {
  assert.equal(matchesTarget(question({ type: "en_to_zh" }), normalize("个")), false);
});

test("deterministic resolution marks a match correct", () => {
  assert.equal(resolveDeterministic(word, question(), normalize("個"))?.correct, true);
});

test("deterministic resolution defers unknown answers", () => {
  assert.equal(resolveDeterministic(word, question(), normalize("人")), null);
});

test("skipped answers are wrong", () => {
  assert.equal(resolveDeterministic(word, question(), SKIPPED_ANSWER)?.correct, false);
});

test("tone_pick only accepts the listed pinyin", () => {
  const tone = question({ type: "tone_pick", accepted_answers: ["gè"], options: ["gè", "gē"] });
  assert.equal(resolveDeterministic(word, tone, normalize("gè"))?.correct, true);
  assert.equal(resolveDeterministic(word, tone, normalize("gē"))?.correct, false);
});
