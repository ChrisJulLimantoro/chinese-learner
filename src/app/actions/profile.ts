"use server";

import { getUserContext } from "@/lib/user";
import { getProfile } from "@/lib/services";
import { MIN_HSK_LEVEL, MAX_HSK_LEVEL } from "@/lib/config";

export async function getProfileAction() {
  const { supabase, userId } = await getUserContext();
  return getProfile(supabase, userId);
}

export async function updateHskLevelAction(level: number) {
  if (level < MIN_HSK_LEVEL || level > MAX_HSK_LEVEL || !Number.isInteger(level)) {
    throw new Error(`HSK level must be an integer between ${MIN_HSK_LEVEL} and ${MAX_HSK_LEVEL}.`);
  }

  const { supabase, userId } = await getUserContext();

  const { error } = await supabase
    .from("profiles")
    .update({
      current_hsk_level: level,
      study_streak_days: 0,
      last_study_date: null,
    })
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}
