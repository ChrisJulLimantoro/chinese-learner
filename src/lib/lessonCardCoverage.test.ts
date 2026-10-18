import { test } from "node:test";
import assert from "node:assert/strict";
import { missingExampleReadings, needsReadingExamples } from "./lessonCardCoverage";
import type { LessonCard, Reading } from "./types";

const reading = (pinyin: string): Reading => ({ pinyin, traditional: null, meanings: [] });
const readings = ["zhāo", "zháo", "zhe", "zhuó"].map(reading);
const example = (reading?: string) => ({ hanzi: "着", pinyin: "", gloss: "", reading });
const card = (examples: LessonCard["examples"]) => ({ examples }) as LessonCard;

test("lists readings that have no example", () => {
  assert.deepEqual(missingExampleReadings(card([example("zhāo"), example("zhe")]), readings), ["zháo", "zhuó"]);
});

test("old cards without reading tags need regeneration for multi-reading words", () => {
  assert.equal(needsReadingExamples(card([example()]), readings), true);
});

test("tagged cards and single-reading words are kept", () => {
  assert.equal(needsReadingExamples(card([example("zhe")]), readings), false);
  assert.equal(needsReadingExamples(card([example()]), [reading("hǎo")]), false);
  assert.equal(needsReadingExamples(null, readings), false);
});
