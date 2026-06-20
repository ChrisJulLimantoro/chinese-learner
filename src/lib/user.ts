import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/**
 * Returns the user-scoped Supabase server client (RLS applies via the signed-in
 * user's JWT) plus that user's id, used to scope all per-user data.
 *
 * Redirects to /login when there is no authenticated user, so every action and
 * server component that calls this is implicitly gated.
 *
 * NOTE: shared-table writes (words.lesson_card, accepted_answers) use the
 * service-role admin client directly inside services.ts / grading.ts — never
 * this context, which is intentionally RLS-bound to the current user.
 */
export async function getUserContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, userId: user.id };
}
