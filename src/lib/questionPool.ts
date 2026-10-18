import type { SupabaseClient } from "@supabase/supabase-js";
import { PREFERRED_TYPES_BY_BOX, UNSEEN_BOX } from "./config";
import type { BoxByWord } from "./questionBoxes";
import type { Question } from "./types";

export type PoolRow = {
  word_id: number;
  box: number;
  bank_id: number | null;
  question: Question | null;
  accepted_answers: string[] | null;
  reference_answer: string | null;
  bank_size: number;
  type_counts: Record<string, number>;
  exhausted: boolean;
};
export type PoolByWord = Map<number, PoolRow>;

export function boxesOf(pool: PoolByWord): BoxByWord {
  return new Map(Array.from(pool.values(), (r) => [r.word_id, r.box]));
}

export function toBankQuestion(row: PoolRow | undefined): Question | null {
  if (!row?.question || row.bank_id === null) return null;
  return {
    ...row.question,
    bank_id: row.bank_id,
    accepted_answers: row.accepted_answers ?? [],
    reference_answer: row.reference_answer || undefined,
  };
}

function pickParams(wordIds: number[], withPreferences: boolean, excludeBankId: number | null) {
  return {
    p_word_ids: wordIds,
    p_types_by_box: withPreferences ? PREFERRED_TYPES_BY_BOX : {},
    p_default_box: UNSEEN_BOX,
    p_exclude_bank_id: excludeBankId,
  };
}

export async function pickRows(
  supabase: SupabaseClient,
  wordIds: number[],
  excludeBankId: number | null = null
): Promise<PoolByWord | null> {
  const { data, error } = await supabase.rpc("pick_questions", pickParams(wordIds, excludeBankId === null, excludeBankId));
  if (error) console.warn("[question-bank] pick failed:", error.message);
  return error ? null : new Map(((data ?? []) as PoolRow[]).map((r) => [r.word_id, r]));
}
