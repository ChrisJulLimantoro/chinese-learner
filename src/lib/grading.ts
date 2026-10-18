/**
 * grading.ts — normalize → accepted_answers cache → escalate to llm.grade.
 * Ported from grading.py.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "./supabase/admin";
import { getUserLlmKey } from "./byokService";
import { grade } from "./llm";
import { USE_STUB } from "./config";
import { normalize } from "./normalize";
import { resolveDeterministic } from "./deterministicGrading";
import { selfGradeVerdict, templateVerdict } from "./gradeVerdicts";
import type { WordFacts } from "./gradeVerdicts";
import type { GraderOutput, Question } from "./types";

export { normalize };

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

async function gradeWithModel(
  wordId: number,
  question: Question,
  answer: string,
  normalized: string,
  userId: string
): Promise<GraderOutput> {
  const result = await grade(question, answer, await getUserLlmKey(userId));
  result.normalized_answer ||= normalized;
  if (result.accept_for_cache) await storeCache(wordId, question.type ?? null, normalized, result);
  return result;
}

function gradeWithoutModel(word: WordFacts, question: Question, normalized: string): GraderOutput {
  if (question.type === "en_to_zh") return selfGradeVerdict(question, word, normalized);
  return templateVerdict(word, false, normalized);
}

export async function gradeAnswerWithCache(
  supabase: SupabaseClient,
  word: WordFacts & { id: number },
  question: Question,
  answer: string,
  userId: string
): Promise<GraderOutput> {
  const normalized = normalize(answer);
  const deterministic = resolveDeterministic(word, question, normalized);
  if (deterministic) return deterministic;
  const cached = await checkCache(supabase, word.id, question.type ?? null, normalized);
  if (cached) return cached;
  if (USE_STUB) return gradeWithoutModel(word, question, normalized);
  return gradeWithModel(word.id, question, answer, normalized, userId);
}
