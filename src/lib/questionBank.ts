import type { SupabaseClient } from "@supabase/supabase-js";
import { PREFERRED_TYPES_BY_BOX, QUESTIONS_PER_WORD, TONE_PICK_SHARE, UNSEEN_BOX, USE_STUB } from "./config";
import { generateQuestions, isUsableQuestion, QUESTION_TYPES } from "./llm";
import type { QuestionWordInput } from "./llm";
import { buildToneQuestion } from "./toneQuestion";
import type { Question, Word } from "./types";

const RECENT_ITEMS_LIMIT = 300;
const BANK_COLUMNS = "id, word_id, question, accepted_answers, reference_answer";

export type BankQuestion = { id: number; question: Question };
export type QuestionBank = Map<number, BankQuestion[]>;
export type BoxByWord = Map<number, number>;
type QuestionType = Question["type"];
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
    bank.set(row.word_id, [...(bank.get(row.word_id) ?? []), toBankQuestion(row)]);
  }
  return bank;
}

export async function loadBank(supabase: SupabaseClient, wordIds: number[]): Promise<QuestionBank> {
  const { data } = await supabase
    .from("word_questions")
    .select(BANK_COLUMNS)
    .in("word_id", wordIds)
    .eq("retired", false);
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

function rotatingType(bank: QuestionBank, word: Word): QuestionType {
  return QUESTION_TYPES[bankSize(bank, word) % QUESTION_TYPES.length];
}

function requiredType(bank: QuestionBank, boxes: BoxByWord, word: Word): QuestionType {
  const present = new Set((bank.get(word.id) ?? []).map((b) => b.question.type));
  return preferredTypes(boxes, word.id).find((t) => LLM_TYPES.has(t) && !present.has(t)) ?? rotatingType(bank, word);
}

function withRequiredType(bank: QuestionBank, boxes: BoxByWord, word: Word): QuestionWordInput {
  return { ...word, required_type: requiredType(bank, boxes, word) };
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

function usableInsertRows(words: Word[], generated: Question[]) {
  return words.flatMap((w, i) => (isUsableQuestion(generated[i], w) ? [toInsertRow(w, generated[i])] : []));
}

async function insertRows(admin: SupabaseClient, bank: QuestionBank, rows: object[]): Promise<QuestionBank> {
  if (rows.length === 0) return bank;
  const { data } = await admin.from("word_questions").insert(rows).select(BANK_COLUMNS);
  return addRows(bank, (data ?? []) as BankRow[]);
}

export async function fillBank(
  admin: SupabaseClient,
  bank: QuestionBank,
  words: Word[],
  boxes: BoxByWord = new Map()
): Promise<QuestionBank> {
  const missing = wordsNeedingQuestions(bank, words);
  if (USE_STUB || missing.length === 0) return bank;
  const generated = await generateQuestions(missing.map((w) => withRequiredType(bank, boxes, w)));
  return insertRows(admin, bank, usableInsertRows(missing, generated));
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
): Question | null {
  const tone = shouldTryTone(bank, boxes, word, random) ? buildToneQuestion(word, random) : null;
  return tone ?? bankedQuestion(bank, boxes, ranks, word);
}

export async function assignQuestions(
  supabase: SupabaseClient,
  admin: SupabaseClient,
  userId: string,
  words: Word[],
  random: () => number = Math.random
): Promise<Map<number, Question>> {
  const ids = words.map((w) => w.id);
  const [bank, boxes] = await Promise.all([loadBank(supabase, ids), loadBoxes(supabase, userId, ids)]);
  await fillBankQuietly(admin, bank, words, boxes);
  const ranks = await recentRanks(supabase, userId, ids);
  const questions = words.map((w) => [w.id, questionFor(bank, boxes, ranks, w, random)] as const);
  return new Map(questions.flatMap(([id, q]) => (q ? [[id, q] as const] : [])));
}
