import type { SupabaseClient } from "@supabase/supabase-js";
import { START_HSK_LEVEL, FREE_MAX_VOCAB_WORDS, FREE_MAX_SESSIONS, SUPER_ADMIN_EMAIL } from "./config";
import type { Profile } from "./types";

export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (data) return data as Profile;

  // Lazy-create profile row (first login before trigger fires)
  const profile: Profile = {
    user_id: userId,
    current_hsk_level: START_HSK_LEVEL,
    study_streak_days: 0,
    last_study_date: null,
    role: "user",
    email: null,
    max_vocab_words: 5,
    max_sessions: 3,
  };
  // Only insert the columns the authenticated role is allowed to write
  await supabase.from("profiles").insert({
    user_id: userId,
    current_hsk_level: START_HSK_LEVEL,
    study_streak_days: 0,
    last_study_date: null,
  });
  return profile;
}

function isUnlimited(profile: Profile): boolean {
  // Admins and the super-admin bypass all limits
  return profile.role === "admin" || profile.email === SUPER_ADMIN_EMAIL;
}

export function getSessionCap(profile: Profile): number | null {
  if (isUnlimited(profile)) return null;
  return profile.max_sessions ?? FREE_MAX_SESSIONS;
}

export function getVocabCap(profile: Profile): number | null {
  if (isUnlimited(profile)) return null;
  return profile.max_vocab_words ?? FREE_MAX_VOCAB_WORDS;
}

async function countSessions(supabase: SupabaseClient, userId: string): Promise<number> {
  const { count } = await supabase.from("sessions").select("*", { count: "exact", head: true }).eq("user_id", userId);
  return count ?? 0;
}

function sessionLimitMessage(cap: number): string {
  return `Free plan limit reached (${cap} session${cap === 1 ? "" : "s"}). Ask an admin to raise your limit.`;
}

export async function assertSessionCapAvailable(supabase: SupabaseClient, userId: string, profile: Profile): Promise<void> {
  const cap = getSessionCap(profile);
  if (cap === null) return;
  if ((await countSessions(supabase, userId)) >= cap) throw new Error(sessionLimitMessage(cap));
}

export async function recordStudyActivity(supabase: SupabaseClient): Promise<void> {
  await supabase.rpc("record_study_activity");
}
