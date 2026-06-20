/**
 * grading.ts — normalize → accepted_answers cache → escalate to llm.grade.
 * Ported from grading.py.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "./supabase/admin";
import { grade } from "./llm";
import type { GraderOutput, Question } from "./types";

// Punctuation to strip when normalizing (CJK + ASCII)
const PUNCT = /[。，、！？,.!?；;：:「」『』【】《》\s]+/g;

export function normalize(answer: string): string {
  return answer.trim().replace(PUNCT, "").toLowerCase();
}

export async function checkCache(
  supabase: SupabaseClient,
  wordId: number,
  questionType: string | null,
  normalized: string
): Promise<GraderOutput | null> {
  const query = supabase
    .from("accepted_answers")
    .select("verdict")
    .eq("word_id", wordId)
    .eq("normalized_answer", normalized)
    .limit(1);

  if (questionType) {
    query.eq("question_type", questionType);
  }

  const { data } = await query;
  if (data && data.length > 0) {
    return data[0].verdict as GraderOutput;
  }
  return null;
}

export async function storeCache(
  wordId: number,
  questionType: string | null,
  normalized: string,
  verdict: GraderOutput
): Promise<void> {
  // Cache writes use service role (shared table, bypasses RLS)
  const admin = createAdminClient();
  await admin.from("accepted_answers").upsert(
    {
      word_id: wordId,
      question_type: questionType,
      normalized_answer: normalized,
      verdict,
    },
    { onConflict: "word_id,question_type,normalized_answer" }
  );
}

export async function gradeAnswerWithCache(
  supabase: SupabaseClient,
  wordId: number,
  question: Question,
  answer: string
): Promise<GraderOutput> {
  const qtype = question.type ?? null;
  const normalized = normalize(answer);

  // 1. Check cache
  const cached = await checkCache(supabase, wordId, qtype, normalized);
  if (cached !== null) {
    return cached;
  }

  // 2. Escalate to LLM
  const result = await grade(question, answer);

  if (!result.normalized_answer) {
    result.normalized_answer = normalized;
  }

  // 3. Store in cache if grader approves
  if (result.accept_for_cache) {
    await storeCache(wordId, qtype, normalized, result);
  }

  return result;
}
