/**
 * services.ts — service layer.
 * Faithful port of services.py with per-user scoping via Supabase + RLS.
 * Functions that touch the DB take (supabase, userId, ...).
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "./supabase/admin";
import { gradeAnswerWithCache } from "./grading";
import {
  ensureSrsState,
  updateSrs,
  getUnseenWords,
  getDueWords,
  getMixedWords,
  countDue,
  checkProgression,
} from "./srs";
import { generateLessonCard, safeGenerateQuestion } from "./llm";
import { DEFAULT_SESSION_SIZE, START_HSK_LEVEL, FREE_MAX_VOCAB_WORDS, FREE_MAX_SESSIONS, SUPER_ADMIN_EMAIL } from "./config";
import type {
  Word,
  Reading,
  Session,
  SessionItem,
  SessionSummary,
  Question,
  GraderOutput,
  Outcome,
  DueReviews,
  Stats,
  Profile,
} from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeWordRow(row: Record<string, unknown>): Word {
  return {
    id: row.id as number,
    simplified: row.simplified as string,
    traditional: (row.traditional as string | null) ?? null,
    pinyin: row.pinyin as string,
    hsk_level: row.hsk_level as number,
    frequency_rank: (row.frequency_rank as number | null) ?? null,
    pos: Array.isArray(row.pos) ? (row.pos as string[]) : [],
    meanings: Array.isArray(row.meanings) ? (row.meanings as string[]) : [],
    measure_word: (row.measure_word as { mw: string; pinyin: string } | null) ?? null,
    lesson_card: (row.lesson_card as import("./types").LessonCard | null) ?? null,
    readings: Array.isArray(row.readings) ? (row.readings as Reading[]) : [
      { pinyin: row.pinyin as string, traditional: (row.traditional as string | null) ?? null, meanings: Array.isArray(row.meanings) ? (row.meanings as string[]) : [] }
    ],
  };
}

async function ensureLessonCard(
  word: Word
): Promise<Word & { lesson_card: NonNullable<Word["lesson_card"]> }> {
  if (word.lesson_card) return word as Word & { lesson_card: NonNullable<Word["lesson_card"]> };

  const card = await generateLessonCard(word);
  // Write via service role (shared cache — same card for all users)
  const admin = createAdminClient();
  await admin
    .from("words")
    .update({ lesson_card: card })
    .eq("id", word.id);

  return { ...word, lesson_card: card };
}

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

// ---------------------------------------------------------------------------
// Limits helpers
// ---------------------------------------------------------------------------

function isUnlimited(profile: Profile): boolean {
  // Admins and the super-admin bypass all limits
  return profile.role === "admin" || profile.email === SUPER_ADMIN_EMAIL;
}

function getSessionCap(profile: Profile): number | null {
  if (isUnlimited(profile)) return null;
  return profile.max_sessions ?? FREE_MAX_SESSIONS;
}

function getVocabCap(profile: Profile): number | null {
  if (isUnlimited(profile)) return null;
  return profile.max_vocab_words ?? FREE_MAX_VOCAB_WORDS;
}

function sessionScore(items: { outcome: string | null }[]): { correct: number; answered: number } {
  const answered = items.filter((it) => it.outcome !== null).length;
  const correct = items.filter((it) => it.outcome === "correct").length;
  return { correct, answered };
}

// ---------------------------------------------------------------------------
// _createSession (shared core)
// ---------------------------------------------------------------------------

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

  // Insert items with question: null (lazy generation)
  const itemInserts = words.map((w, i) => ({
    session_id: sessionId,
    user_id: userId,
    order_index: i,
    word_id: w.id,
    question: null,
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
    question_json: null,
    user_answer: null,
    grader_output_json: null,
    response_time_ms: null,
    outcome: null,
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

// ---------------------------------------------------------------------------
// ensureItemQuestion
// ---------------------------------------------------------------------------

export async function ensureItemQuestion(
  supabase: SupabaseClient,
  userId: string,
  itemId: number
): Promise<Question> {
  // Load item (verify ownership via user_id filter)
  const { data: item } = await supabase
    .from("session_items")
    .select("*, words(id, simplified, traditional, pinyin, hsk_level, pos, meanings, frequency_rank, lesson_card, readings)")
    .eq("id", itemId)
    .eq("user_id", userId)
    .single();

  if (!item) throw new Error(`session_item ${itemId} not found`);

  // Already generated?
  if (item.question) return item.question as Question;

  const w = (item.words as Record<string, unknown>) ?? {};
  const word = normalizeWordRow(w);

  // Generate with stub fallback
  const question = await safeGenerateQuestion(word);

  // Persist
  await supabase
    .from("session_items")
    .update({ question })
    .eq("id", itemId)
    .eq("user_id", userId);

  return question;
}

// ---------------------------------------------------------------------------
// startSession
// ---------------------------------------------------------------------------

export async function startSession(
  supabase: SupabaseClient,
  userId: string,
  kind: string = "mixed",
  size: number = DEFAULT_SESSION_SIZE
): Promise<Session> {
  const profile = await getProfile(supabase, userId);
  const level = profile.current_hsk_level ?? START_HSK_LEVEL;

  // Enforce session cap
  const sessionCap = getSessionCap(profile);
  if (sessionCap !== null) {
    const { count: sessionCount } = await supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    if ((sessionCount ?? 0) >= sessionCap) {
      throw new Error(
        `Free plan limit reached (${sessionCap} session${sessionCap === 1 ? "" : "s"}). Ask an admin to raise your limit.`
      );
    }
  }

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

  // Enforce session cap
  const sessionCap = getSessionCap(profile);
  if (sessionCap !== null) {
    const { count: sessionCount } = await supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    if ((sessionCount ?? 0) >= sessionCap) {
      throw new Error(
        `Free plan limit reached (${sessionCap} session${sessionCap === 1 ? "" : "s"}). Ask an admin to raise your limit.`
      );
    }
  }

  const { data } = await supabase.from("words").select("*").in("id", wordIds);
  const words = (data ?? []).map(normalizeWordRow);

  return createSession(supabase, userId, words, kind, level);
}

// ---------------------------------------------------------------------------
// recordStudyActivity
// ---------------------------------------------------------------------------

export async function recordStudyActivity(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const profile = await getProfile(supabase, userId);

  if (profile.last_study_date === today) return; // already counted today

  let streak = profile.study_streak_days ?? 0;
  const last = profile.last_study_date
    ? new Date(profile.last_study_date)
    : null;

  const todayDate = new Date(today);
  const yesterday = new Date(todayDate);
  yesterday.setDate(yesterday.getDate() - 1);

  if (last && last.toISOString().split("T")[0] === yesterday.toISOString().split("T")[0]) {
    streak += 1;
  } else {
    streak = 1;
  }

  await supabase
    .from("profiles")
    .update({ study_streak_days: streak, last_study_date: today })
    .eq("user_id", userId);
}

// ---------------------------------------------------------------------------
// gradeAnswer
// ---------------------------------------------------------------------------

export async function gradeAnswer(
  supabase: SupabaseClient,
  userId: string,
  sessionItemId: number,
  answer: string,
  responseTimeMs: number,
  hesitated: boolean = false
): Promise<{
  grader_output: GraderOutput;
  srs_summary: import("./types").SrsState;
  session_complete: boolean;
  outcome: Outcome;
  new_cursor: number;
}> {
  // Load item
  const { data: item } = await supabase
    .from("session_items")
    .select("*")
    .eq("id", sessionItemId)
    .eq("user_id", userId)
    .single();

  if (!item) throw new Error(`session_item ${sessionItemId} not found`);

  const wordId = item.word_id as number;
  const sessionId = item.session_id as number;

  // Lazy-generate question if not yet set
  let question = item.question as Question | null;
  if (!question) {
    question = await ensureItemQuestion(supabase, userId, sessionItemId);
  }

  // Grade
  const graderOut = await gradeAnswerWithCache(supabase, wordId, question, answer);

  // Determine outcome
  const overTimer = responseTimeMs > 20_000;
  let outcome: Outcome;
  if (hesitated) {
    outcome = "hesitated";
  } else if (graderOut.correct) {
    outcome = "correct";
  } else {
    outcome = "wrong";
  }

  // Persist item
  await supabase
    .from("session_items")
    .update({
      user_answer: answer,
      grader_output: graderOut,
      response_time_ms: responseTimeMs,
      outcome,
    })
    .eq("id", sessionItemId)
    .eq("user_id", userId);

  // Advance cursor
  const { data: session } = await supabase
    .from("sessions")
    .select("cursor")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  const newCursor = (session?.cursor as number ?? 0) + 1;

  const { count: totalItems } = await supabase
    .from("session_items")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("user_id", userId);

  const sessionComplete = newCursor >= (totalItems ?? 0);

  if (sessionComplete) {
    await supabase
      .from("sessions")
      .update({ cursor: newCursor, status: "completed", completed_at: Date.now() / 1000 })
      .eq("id", sessionId)
      .eq("user_id", userId);
  } else {
    await supabase
      .from("sessions")
      .update({ cursor: newCursor })
      .eq("id", sessionId)
      .eq("user_id", userId);
  }

  // Update SRS
  const srsSummary = await updateSrs(supabase, userId, wordId, outcome, overTimer, hesitated);

  // Record daily streak
  await recordStudyActivity(supabase, userId);

  return {
    grader_output: graderOut,
    srs_summary: srsSummary,
    session_complete: sessionComplete,
    outcome,
    new_cursor: newCursor,
  };
}

// ---------------------------------------------------------------------------
// loadSession
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// listSessions
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// redrillSession
// ---------------------------------------------------------------------------

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

  let questions: (Question | null)[];
  if (withVariation) {
    // Lazy: insert null, questions generated on demand as user progresses
    questions = orig.items.map(() => null);
  } else {
    questions = orig.items.map((it) => it.question_json);
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

  const itemInserts = orig.items.map((origItem, i) => ({
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

  const items: SessionItem[] = orig.items.map((origItem, i) => ({
    item_id: (itemRows ?? [])[i]?.id as number,
    order_index: i,
    word: origItem.word,
    lesson_card: origItem.lesson_card,
    question_json: questions[i],
    user_answer: null,
    grader_output_json: null,
    response_time_ms: null,
    outcome: null,
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

// ---------------------------------------------------------------------------
// dueReviews
// ---------------------------------------------------------------------------

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
    .eq("mastered", false)
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

// ---------------------------------------------------------------------------
// getStats
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// getInProgressSession
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------

export async function vocabCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { count } = await supabase
    .from("srs_state")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  return count ?? 0;
}

export async function listVocabulary(
  supabase: SupabaseClient,
  userId: string
): Promise<
  (Word & {
    box: number;
    mastered: boolean;
    next_review_at: number;
    correct_count: number;
    wrong_count: number;
    due: boolean;
  })[]
> {
  const nowSeconds = Date.now() / 1000;

  // lesson_card is intentionally excluded — it is large JSONB not needed by the list view.
  const { data: rows } = await supabase
    .from("srs_state")
    .select(`
      box, mastered, next_review_at, correct_count, wrong_count,
      words (id, simplified, traditional, pinyin, hsk_level, pos, meanings, frequency_rank)
    `)
    .eq("user_id", userId)
    .order("next_review_at", { ascending: true })
    .order("box", { ascending: true });

  return (rows ?? [])
    .filter((r) => r.words)
    .map((r) => {
      const w = (r.words as unknown) as Record<string, unknown>;
      const nextReviewAt = r.next_review_at as number;
      return {
        ...normalizeWordRow(w),
        box: r.box as number,
        mastered: r.mastered as boolean,
        next_review_at: nextReviewAt,
        correct_count: r.correct_count as number,
        wrong_count: r.wrong_count as number,
        due: nextReviewAt <= nowSeconds && !r.mastered,
      };
    })
    .sort((a, b) => {
      // due first, then lowest box, then by frequency_rank
      if (a.due !== b.due) return a.due ? -1 : 1;
      return a.box - b.box;
    });
}

export async function getWordCard(
  supabase: SupabaseClient,
  userId: string,
  wordId: number
): Promise<{
  word: Word;
  lesson_card: import("./types").LessonCard | null;
  srs: import("./types").SrsState | null;
}> {
  const { data: wordRow } = await supabase
    .from("words")
    .select("*")
    .eq("id", wordId)
    .single();

  if (!wordRow) throw new Error(`Word ${wordId} not found`);

  const word = normalizeWordRow(wordRow);
  const enriched = await ensureLessonCard(word);

  const { data: srsRow } = await supabase
    .from("srs_state")
    .select("*")
    .eq("user_id", userId)
    .eq("word_id", wordId)
    .single();

  return {
    word: normalizeWordRow(enriched as unknown as Record<string, unknown>),
    lesson_card: enriched.lesson_card,
    srs: srsRow as import("./types").SrsState | null,
  };
}

export async function regenerateWordCard(
  supabase: SupabaseClient,
  userId: string,
  wordId: number,
  reason?: string
): Promise<{
  word: Word;
  lesson_card: import("./types").LessonCard;
  srs: import("./types").SrsState | null;
}> {
  const { data: wordRow } = await supabase
    .from("words")
    .select("*")
    .eq("id", wordId)
    .single();

  if (!wordRow) throw new Error(`Word ${wordId} not found`);
  const word = normalizeWordRow(wordRow);

  const card = await generateLessonCard(word, reason);
  const admin = createAdminClient();
  await admin.from("words").update({ lesson_card: card }).eq("id", word.id);

  const { data: srsRow } = await supabase
    .from("srs_state")
    .select("*")
    .eq("user_id", userId)
    .eq("word_id", wordId)
    .single();

  return {
    word: { ...word, lesson_card: card },
    lesson_card: card,
    srs: srsRow as import("./types").SrsState | null,
  };
}

export async function addWordsToBank(
  supabase: SupabaseClient,
  userId: string,
  count: number = 1
): Promise<Word[]> {
  const profile = await getProfile(supabase, userId);
  const level = profile.current_hsk_level ?? START_HSK_LEVEL;

  // Enforce vocab cap
  const vocabCap = getVocabCap(profile);
  if (vocabCap !== null) {
    const current = await vocabCount(supabase, userId);
    const remaining = vocabCap - current;
    if (remaining <= 0) {
      throw new Error(
        `Free plan limit reached (${vocabCap} word${vocabCap === 1 ? "" : "s"}). Ask an admin to raise your limit.`
      );
    }
    count = Math.min(count, remaining);
  }

  let words = await getUnseenWords(supabase, userId, count, level);
  if (words.length === 0) {
    // fallback: try any level
    const { data } = await supabase
      .from("words")
      .select(`*, srs_state!left(user_id)`)
      .is("srs_state.user_id", null)
      .order("frequency_rank", { ascending: true, nullsFirst: false })
      .limit(count);
    words = (data ?? []).map(normalizeWordRow);
  }

  const added: Word[] = [];
  for (const w of words) {
    const enriched = await ensureLessonCard(w);
    await ensureSrsState(supabase, userId, w.id);
    added.push(normalizeWordRow(enriched as unknown as Record<string, unknown>));
  }
  return added;
}

export async function listAddableWords(
  supabase: SupabaseClient,
  userId: string,
  size: number = 40
): Promise<Word[]> {
  const profile = await getProfile(supabase, userId);
  const level = profile.current_hsk_level ?? START_HSK_LEVEL;

  let words = await getUnseenWords(supabase, userId, size, level);
  if (words.length === 0) {
    const { data } = await supabase
      .from("words")
      .select(`*, srs_state!left(user_id)`)
      .is("srs_state.user_id", null)
      .order("frequency_rank", { ascending: true, nullsFirst: false })
      .limit(size);
    words = (data ?? []).map(normalizeWordRow);
  }
  return words;
}
