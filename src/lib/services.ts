import type { SupabaseClient } from "@supabase/supabase-js";
import { after } from "next/server";
import { createAdminClient } from "./supabase/admin";
import { ensureSrsState, getUnseenWords, getDueWords, getMixedWords, countDue, checkProgression } from "./srs";
import { assignQuestions } from "./questionBank";
import { assertSessionCapAvailable, getProfile } from "./profileService";
import { normalizeWordRow } from "./wordRow";
import { DEFAULT_SESSION_SIZE, START_HSK_LEVEL } from "./config";
import type { DueReviews, GraderOutput, Outcome, Question, Session, SessionItem, SessionSummary, Stats, Word } from "./types";

function sessionScore(items: { outcome: string | null }[]): { correct: number; answered: number } {
  const answered = items.filter((it) => it.outcome !== null).length;
  const correct = items.filter((it) => it.outcome === "correct").length;
  return { correct, answered };
}

async function createSession(
  supabase: SupabaseClient,
  userId: string,
  words: Word[],
  kind: string,
  level: number
): Promise<Session> {
  if (words.length === 0) {
    throw new Error("No words available for session. Word bank may be empty.");
  }

  const nowSeconds = Date.now() / 1000;
  const config = { kind, size: words.length, level };

  // Insert session
  const { data: sessionRow, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      user_id: userId,
      kind,
      status: "in_progress",
      created_at: nowSeconds,
      cursor: 0,
      config,
    })
    .select()
    .single();

  if (sessionError || !sessionRow) {
    throw new Error(`Failed to create session: ${sessionError?.message ?? "unknown error"}`);
  }

  const sessionId = sessionRow.id as number;

  const { questions: assigned, refillBank } = await assignQuestions(supabase, createAdminClient(), userId, words);
  after(refillBank);
  const itemInserts = words.map((w, i) => ({
    session_id: sessionId,
    user_id: userId,
    order_index: i,
    word_id: w.id,
    question: assigned.get(w.id) ?? null,
  }));

  const { data: itemRows } = await supabase
    .from("session_items")
    .insert(itemInserts)
    .select();

  // Seed SRS for all words (DB-only, cheap)
  await Promise.all(
    words.map((w) => ensureSrsState(supabase, userId, w.id))
  );

  const items: SessionItem[] = words.map((w, i) => ({
    item_id: (itemRows ?? [])[i]?.id as number,
    order_index: i,
    word: normalizeWordRow(w as unknown as Record<string, unknown>),
    lesson_card: null,
    question_json: assigned.get(w.id) ?? null,
    user_answer: null,
    grader_output_json: null,
    response_time_ms: null,
    outcome: null,
    is_requeue: false,
  }));

  return {
    session_id: sessionId,
    kind,
    status: "in_progress",
    created_at: nowSeconds,
    completed_at: null,
    cursor: 0,
    parent_session_id: null,
    config,
    items,
  };
}

export async function startSession(
  supabase: SupabaseClient,
  userId: string,
  kind: string = "mixed",
  size: number = DEFAULT_SESSION_SIZE
): Promise<Session> {
  const profile = await getProfile(supabase, userId);
  const level = profile.current_hsk_level ?? START_HSK_LEVEL;

  await assertSessionCapAvailable(supabase, userId, profile);

  let words: Word[];
  if (kind === "new_drop") {
    words = await getUnseenWords(supabase, userId, size, level);
  } else if (kind === "review") {
    words = await getDueWords(supabase, userId, size, level);
  } else {
    words = await getMixedWords(supabase, userId, size, level);
  }

  if (words.length === 0) {
    words = await getUnseenWords(supabase, userId, size, level);
  }

  return createSession(supabase, userId, words, kind, level);
}

export async function startSessionWithWords(
  supabase: SupabaseClient,
  userId: string,
  wordIds: number[],
  kind: string = "custom"
): Promise<Session> {
  if (wordIds.length === 0) throw new Error("No words selected for the session.");
  const profile = await getProfile(supabase, userId);
  const level = profile.current_hsk_level ?? START_HSK_LEVEL;

  await assertSessionCapAvailable(supabase, userId, profile);

  const { data } = await supabase.from("words").select("*").in("id", wordIds);
  const words = (data ?? []).map(normalizeWordRow);

  return createSession(supabase, userId, words, kind, level);
}

export async function loadSession(
  supabase: SupabaseClient,
  userId: string,
  sessionId: number
): Promise<Session> {
  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (!session) throw new Error(`Session ${sessionId} not found`);

  const { data: itemRows } = await supabase
    .from("session_items")
    .select(`
      *,
      words (id, simplified, traditional, pinyin, hsk_level, pos, meanings, frequency_rank, lesson_card)
    `)
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .order("order_index", { ascending: true });

  const items: SessionItem[] = (itemRows ?? []).map((row) => {
    const w = (row.words as Record<string, unknown>) ?? {};
    return {
      item_id: row.id as number,
      order_index: row.order_index as number,
      word: normalizeWordRow(w),
      lesson_card: (w.lesson_card as import("./types").LessonCard | null) ?? null,
      question_json: (row.question as import("./types").Question | null) ?? null,
      user_answer: (row.user_answer as string | null) ?? null,
      grader_output_json: (row.grader_output as GraderOutput | null) ?? null,
      response_time_ms: (row.response_time_ms as number | null) ?? null,
      outcome: (row.outcome as Outcome | null) ?? null,
      is_requeue: Boolean(row.is_requeue),
    };
  });

  return {
    session_id: sessionId,
    kind: session.kind as string,
    status: session.status as Session["status"],
    created_at: session.created_at as number,
    completed_at: (session.completed_at as number | null) ?? null,
    cursor: session.cursor as number,
    parent_session_id: (session.parent_session_id as number | null) ?? null,
    config: session.config as Record<string, unknown> | null,
    items,
  };
}

export async function listSessions(
  supabase: SupabaseClient,
  userId: string,
  limit: number = 50
): Promise<SessionSummary[]> {
  const { data: rows } = await supabase
    .from("sessions")
    .select("*, session_items(outcome)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (rows ?? []).map((s) => {
    const items = (s.session_items ?? []) as { outcome: string | null }[];
    const { correct, answered } = sessionScore(items);
    return {
      id: s.id as number,
      kind: s.kind as string,
      status: s.status as string,
      created_at: s.created_at as number,
      completed_at: (s.completed_at as number | null) ?? null,
      cursor: s.cursor as number,
      size: items.length,
      answered,
      correct,
      score: answered > 0 ? `${correct}/${answered}` : "0/0",
    };
  });
}

export async function redrillSession(
  supabase: SupabaseClient,
  userId: string,
  sessionId: number,
  withVariation: boolean = false
): Promise<Session> {
  const orig = await loadSession(supabase, userId, sessionId);
  if (orig.status !== "completed") {
    throw new Error(`Session ${sessionId} is not completed (status=${orig.status})`);
  }

  const origItems = orig.items.filter((it) => !it.is_requeue);
  let questions: (Question | null)[];
  if (withVariation) {
    // Lazy: insert null, questions generated on demand as user progresses
    questions = origItems.map(() => null);
  } else {
    questions = origItems.map((it) => it.question_json);
  }

  const nowSeconds = Date.now() / 1000;
  const config = { kind: "redrill", parent: sessionId, with_variation: withVariation };

  const { data: newSession, error: newSessionError } = await supabase
    .from("sessions")
    .insert({
      user_id: userId,
      kind: "redrill",
      status: "in_progress",
      created_at: nowSeconds,
      cursor: 0,
      parent_session_id: sessionId,
      config,
    })
    .select()
    .single();

  if (newSessionError || !newSession) {
    throw new Error(`Failed to create redrill session: ${newSessionError?.message ?? "unknown error"}`);
  }

  const newSessionId = newSession.id as number;

  const itemInserts = origItems.map((origItem, i) => ({
    session_id: newSessionId,
    user_id: userId,
    order_index: i,
    word_id: origItem.word.id,
    question: questions[i],
  }));

  const { data: itemRows } = await supabase
    .from("session_items")
    .insert(itemInserts)
    .select();

  const items: SessionItem[] = origItems.map((origItem, i) => ({
    item_id: (itemRows ?? [])[i]?.id as number,
    order_index: i,
    word: origItem.word,
    lesson_card: origItem.lesson_card,
    question_json: questions[i],
    user_answer: null,
    grader_output_json: null,
    response_time_ms: null,
    outcome: null,
    is_requeue: false,
  }));

  return {
    session_id: newSessionId,
    kind: "redrill",
    status: "in_progress",
    created_at: nowSeconds,
    completed_at: null,
    cursor: 0,
    parent_session_id: sessionId,
    config,
    items,
  };
}

export async function dueReviews(
  supabase: SupabaseClient,
  userId: string
): Promise<DueReviews> {
  const cnt = await countDue(supabase, userId);
  const nowSeconds = Date.now() / 1000;

  const { data: rows } = await supabase
    .from("srs_state")
    .select("word_id, box, wrong_count, words(simplified, pinyin)")
    .eq("user_id", userId)
    .lte("next_review_at", nowSeconds)
    .order("next_review_at", { ascending: true })
    .limit(5);

  const words = (rows ?? []).map((r) => {
    const w = (r.words as unknown as { simplified: string; pinyin: string } | null) ?? {
      simplified: "",
      pinyin: "",
    };
    return {
      simplified: w.simplified,
      pinyin: w.pinyin,
      box: r.box as number,
      wrong_count: r.wrong_count as number,
    };
  });

  return { count: cnt, words };
}

export async function getStats(
  supabase: SupabaseClient,
  userId: string
): Promise<Stats> {
  const profile = await getProfile(supabase, userId);
  const level = profile.current_hsk_level ?? START_HSK_LEVEL;

  const { count: total } = await supabase
    .from("words")
    .select("*", { count: "exact", head: true })
    .eq("hsk_level", level);

  const { count: masteredCount } = await supabase
    .from("srs_state")
    .select("*, words!inner(hsk_level)", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("mastered", true)
    .eq("words.hsk_level", level);

  const totalCnt = total ?? 0;
  const mastered = masteredCount ?? 0;

  const { data: weakestRows } = await supabase
    .from("srs_state")
    .select("box, wrong_count, correct_count, words!inner(simplified, pinyin, hsk_level)")
    .eq("user_id", userId)
    .eq("words.hsk_level", level)
    .order("wrong_count", { ascending: false })
    .order("box", { ascending: true })
    .limit(10);

  const weakest = (weakestRows ?? []).map((r) => {
    const w = (r.words as unknown as { simplified: string; pinyin: string } | null) ?? {
      simplified: "",
      pinyin: "",
    };
    return {
      simplified: w.simplified,
      pinyin: w.pinyin,
      box: r.box as number,
      wrong_count: r.wrong_count as number,
      correct_count: r.correct_count as number,
    };
  });

  const canAdvance = await checkProgression(supabase, userId, level);
  const dueCnt = await countDue(supabase, userId);

  return {
    level,
    mastered,
    total: totalCnt,
    mastery_pct: totalCnt > 0 ? Math.round((mastered / totalCnt) * 1000) / 10 : 0,
    weakest,
    next_level_progress: { can_advance: canAdvance, mastered, total: totalCnt },
    due_count: dueCnt,
    streak_days: profile.study_streak_days ?? 0,
  };
}

export async function getInProgressSession(
  supabase: SupabaseClient,
  userId: string
): Promise<Session | null> {
  const { data } = await supabase
    .from("sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "in_progress")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) return null;
  return loadSession(supabase, userId, data.id as number);
}
