"use server";

import { getUserContext } from "@/lib/user";
import {
  startSession,
  startSessionWithWords,
  loadSession,
  listSessions,
  redrillSession,
  dueReviews,
  getInProgressSession,
  gradeAnswer,
} from "@/lib/services";

export async function startSessionAction(kind: string = "mixed", size?: number) {
  const { supabase, userId } = await getUserContext();
  return startSession(supabase, userId, kind, size);
}

export async function startSessionWithWordsAction(wordIds: number[], kind?: string) {
  const { supabase, userId } = await getUserContext();
  return startSessionWithWords(supabase, userId, wordIds, kind);
}

export async function loadSessionAction(sessionId: number) {
  const { supabase, userId } = await getUserContext();
  return loadSession(supabase, userId, sessionId);
}

export async function listSessionsAction(limit?: number) {
  const { supabase, userId } = await getUserContext();
  return listSessions(supabase, userId, limit);
}

export async function redrillSessionAction(sessionId: number, withVariation?: boolean) {
  const { supabase, userId } = await getUserContext();
  return redrillSession(supabase, userId, sessionId, withVariation);
}

export async function dueReviewsAction() {
  const { supabase, userId } = await getUserContext();
  return dueReviews(supabase, userId);
}

export async function getInProgressSessionAction() {
  const { supabase, userId } = await getUserContext();
  return getInProgressSession(supabase, userId);
}

export async function gradeAnswerAction(
  sessionItemId: number,
  answer: string,
  responseTimeMs: number,
  hesitated?: boolean
) {
  const { supabase, userId } = await getUserContext();
  return gradeAnswer(supabase, userId, sessionItemId, answer, responseTimeMs, hesitated);
}
