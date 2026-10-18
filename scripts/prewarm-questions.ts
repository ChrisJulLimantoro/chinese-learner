/**
 * prewarm-questions.ts — fill the shared question bank (word_questions)
 * up to QUESTIONS_FLOOR per word so sessions need no LLM calls.
 *
 * Run:  npm run prewarm-questions -- [hskLevel]
 * Requires LLM_API_KEY. Run AFTER applying migration 006_question_bank.sql.
 * Idempotent — only fills missing slots.
 */

import { existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Word } from "../src/lib/types";
import type { PoolByWord, PoolRow } from "../src/lib/questionPool";

const UNSEEN_BOX_ID = 1;

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

function totalQuestions(pool: PoolByWord): number {
  return [...pool.values()].reduce((sum, row) => sum + row.bank_size, 0);
}

function emptyRow(wordId: number): PoolRow {
  return { word_id: wordId, box: UNSEEN_BOX_ID, bank_id: null, question: null, accepted_answers: null, reference_answer: null, bank_size: 0, type_counts: {}, exhausted: false };
}

function addToRow(row: PoolRow, type: string) {
  row.bank_size += 1;
  row.type_counts[type] = (row.type_counts[type] ?? 0) + 1;
}

async function loadPool(admin: SupabaseClient, batch: Word[]): Promise<PoolByWord> {
  const { data } = await admin.from("word_questions").select("word_id, type").in("word_id", batch.map((w) => w.id)).eq("retired", false);
  const pool: PoolByWord = new Map(batch.map((w) => [w.id, emptyRow(w.id)]));
  (data ?? []).forEach((r) => addToRow(pool.get(r.word_id as number)!, r.type as string));
  return pool;
}

async function fillBatch(admin: SupabaseClient, batch: Word[]): Promise<void> {
  const { fillPool } = await import("../src/lib/questionBank");
  const { needsGeneration } = await import("../src/lib/questionRefill");
  let pool = await loadPool(admin, batch);
  for (let before = -1; [...pool.values()].some(needsGeneration) && before !== totalQuestions(pool); ) {
    before = totalQuestions(pool);
    await fillPool(admin, pool, batch);
    pool = await loadPool(admin, batch);
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
