import { test } from "node:test";
import assert from "node:assert/strict";
import { applyAnswer, computeProgress, emptySrsState, isMastered } from "./srs";
import { outcomeFor } from "./outcome";
import { BOX_INTERVALS, MAINTENANCE_INTERVAL } from "./config";
import type { GraderOutput, SrsState } from "./types";

const NOW = 1_000_000;
const CLEAN = { outcome: "correct", overTimer: false, hesitated: false } as const;
const WRONG = { outcome: "wrong", overTimer: false, hesitated: false } as const;
const HESITATED = { outcome: "hesitated", overTimer: false, hesitated: true } as const;

function stateInBox(box: number, extra: Partial<SrsState> = {}): SrsState {
  return { ...emptySrsState("u", 1), box, ...extra };
}

function applyTimes(row: SrsState, flags: typeof CLEAN, times: number): SrsState {
  return Array.from({ length: times }).reduce<SrsState>((acc) => applyAnswer({ ...acc, next_review_at: 0 }, flags, NOW), row);
}

test("arriving in box 5 is not mastered", () => {
  const row = applyTimes(stateInBox(1), CLEAN, 4);
  assert.equal(row.box, 5);
  assert.equal(row.mastered, false);
  assert.equal(row.box5_correct, 0);
});

test("mastery needs clean corrects while already in box 5", () => {
  const row = applyTimes(stateInBox(5), CLEAN, 3);
  assert.equal(row.mastered, true);
  assert.equal(isMastered(row), true);
});

test("mastered words are scheduled at the maintenance interval", () => {
  const row = applyAnswer(stateInBox(5, { box5_correct: 2 }), CLEAN, NOW);
  assert.equal(row.mastered, true);
  assert.ok(Math.abs(row.next_review_at - Date.now() / 1000 - MAINTENANCE_INTERVAL) < 5);
});

test("a wrong answer un-masters and resets box 5 progress", () => {
  const row = applyAnswer(stateInBox(5, { box5_correct: 3, mastered: true, next_review_at: 0 }), WRONG, NOW);
  assert.equal(row.box, 4);
  assert.equal(row.mastered, false);
  assert.equal(row.box5_correct, 0);
});

test("hesitated answers do not promote or count as correct", () => {
  const progress = computeProgress(stateInBox(2), HESITATED);
  assert.equal(progress.box, 2);
  assert.equal(progress.correct_count, 0);
  assert.equal(progress.hesitated_count, 1);
});

test("two consecutive lapses plug the leak back to box 1", () => {
  const first = computeProgress(stateInBox(4), WRONG);
  const second = computeProgress({ ...stateInBox(4), ...first }, WRONG);
  assert.equal(second.box, 1);
  assert.equal(second.lapse_streak, 0);
});

test("a correct answer off schedule leaves the word untouched", () => {
  const row = stateInBox(2, { next_review_at: NOW + 86_400 });
  assert.deepEqual(applyAnswer(row, CLEAN, NOW), row);
});

test("a wrong answer off schedule pulls the review forward without demoting", () => {
  const row = stateInBox(3, { next_review_at: NOW + 10 * 86_400 });
  const result = applyAnswer(row, WRONG, NOW);
  assert.equal(result.box, 3);
  assert.equal(result.next_review_at, NOW + BOX_INTERVALS[1]);
});

test("new words count as due and are promoted", () => {
  const result = applyAnswer(stateInBox(1), CLEAN, NOW);
  assert.equal(result.box, 2);
});

function verdict(correct: boolean, selfGrade = false): GraderOutput {
  return { correct, naturalness: 3, normalized_answer: "", feedback: "", issues: [], confused_with: null, accept_for_cache: false, self_grade: selfGrade };
}

test("hint with a wrong answer is wrong", () => {
  assert.equal(outcomeFor(verdict(false), true), "wrong");
});

test("hint with a correct answer is hesitated", () => {
  assert.equal(outcomeFor(verdict(true), true), "hesitated");
});

test("no hint maps correctness directly", () => {
  assert.equal(outcomeFor(verdict(true), false), "correct");
  assert.equal(outcomeFor(verdict(false), false), "wrong");
});
