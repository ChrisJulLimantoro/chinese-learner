import type { SupabaseClient } from "@supabase/supabase-js";
import { QUESTIONS_PER_WORD, USE_STUB } from "./config";
import { generateQuestions, isUsableQuestion, QUESTION_TYPES } from "./llm";
import type { QuestionWordInput } from "./llm";
import type { Question, Word } from "./types";

const RECENT_ITEMS_LIMIT = 300;
const BANK_COLUMNS = "id, word_id, question, accepted_answers, reference_answer";

export type BankQuestion = { id: number; question: Question };
export type QuestionBank = Map<number, BankQuestion[]>;

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
  const { data } = await supabase.from("word_questions").select(BANK_COLUMNS).in("word_id", wordIds);
  return addRows(new Map(), (data ?? []) as BankRow[]);
}

function bankSize(bank: QuestionBank, word: Word): number {
  return bank.get(word.id)?.length ?? 0;
}

export function wordsNeedingQuestions(bank: QuestionBank, words: Word[]): Word[] {
  return words.filter((w) => bankSize(bank, w) < QUESTIONS_PER_WORD);
}

function withRequiredType(bank: QuestionBank, word: Word): QuestionWordInput {
  return { ...word, required_type: QUESTION_TYPES[bankSize(bank, word) % QUESTION_TYPES.length] };
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

export async function fillBank(admin: SupabaseClient, bank: QuestionBank, words: Word[]): Promise<QuestionBank> {
  const missing = wordsNeedingQuestions(bank, words);
  if (USE_STUB || missing.length === 0) return bank;
  const generated = await generateQuestions(missing.map((w) => withRequiredType(bank, w)));
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

export function pickQuestion(candidates: BankQuestion[], recentRanks: Map<number, number>): Question {
  const age = (c: BankQuestion) => recentRanks.get(c.id) ?? Infinity;
  return candidates.reduce((best, c) => (age(c) > age(best) ? c : best)).question;
}

async function fillBankQuietly(admin: SupabaseClient, bank: QuestionBank, words: Word[]): Promise<void> {
  try {
    await fillBank(admin, bank, words);
  } catch (error) {
    console.warn("[question-bank] fill failed:", error);
  }
}

export async function assignQuestions(
  supabase: SupabaseClient,
  admin: SupabaseClient,
  userId: string,
  words: Word[]
): Promise<Map<number, Question>> {
  const ids = words.map((w) => w.id);
  const bank = await loadBank(supabase, ids);
  await fillBankQuietly(admin, bank, words);
  const ranks = await recentRanks(supabase, userId, ids);
  const filled = words.filter((w) => bank.has(w.id));
  return new Map(filled.map((w) => [w.id, pickQuestion(bank.get(w.id)!, ranks)]));
}
