import type { SupabaseClient } from "@supabase/supabase-js";
import { MAX_QUESTIONS_PER_LLM_CALL, MIN_PER_PREFERRED_TYPE, PREFERRED_TYPES_BY_BOX, QUESTIONS_PER_FILL, QUESTIONS_PER_WORD, TONE_PICK_SHARE, UNSEEN_BOX, USE_STUB } from "./config";
import { generateQuestions, isUsableQuestion, QUESTION_TYPES } from "./llm";
import type { QuestionWordInput } from "./llm";
import { fallbackQuestion } from "./fallbackQuestion";
import { buildToneQuestion } from "./toneQuestion";
import type { Question, Word } from "./types";

const RECENT_ITEMS_LIMIT = 300;
const BANK_COLUMNS = "id, word_id, question, accepted_answers, reference_answer";

export type BankQuestion = { id: number; question: Question };
export type QuestionBank = Map<number, BankQuestion[]>;
export type BoxByWord = Map<number, number>;
type QuestionType = Question["type"];
type QuestionRequest = QuestionWordInput & Word;
const LLM_TYPES = new Set<QuestionType>(QUESTION_TYPES);

type BankRow = {
  id: number;
  word_id: number;
  question: Question;
  accepted_answers: string[] | null;
  reference_answer: string | null;
};

function toBankQuestion(row: BankRow): BankQuestion {
  const question: Question = {
    ...row.question,
    bank_id: row.id,
    accepted_answers: row.accepted_answers ?? [],
    reference_answer: row.reference_answer || undefined,
  };
  return { id: row.id, question };
}

function addRows(bank: QuestionBank, rows: BankRow[]): QuestionBank {
  for (const row of rows) {
    bank.set(row.word_id, [...(bank.get(row.word_id) ?? []), toBankQuestion(row)].slice(0, QUESTIONS_PER_WORD));
  }
  return bank;
}

export async function loadBank(supabase: SupabaseClient, wordIds: number[]): Promise<QuestionBank> {
  const { data } = await supabase
    .from("word_questions")
    .select(BANK_COLUMNS)
    .in("word_id", wordIds)
    .eq("retired", false)
    .order("id");
  return addRows(new Map(), (data ?? []) as BankRow[]);
}

function bankSize(bank: QuestionBank, word: Word): number {
  return bank.get(word.id)?.length ?? 0;
}

export function wordsNeedingQuestions(bank: QuestionBank, words: Word[]): Word[] {
  return words.filter((w) => bankSize(bank, w) < QUESTIONS_PER_WORD);
}

export function preferredTypes(boxes: BoxByWord, wordId: number): QuestionType[] {
  return PREFERRED_TYPES_BY_BOX[boxes.get(wordId) ?? UNSEEN_BOX];
}

function nextRequiredType(counts: Map<QuestionType, number>, size: number, preferred: QuestionType[]): QuestionType {
  const lacking = (t: QuestionType) => LLM_TYPES.has(t) && (counts.get(t) ?? 0) < MIN_PER_PREFERRED_TYPE;
  return preferred.find(lacking) ?? QUESTION_TYPES[size % QUESTION_TYPES.length];
}

function countByType(bank: QuestionBank, word: Word): Map<QuestionType, number> {
  const counts = new Map<QuestionType, number>();
  (bank.get(word.id) ?? []).forEach((b) => counts.set(b.question.type, (counts.get(b.question.type) ?? 0) + 1));
  return counts;
}

function requiredTypes(bank: QuestionBank, boxes: BoxByWord, word: Word, n: number): QuestionType[] {
  const counts = countByType(bank, word);
  const preferred = preferredTypes(boxes, word.id);
  return Array.from({ length: n }, (_, i) => {
    const type = nextRequiredType(counts, bankSize(bank, word) + i, preferred);
    counts.set(type, (counts.get(type) ?? 0) + 1);
    return type;
  });
}

function requestsFor(bank: QuestionBank, boxes: BoxByWord, word: Word): QuestionRequest[] {
  const wanted = Math.min(QUESTIONS_PER_FILL, QUESTIONS_PER_WORD - bankSize(bank, word));
  return requiredTypes(bank, boxes, word, wanted).map((required_type) => ({ ...word, required_type }));
}

export async function loadBoxes(supabase: SupabaseClient, userId: string, wordIds: number[]): Promise<BoxByWord> {
  const { data } = await supabase.from("srs_state").select("word_id, box").eq("user_id", userId).in("word_id", wordIds);
  return new Map((data ?? []).map((r) => [r.word_id as number, r.box as number]));
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

async function insertRows(admin: SupabaseClient, bank: QuestionBank, rows: object[]): Promise<QuestionBank> {
  if (rows.length === 0) return bank;
  const { data } = await admin
    .from("word_questions")
    .upsert(rows, { onConflict: "word_id,prompt_hash", ignoreDuplicates: true })
    .select(BANK_COLUMNS);
  return addRows(bank, (data ?? []) as BankRow[]);
}

function chunked<T>(items: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size));
}

async function generateInto(admin: SupabaseClient, bank: QuestionBank, requests: QuestionRequest[]): Promise<void> {
  const generated = await generateQuestions(requests);
  await insertRows(admin, bank, usableInsertRows(requests, generated));
}

export async function fillBank(
  admin: SupabaseClient,
  bank: QuestionBank,
  words: Word[],
  boxes: BoxByWord = new Map()
): Promise<QuestionBank> {
  const missing = wordsNeedingQuestions(bank, words);
  if (USE_STUB || missing.length === 0) return bank;
  const requests = missing.flatMap((w) => requestsFor(bank, boxes, w));
  await Promise.all(chunked(requests, MAX_QUESTIONS_PER_LLM_CALL).map((c) => generateInto(admin, bank, c)));
  return bank;
}

function rankIds(ids: number[]): Map<number, number> {
  const ranks = new Map<number, number>();
  ids.forEach((id, i) => ranks.has(id) || ranks.set(id, i));
  return ranks;
}

async function recentRanks(supabase: SupabaseClient, userId: string, wordIds: number[]): Promise<Map<number, number>> {
  const { data } = await supabase
    .from("session_items")
    .select("bank_id:question->>bank_id")
    .eq("user_id", userId)
    .in("word_id", wordIds)
    .not("question", "is", null)
    .order("id", { ascending: false })
    .limit(RECENT_ITEMS_LIMIT);
  const rows = (data ?? []) as unknown as { bank_id: string | null }[];
  return rankIds(rows.filter((r) => r.bank_id).map((r) => Number(r.bank_id)));
}

function ofPreferredTypes(candidates: BankQuestion[], preferred: QuestionType[]): BankQuestion[] {
  const matching = candidates.filter((c) => preferred.includes(c.question.type));
  return matching.length > 0 ? matching : candidates;
}

export function pickQuestion(
  candidates: BankQuestion[],
  recentRanks: Map<number, number>,
  preferred: QuestionType[] = []
): Question {
  const age = (c: BankQuestion) => recentRanks.get(c.id) ?? Infinity;
  return ofPreferredTypes(candidates, preferred).reduce((best, c) => (age(c) > age(best) ? c : best)).question;
}

async function fillBankQuietly(
  admin: SupabaseClient,
  bank: QuestionBank,
  words: Word[],
  boxes: BoxByWord
): Promise<void> {
  try {
    await fillBank(admin, bank, words, boxes);
  } catch (error) {
    console.warn("[question-bank] fill failed:", error);
  }
}

function shouldTryTone(bank: QuestionBank, boxes: BoxByWord, word: Word, random: () => number): boolean {
  if (!preferredTypes(boxes, word.id).includes("tone_pick")) return false;
  return !bank.has(word.id) || random() < TONE_PICK_SHARE;
}

function bankedQuestion(bank: QuestionBank, boxes: BoxByWord, ranks: Map<number, number>, word: Word): Question | null {
  const candidates = bank.get(word.id);
  return candidates ? pickQuestion(candidates, ranks, preferredTypes(boxes, word.id)) : null;
}

function questionFor(
  bank: QuestionBank,
  boxes: BoxByWord,
  ranks: Map<number, number>,
  word: Word,
  random: () => number
): Question {
  const tone = shouldTryTone(bank, boxes, word, random) ? buildToneQuestion(word, random) : null;
  return tone ?? bankedQuestion(bank, boxes, ranks, word) ?? fallbackQuestion(word, random);
}

export type Assignment = { questions: Map<number, Question>; refillBank: () => Promise<void> };

export async function assignQuestions(
  supabase: SupabaseClient,
  admin: SupabaseClient,
  userId: string,
  words: Word[],
  random: () => number = Math.random
): Promise<Assignment> {
  const ids = words.map((w) => w.id);
  const [bank, boxes, ranks] = await Promise.all([loadBank(supabase, ids), loadBoxes(supabase, userId, ids), recentRanks(supabase, userId, ids)]);
  const questions = new Map(words.map((w) => [w.id, questionFor(bank, boxes, ranks, w, random)]));
  return { questions, refillBank: () => fillBankQuietly(admin, bank, words, boxes) };
}

export async function pickRequeueQuestion(
  supabase: SupabaseClient,
  userId: string,
  wordId: number,
  original: Question | null
): Promise<Question | null> {
  const bank = await loadBank(supabase, [wordId]);
  const others = (bank.get(wordId) ?? []).filter((b) => b.id !== original?.bank_id);
  if (others.length === 0) return original;
  return pickQuestion(others, await recentRanks(supabase, userId, [wordId]));
}
