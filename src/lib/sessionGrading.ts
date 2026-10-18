import { after } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "./supabase/admin";
import { getUserLlmKey } from "./byokService";
import { gradeAnswerWithCache } from "./grading";
import { applyAnswer, emptySrsState } from "./srs";
import { fallbackQuestion } from "./fallbackQuestion";
import { assignQuestions, pickRequeueQuestion } from "./questionBank";
import { SKIPPED_ANSWER } from "./skippedAnswer";
import { outcomeFor } from "./outcome";
import { normalizeWordRow } from "./wordRow";
import { DEFAULT_OVER_TIMER_MS, OVER_TIMER_MS_BY_TYPE } from "./config";
import type { GraderOutput, Outcome, Question, SessionItem, SrsState } from "./types";

export async function ensureItemQuestion(
  supabase: SupabaseClient,
  userId: string,
  itemId: number
): Promise<Question> {
  // Load item (verify ownership via user_id filter)
  const { data: item } = await supabase
    .from("session_items")
    .select("*, words(id, simplified, traditional, pinyin, hsk_level, pos, meanings, frequency_rank, lesson_card, readings)")
    .eq("id", itemId)
    .eq("user_id", userId)
    .single();

  if (!item) throw new Error(`session_item ${itemId} not found`);

  // Already generated?
  if (item.question) return item.question as Question;

  const w = (item.words as Record<string, unknown>) ?? {};
  const word = normalizeWordRow(w);

  const { questions, refillBank } = await assignQuestions(supabase, createAdminClient(), [word], await getUserLlmKey(userId));
  after(refillBank);
  const question = questions.get(word.id) ?? fallbackQuestion(word);

  // Persist
  await supabase
    .from("session_items")
    .update({ question })
    .eq("id", itemId)
    .eq("user_id", userId);

  return question;
}

type WordRow = Parameters<typeof gradeAnswerWithCache>[1];

type ItemRef = {
  id: number;
  session_id: number;
  word_id: number;
  is_requeue?: boolean;
  question: Question | null;
  words?: { srs_state?: SrsState[] } | null;
};

type ItemWithWord = ItemRef & { words: Record<string, unknown> };

type FinalizedGrade = {
  srs_summary: SrsState;
  session_complete: boolean;
  new_cursor: number;
  requeued_item: SessionItem | null;
};

type FinalizeResult = { new_cursor: number; session_complete: boolean; requeue_item_id: number | null; requeue_order_index: number | null };

function overTimerMsFor(item: ItemRef): number {
  return OVER_TIMER_MS_BY_TYPE[item.question?.type as Question["type"]] ?? DEFAULT_OVER_TIMER_MS;
}

async function saveItemFields(
  supabase: SupabaseClient,
  userId: string,
  itemId: number,
  fields: Record<string, unknown>
): Promise<void> {
  await supabase.from("session_items").update(fields).eq("id", itemId).eq("user_id", userId);
}

function wasSkipped(fields: Record<string, unknown>): boolean {
  return fields.user_answer === SKIPPED_ANSWER;
}

async function recordQuestionResult(
  item: ItemRef,
  fields: Record<string, unknown>
): Promise<void> {
  const bankId = item.question?.bank_id;
  const correct = (fields.grader_output as GraderOutput).correct;
  if (!bankId || wasSkipped(fields)) return;
  await createAdminClient().rpc("record_question_result", { p_question_id: bankId, p_correct: correct });
}

function currentSrsState(userId: string, item: ItemRef): SrsState {
  return item.words?.srs_state?.[0] ?? emptySrsState(userId, item.word_id);
}

function finalizeParams(item: ItemRef, outcome: Outcome, responseTimeMs: number, fields: Record<string, unknown>, srs: SrsState, requeueQuestion: Question | null) {
  return {
    p_item_id: item.id,
    p_user_answer: (fields.user_answer as string | undefined) ?? null,
    p_grader_output: fields.grader_output,
    p_response_time_ms: responseTimeMs,
    p_outcome: outcome,
    p_box: srs.box,
    p_next_review_at: srs.next_review_at,
    p_correct_count: srs.correct_count,
    p_wrong_count: srs.wrong_count,
    p_hesitated_count: srs.hesitated_count,
    p_lapse_streak: srs.lapse_streak,
    p_mastered: srs.mastered,
    p_box5_correct: srs.box5_correct,
    p_requeue_question: requeueQuestion,
  };
}

async function finalizeSessionItem(supabase: SupabaseClient, params: ReturnType<typeof finalizeParams>) {
  const { data, error } = await supabase.rpc("finalize_session_item", params).single();
  if (error) throw new Error(`Failed to finalize item: ${error.message}`);
  return data as FinalizeResult;
}

function shouldRequeue(item: ItemRef, outcome: Outcome): boolean {
  return outcome === "wrong" && !item.is_requeue;
}

async function requeueQuestionFor(supabase: SupabaseClient, item: ItemRef, outcome: Outcome): Promise<Question | null> {
  if (!shouldRequeue(item, outcome)) return null;
  return pickRequeueQuestion(supabase, item.word_id, item.question);
}

function nextSrsState(userId: string, item: ItemRef, outcome: Outcome, responseTimeMs: number): SrsState {
  const current = currentSrsState(userId, item);
  if (item.is_requeue) return current;
  return applyAnswer(current, { outcome, overTimer: responseTimeMs > overTimerMsFor(item), hesitated: outcome === "hesitated" });
}

function requeuedItemOf(item: ItemRef, finalized: FinalizeResult, question: Question | null): SessionItem | null {
  if (!finalized.requeue_item_id) return null;
  const word = normalizeWordRow((item as ItemWithWord).words as Record<string, unknown>);
  return {
    item_id: finalized.requeue_item_id,
    order_index: finalized.requeue_order_index!,
    word,
    lesson_card: null,
    question_json: question,
    user_answer: null,
    grader_output_json: null,
    response_time_ms: null,
    outcome: null,
    is_requeue: true,
  };
}

async function finalizeGrade(
  supabase: SupabaseClient,
  userId: string,
  item: ItemRef,
  outcome: Outcome,
  responseTimeMs: number,
  fields: Record<string, unknown>
): Promise<FinalizedGrade> {
  const srs = nextSrsState(userId, item, outcome, responseTimeMs);
  const requeueQuestion = await requeueQuestionFor(supabase, item, outcome);
  const params = finalizeParams(item, outcome, responseTimeMs, fields, srs, requeueQuestion);
  const [finalized] = await Promise.all([finalizeSessionItem(supabase, params), recordQuestionResult(item, fields)]);
  const requeued_item = requeuedItemOf(item, finalized, requeueQuestion);
  return { srs_summary: srs, session_complete: finalized.session_complete, new_cursor: finalized.new_cursor, requeued_item };
}

async function loadOwnedItem(supabase: SupabaseClient, userId: string, itemId: number) {
  const { data: item } = await supabase
    .from("session_items")
    .select("*, words(id, simplified, traditional, pinyin, hsk_level, pos, meanings, frequency_rank, readings, lesson_card, srs_state(*))")
    .eq("words.srs_state.user_id", userId)
    .eq("id", itemId)
    .eq("user_id", userId)
    .single();
  if (!item) throw new Error(`session_item ${itemId} not found`);
  return item;
}

export async function gradeAnswer(
  supabase: SupabaseClient,
  userId: string,
  sessionItemId: number,
  answer: string,
  responseTimeMs: number,
  hesitated: boolean = false
): Promise<{
  grader_output: GraderOutput;
  srs_summary: SrsState | null;
  session_complete: boolean;
  outcome: Outcome | null;
  new_cursor: number | null;
  requeued_item: SessionItem | null;
}> {
  const item = await loadOwnedItem(supabase, userId, sessionItemId);
  if (item.outcome) throw new Error(`session_item ${sessionItemId} is already graded`);
  const question = (item.question as Question | null) ?? (await ensureItemQuestion(supabase, userId, sessionItemId));
  const graderOut = await gradeAnswerWithCache(supabase, item.words as WordRow, question, answer, userId);
  const fields = { user_answer: answer, grader_output: graderOut };
  if (graderOut.self_grade && !hesitated) {
    await saveItemFields(supabase, userId, sessionItemId, { ...fields, response_time_ms: responseTimeMs });
    return { grader_output: graderOut, srs_summary: null, session_complete: false, outcome: null, new_cursor: null, requeued_item: null };
  }
  const outcome = outcomeFor(graderOut, hesitated);
  const finalized = await finalizeGrade(supabase, userId, item, outcome, responseTimeMs, fields);
  return { grader_output: graderOut, outcome, ...finalized };
}

export async function reportQuestion(supabase: SupabaseClient, questionId: number, reason: string): Promise<void> {
  const { error } = await supabase.rpc("report_question", { p_question_id: questionId, p_reason: reason });
  if (error) throw new Error(`Failed to report question: ${error.message}`);
}

export async function selfGrade(
  supabase: SupabaseClient,
  userId: string,
  sessionItemId: number,
  gotIt: boolean
): Promise<{
  srs_summary: SrsState;
  session_complete: boolean;
  outcome: Outcome;
  new_cursor: number;
  requeued_item: SessionItem | null;
}> {
  const item = await loadOwnedItem(supabase, userId, sessionItemId);
  const graderOut = item.grader_output as GraderOutput | null;
  if (item.outcome || !graderOut?.self_grade) throw new Error(`session_item ${sessionItemId} is not awaiting self-grade`);
  const outcome: Outcome = gotIt ? "correct" : "wrong";
  const resolved = { ...graderOut, correct: gotIt, naturalness: gotIt ? 5 : 1, self_grade: false };
  const finalized = await finalizeGrade(supabase, userId, item, outcome, item.response_time_ms ?? 0, { grader_output: resolved });
  return { outcome, ...finalized };
}
