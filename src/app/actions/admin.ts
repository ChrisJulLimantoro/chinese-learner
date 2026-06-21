"use server";

import { redirect } from "next/navigation";
import { getUserContext } from "@/lib/user";
import { getProfile } from "@/lib/services";
import { createAdminClient } from "@/lib/supabase/admin";
import { SUPER_ADMIN_EMAIL, FREE_MAX_VOCAB_WORDS, FREE_MAX_SESSIONS } from "@/lib/config";

// ---------------------------------------------------------------------------
// requireAdmin — shared guard for all admin actions/pages
// ---------------------------------------------------------------------------

export async function requireAdmin(): Promise<{ isSuperAdmin: boolean; userId: string }> {
  const { supabase, userId, email } = await getUserContext();

  // Super-admin is determined by the verified JWT email, not the mirrored
  // profiles.email column — so it can't be granted via a DB/admin-UI write.
  const isSuperAdmin = email === SUPER_ADMIN_EMAIL;

  if (!isSuperAdmin) {
    const profile = await getProfile(supabase, userId);
    if (profile.role !== "admin") redirect("/");
  }

  return { isSuperAdmin, userId };
}

// ---------------------------------------------------------------------------
// listUsersAction — returns all profiles with live word/session counts
// ---------------------------------------------------------------------------

export interface AdminUser {
  user_id: string;
  email: string | null;
  role: "user" | "admin";
  current_hsk_level: number;
  max_vocab_words: number | null;
  max_sessions: number | null;
  word_count: number;
  session_count: number;
}

export async function listUsersAction(): Promise<AdminUser[]> {
  await requireAdmin();

  const admin = createAdminClient();

  const { data: profiles } = await admin
    .from("profiles")
    .select("user_id, email, role, current_hsk_level, max_vocab_words, max_sessions")
    .order("email", { ascending: true });

  if (!profiles) return [];

  // Fetch word counts (srs_state rows per user)
  const { data: wordCounts } = await admin
    .from("srs_state")
    .select("user_id");

  // Fetch session counts
  const { data: sessionCounts } = await admin
    .from("sessions")
    .select("user_id");

  const wordMap = new Map<string, number>();
  for (const r of wordCounts ?? []) {
    wordMap.set(r.user_id, (wordMap.get(r.user_id) ?? 0) + 1);
  }

  const sessionMap = new Map<string, number>();
  for (const r of sessionCounts ?? []) {
    sessionMap.set(r.user_id, (sessionMap.get(r.user_id) ?? 0) + 1);
  }

  return profiles.map((p) => ({
    user_id: p.user_id as string,
    email: (p.email as string | null) ?? null,
    role: (p.role as "user" | "admin") ?? "user",
    current_hsk_level: (p.current_hsk_level as number) ?? 2,
    max_vocab_words: p.max_vocab_words as number | null,
    max_sessions: p.max_sessions as number | null,
    word_count: wordMap.get(p.user_id as string) ?? 0,
    session_count: sessionMap.get(p.user_id as string) ?? 0,
  }));
}

// ---------------------------------------------------------------------------
// setUserLimitsAction — admin sets per-user caps
// ---------------------------------------------------------------------------

export async function setUserLimitsAction(
  targetUserId: string,
  maxWords: number | null,
  maxSessions: number | null
): Promise<void> {
  await requireAdmin();

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      max_vocab_words: maxWords ?? FREE_MAX_VOCAB_WORDS,
      max_sessions: maxSessions ?? FREE_MAX_SESSIONS,
    })
    .eq("user_id", targetUserId);

  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// setUserUnlimitedAction — admin sets a user to unlimited (NULL caps)
// ---------------------------------------------------------------------------

export async function setUserUnlimitedAction(targetUserId: string): Promise<void> {
  await requireAdmin();

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ max_vocab_words: null, max_sessions: null })
    .eq("user_id", targetUserId);

  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// setUserRoleAction — super-admin only
// ---------------------------------------------------------------------------

export async function setUserRoleAction(
  targetUserId: string,
  role: "user" | "admin"
): Promise<void> {
  const { isSuperAdmin } = await requireAdmin();
  if (!isSuperAdmin) throw new Error("Only the super-admin can change roles.");

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ role })
    .eq("user_id", targetUserId);

  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// deleteUserAction — super-admin only; cascades via auth.admin.deleteUser
// ---------------------------------------------------------------------------

export async function deleteUserAction(targetUserId: string): Promise<void> {
  const { isSuperAdmin, userId: selfId } = await requireAdmin();
  if (!isSuperAdmin) throw new Error("Only the super-admin can delete users.");
  if (targetUserId === selfId) throw new Error("Cannot delete your own account.");

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(targetUserId);
  if (error) throw new Error(error.message);
}
