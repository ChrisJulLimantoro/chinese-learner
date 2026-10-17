"use server";

import { getUserContext } from "@/lib/user";
import { startScramble, submitScramble } from "@/lib/scrambleService";
import type { WordChoice } from "@/lib/scramble";

export async function startScrambleAction() {
  const { supabase, userId } = await getUserContext();
  return startScramble(supabase, userId);
}

export async function submitScrambleAction(runId: number, choices: WordChoice[]) {
  const { supabase, userId } = await getUserContext();
  return submitScramble(supabase, userId, runId, choices);
}
