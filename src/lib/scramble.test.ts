import { test } from "node:test";
import assert from "node:assert/strict";
import { buildDistractorPools, formableWords, meaningOptions } from "./scramble";
import type { IndexedWord, Tile } from "./scramble";

function word(id: number, simplified: string, meaning: string, pos = ["n"]): IndexedWord {
  return { id, simplified, pinyin: "", meaning, level: 1, pos };
}

function tilesOf(chars: string): Tile[] {
  return Array.from(chars).map((char, id) => ({ id, char }));
}

test("multi-char words are formable when the board has their characters", () => {
  const index = [word(1, "学习", "study"), word(2, "朋友", "friend")];
  const result = formableWords(index, tilesOf("习学"), new Set());
  assert.deepEqual(result.map((w) => w.id), [1]);
});

test("repeated characters need repeated tiles", () => {
  const index = [word(1, "妈妈", "mom")];
  assert.equal(formableWords(index, tilesOf("妈"), new Set()).length, 0);
  assert.equal(formableWords(index, tilesOf("妈妈"), new Set()).length, 1);
});

test("single-char words are only formable when seeded", () => {
  const index = [word(1, "好", "good")];
  assert.equal(formableWords(index, tilesOf("好"), new Set()).length, 0);
  assert.equal(formableWords(index, tilesOf("好"), new Set([1])).length, 1);
});

test("meaning options include the answer and avoid overlapping distractors", () => {
  const index = [
    word(1, "水", "water"),
    word(2, "冰水", "ice water"),
    word(3, "火", "fire"),
    word(4, "山", "mountain"),
    word(5, "河", "river"),
  ];
  const options = meaningOptions(index[0], buildDistractorPools(index));
  assert.ok(options.includes("water"));
  assert.ok(!options.includes("ice water"));
  assert.equal(new Set(options).size, options.length);
});
