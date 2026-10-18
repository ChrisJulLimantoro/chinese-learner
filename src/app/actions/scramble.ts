"use server";

import { getUserContext } from "@/lib/user";
import { startScramble, submitScramble } from "@/lib/scrambleService";
import { isDifficulty } from "@/lib/scramble";
import type { WordChoice } from "@/lib/scramble";

export async function startScrambleAction(difficulty: unknown) {
  const { supabase, userId } = await getUserContext();
  return startScramble(supabase, userId, isDifficulty(difficulty) ? difficulty : "easy");
}

export async function submitScrambleAction(runId: number, choices: WordChoice[]) {
  const { supabase, userId } = await getUserContext();
  return submitScramble(supabase, userId, runId, choices);
}
