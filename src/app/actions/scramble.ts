"use server";

import { getUserContext } from "@/lib/user";
import { startScramble, submitScramble } from "@/lib/scrambleService";
import type { WordResult } from "@/lib/scramble";

export async function startScrambleAction() {
  const { supabase, userId } = await getUserContext();
  return startScramble(supabase, userId);
}

export async function submitScrambleAction(runId: number, results: WordResult[]) {
  const { supabase, userId } = await getUserContext();
  return submitScramble(supabase, userId, runId, results);
}
