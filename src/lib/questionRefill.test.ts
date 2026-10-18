import { test } from "node:test";
import assert from "node:assert/strict";
import { QUESTIONS_FLOOR, QUESTIONS_PER_FILL, QUESTIONS_PER_WORD } from "./config";
import { needsGeneration, requiredTypes, wantedCount } from "./questionRefill";

test("below floor always generates", () => {
  assert.equal(needsGeneration({ bank_size: QUESTIONS_FLOOR - 1, exhausted: false }), true);
});

test("between floor and cap generates only when exhausted", () => {
  assert.equal(needsGeneration({ bank_size: QUESTIONS_FLOOR, exhausted: false }), false);
  assert.equal(needsGeneration({ bank_size: QUESTIONS_FLOOR, exhausted: true }), true);
});

test("at cap never generates", () => {
  assert.equal(needsGeneration({ bank_size: QUESTIONS_PER_WORD, exhausted: true }), false);
});

test("wanted count is capped by remaining room", () => {
  assert.equal(wantedCount(0), QUESTIONS_PER_FILL);
  assert.equal(wantedCount(QUESTIONS_PER_WORD - 1), 1);
});

test("required types favour preferred types lacking from type_counts", () => {
  const stats = { bank_size: 6, type_counts: { gloss_to_word: 3, synonym_discrim: 3 }, exhausted: true };
  assert.equal(requiredTypes(stats, ["gloss_to_word", "cloze"])[0], "cloze");
});

test("required types count its own picks", () => {
  const stats = { bank_size: 0, type_counts: {}, exhausted: true };
  const types = requiredTypes(stats, ["cloze"]);
  assert.equal(types.length, QUESTIONS_PER_FILL);
  assert.ok(types.every((t) => t === "cloze"));
});
