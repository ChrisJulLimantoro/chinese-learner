import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePinyin, pinyinKey, sandhiForm, toneDistractors, toneOf, withTone } from "./pinyin";

test("tone mark goes on a before anything else", () => {
  assert.equal(withTone("ao", 3), "ǎo");
});

test("tone mark goes on the first vowel of ou", () => {
  assert.equal(withTone("ou", 2), "óu");
});

test("tone mark goes on the last vowel otherwise", () => {
  assert.equal(withTone("ui", 4), "uì");
  assert.equal(withTone("iu", 1), "iū");
});

test("neutral tone strips the mark", () => {
  assert.equal(withTone("ǎo", 5), "ao");
});

test("uppercase vowels parse and take marks", () => {
  assert.equal(toneOf("Ǐ"), 3);
  assert.equal(withTone("Ao", 2), "Áo");
  assert.deepEqual(parsePinyin("Nǐ hǎo").nuclei, ["ǐ", "ǎo"]);
});

test("sandhi: consecutive third tones", () => {
  assert.equal(sandhiForm("nǐhǎo", "你好"), "níhǎo");
});

test("sandhi: bu before fourth tone", () => {
  assert.equal(sandhiForm("bùdà", "不大"), "búdà");
  assert.equal(sandhiForm("bùhǎo", "不好"), null);
});

test("sandhi: yi before fourth tone and before other tones", () => {
  assert.equal(sandhiForm("yīgè", "一个"), "yígè");
  assert.equal(sandhiForm("yītiān", "一天"), "yìtiān");
});

test("distractors never include the answer, readings, or sandhi form", () => {
  const readings = ["nǐhǎo"];
  for (let i = 0; i < 50; i++) {
    const keys = toneDistractors("nǐhǎo", readings, Math.random, 3, "你好").map(pinyinKey);
    assert.ok(!keys.includes(pinyinKey("nǐhǎo")));
    assert.ok(!keys.includes(pinyinKey("níhǎo")));
  }
});

test("distractors exclude other readings of the word", () => {
  const keys = toneDistractors("hǎo", ["hǎo", "hào"], () => 0.5, 3, "好").map(pinyinKey);
  assert.ok(!keys.includes("hào"));
});

test("distractors are unique", () => {
  const distractors = toneDistractors("māma", [], Math.random, 3, "妈妈");
  assert.equal(new Set(distractors.map(pinyinKey)).size, distractors.length);
});
