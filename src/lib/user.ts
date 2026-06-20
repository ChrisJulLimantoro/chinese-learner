import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/**
 * Shared auth check for the current RSC render tree. React cache() ensures this
 * runs at most once per request, deduplicating the layout and page calls that
 * would otherwise each make their own round-trip to the Auth server.
 *
 * getClaims() verifies the JWT locally when asymmetric signing keys are active
 * (fast, no network). Falls back to getUser() for legacy HS256 keys, which still
 * benefits from the cache() deduplication.
 */
const getCachedClaims = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  return { supabase, claims: error ? null : (data?.claims ?? null) };
});

/**
 * Returns the user-scoped Supabase client + userId. Redirects to /login when
 * there is no authenticated session. Used in pages and server actions.
 *
 * NOTE: shared-table writes (words.lesson_card, accepted_answers) use the
 * service-role admin client inside services.ts / grading.ts — never this
 * context, which is intentionally RLS-bound to the current user.
 */
export async function getUserContext() {
  const { supabase, claims } = await getCachedClaims();
  if (!claims?.sub) {
    redirect("/login");
  }
  return { supabase, userId: claims.sub };
}

/**
 * Returns JWT claims (or null) without redirecting. Used by the root layout to
 * decide whether to render the Nav — shares the cached auth result with any
 * page rendered in the same request.
 */
export async function getOptionalUser() {
  const { claims } = await getCachedClaims();
  return claims ?? null;
}
