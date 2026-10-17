/**
 * prewarm-questions.ts — fill the shared question bank (word_questions)
 * up to QUESTIONS_PER_WORD per word so sessions need no LLM calls.
 *
 * Run:  npm run prewarm-questions -- [hskLevel]
 * Requires LLM_API_KEY. Run AFTER applying migration 006_question_bank.sql.
 * Idempotent — only fills missing slots.
 */

import { existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Word } from "../src/lib/types";
import type { QuestionBank } from "../src/lib/questionBank";

for (const f of [".env.local", ".env"]) {
  if (existsSync(f)) {
    process.loadEnvFile(f);
    break;
  }
}

const BATCH_SIZE = 5;
const PAGE = 1000;

function createAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function fetchWordPage(admin: SupabaseClient, level: number | null, from: number): Promise<Word[]> {
  let query = admin.from("words").select("*").order("id").range(from, from + PAGE - 1);
  if (level !== null) query = query.eq("hsk_level", level);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Word[];
}

async function fetchWords(admin: SupabaseClient, level: number | null): Promise<Word[]> {
  const words: Word[] = [];
  for (let from = 0; ; from += PAGE) {
    const page = await fetchWordPage(admin, level, from);
    words.push(...page);
    if (page.length < PAGE) return words;
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, i * size + size));
}

function totalQuestions(bank: QuestionBank): number {
  return [...bank.values()].reduce((sum, qs) => sum + qs.length, 0);
}

async function fillBatch(admin: SupabaseClient, batch: Word[]): Promise<void> {
  const { loadBank, fillBank, wordsNeedingQuestions } = await import("../src/lib/questionBank");
  const bank = await loadBank(admin, batch.map((w) => w.id));
  for (let before = -1; wordsNeedingQuestions(bank, batch).length > 0 && before !== totalQuestions(bank); ) {
    before = totalQuestions(bank);
    await fillBank(admin, bank, batch);
  }
}

async function main() {
  const { USE_STUB } = await import("../src/lib/config");
  if (USE_STUB) throw new Error("LLM_API_KEY is required to prewarm questions");
  const admin = createAdmin();
  const level = process.argv[2] ? Number(process.argv[2]) : null;
  const words = await fetchWords(admin, level);
  for (const [i, batch] of chunk(words, BATCH_SIZE).entries()) {
    await fillBatch(admin, batch);
    console.log(`  ${Math.min((i + 1) * BATCH_SIZE, words.length)}/${words.length} words`);
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
