import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSoundIndex, spokenText, withSpokenReadings } from "./spokenReadings";
import type { Reading } from "./types";

const reading = (pinyin: string): Reading => ({ pinyin, traditional: null, meanings: [] });
const word = (simplified: string, ...pinyins: string[]) => ({ simplified, readings: pinyins.map(reading) });

const corpus = [
  word("还", "hái", "huán"),
  word("孩子", "hái zi"),
  word("环境", "huán jìng"),
  word("长", "cháng", "zhǎng"),
  word("非常", "fēi cháng"),
];
const index = buildSoundIndex(corpus);

test("each reading of a polyphone is voiced by an unambiguous homophone", () => {
  assert.equal(spokenText(index, "还", "hái"), "孩");
  assert.equal(spokenText(index, "还", "huán"), "环");
  assert.equal(spokenText(index, "长", "cháng"), "常");
});

test("falls back to the character when no homophone exists", () => {
  assert.equal(spokenText(index, "长", "zhǎng"), "长");
});

test("falls back to the word when syllables do not align", () => {
  assert.equal(spokenText(index, "还", "hái zi"), "还");
});

test("single-reading words are left untouched", () => {
  const single = word("孩子", "hái zi");
  assert.equal(withSpokenReadings(index, single), single);
});

test("multi-reading words get a spoken form per reading", () => {
  const spoken = withSpokenReadings(index, word("还", "hái", "huán")).readings.map((r) => r.spoken);
  assert.deepEqual(spoken, ["孩", "环"]);
});
