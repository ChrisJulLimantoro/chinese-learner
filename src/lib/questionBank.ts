import type { SupabaseClient } from "@supabase/supabase-js";
import { MAX_QUESTIONS_PER_LLM_CALL, TONE_PICK_SHARE, USE_STUB } from "./config";
import { generateQuestions, isUsableQuestion } from "./llm";
import type { QuestionWordInput } from "./llm";
import { fallbackQuestion } from "./fallbackQuestion";
import { preferredTypes } from "./questionBoxes";
import type { BoxByWord } from "./questionBoxes";
import { boxesOf, pickRows, toBankQuestion } from "./questionPool";
import type { PoolByWord, PoolRow } from "./questionPool";
import { needsGeneration, requiredTypes } from "./questionRefill";
import type { PoolStats } from "./questionRefill";
import { buildToneQuestion } from "./toneQuestion";
import type { Question, Word } from "./types";

type QuestionRequest = QuestionWordInput & Word;

const EMPTY_STATS: PoolStats = { bank_size: 0, type_counts: {}, exhausted: true };

function statsOf(pool: PoolByWord, word: Word): PoolStats {
  return pool.get(word.id) ?? EMPTY_STATS;
}

function requestsFor(pool: PoolByWord, boxes: BoxByWord, word: Word): QuestionRequest[] {
  const types = requiredTypes(statsOf(pool, word), preferredTypes(boxes, word.id));
  return types.map((required_type) => ({ ...word, required_type }));
}

function cleanAnswers(question: Question): string[] {
  const answers = Array.isArray(question.accepted_answers) ? question.accepted_answers : [];
  return answers.filter((a) => typeof a === "string" && a.trim() && a !== question.target_word);
}

function toInsertRow(word: Word, question: Question) {
  return {
    word_id: word.id,
    type: question.type,
    question,
    accepted_answers: cleanAnswers(question),
    reference_answer: question.reference_answer?.trim() || null,
  };
}

function usableInsertRows(requests: QuestionRequest[], generated: Question[]) {
  return requests.flatMap((w, i) => (isUsableQuestion(generated[i], w) ? [toInsertRow(w, generated[i])] : []));
}

async function insertRows(admin: SupabaseClient, rows: object[]): Promise<void> {
  if (rows.length === 0) return;
  await admin.from("word_questions").upsert(rows, { onConflict: "word_id,prompt_hash", ignoreDuplicates: true });
}

function chunked<T>(items: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size));
}

async function generateInto(admin: SupabaseClient, requests: QuestionRequest[], apiKey: string | null): Promise<void> {
  const generated = await generateQuestions(requests, apiKey);
  await insertRows(admin, usableInsertRows(requests, generated));
}

export async function fillPool(
  admin: SupabaseClient,
  pool: PoolByWord,
  words: Word[],
  boxes: BoxByWord = new Map(),
  apiKey: string | null = null
): Promise<void> {
  const needy = words.filter((w) => needsGeneration(statsOf(pool, w)));
  if (USE_STUB || needy.length === 0) return;
  const requests = needy.flatMap((w) => requestsFor(pool, boxes, w));
  await Promise.all(chunked(requests, MAX_QUESTIONS_PER_LLM_CALL).map((c) => generateInto(admin, c, apiKey)));
}

async function fillPoolQuietly(
  admin: SupabaseClient,
  pool: PoolByWord,
  words: Word[],
  boxes: BoxByWord,
  apiKey: string | null
): Promise<void> {
  try {
    await fillPool(admin, pool, words, boxes, apiKey);
  } catch (error) {
    console.warn("[question-bank] fill failed:", error);
  }
}

function shouldTryTone(row: PoolRow | undefined, boxes: BoxByWord, word: Word, random: () => number): boolean {
  if (!preferredTypes(boxes, word.id).includes("tone_pick")) return false;
  return !row || row.bank_size === 0 || random() < TONE_PICK_SHARE;
}

function questionFor(pool: PoolByWord, boxes: BoxByWord, word: Word, random: () => number): Question {
  const row = pool.get(word.id);
  const tone = shouldTryTone(row, boxes, word, random) ? buildToneQuestion(word, random) : null;
  return tone ?? toBankQuestion(row) ?? fallbackQuestion(word, random);
}

export type Assignment = { questions: Map<number, Question>; refillBank: () => Promise<void> };

const SKIP_REFILL = async () => {};

function refillFor(admin: SupabaseClient, pool: PoolByWord | null, words: Word[], apiKey: string | null) {
  return pool ? () => fillPoolQuietly(admin, pool, words, boxesOf(pool), apiKey) : SKIP_REFILL;
}

export async function assignQuestions(
  supabase: SupabaseClient,
  admin: SupabaseClient,
  words: Word[],
  apiKey: string | null = null,
  random: () => number = Math.random
): Promise<Assignment> {
  const pool = await pickRows(supabase, words.map((w) => w.id));
  const safePool = pool ?? new Map();
  const questions = new Map(words.map((w) => [w.id, questionFor(safePool, boxesOf(safePool), w, random)]));
  return { questions, refillBank: refillFor(admin, pool, words, apiKey) };
}

export async function pickRequeueQuestion(
  supabase: SupabaseClient,
  wordId: number,
  original: Question | null
): Promise<Question | null> {
  const pool = await pickRows(supabase, [wordId], original?.bank_id ?? null);
  return toBankQuestion(pool?.get(wordId)) ?? original;
}
