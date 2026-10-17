import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "./supabase/admin";
import { ensureSrsState, getUnseenWords } from "./srs";
import { generateLessonCard } from "./llm";
import { getProfile, getVocabCap } from "./profileService";
import { normalizeWordRow } from "./wordRow";
import { START_HSK_LEVEL } from "./config";
import type { LessonCard, SrsState, Word } from "./types";

async function ensureLessonCard(
  word: Word
): Promise<Word> {
  if (word.lesson_card) return word;

  try {
    const card = await generateLessonCard(word);
    // Write via service role (shared cache — same card for all users)
    const admin = createAdminClient();
    await admin
      .from("words")
      .update({ lesson_card: card })
      .eq("id", word.id);

    return { ...word, lesson_card: card };
  } catch (error) {
    // Keep session flow resilient when LLM times out, but do not invent card content.
    console.warn(`[lesson-card] failed to generate for word ${word.id}:`, error);
    return word;
  }
}

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
        due: nextReviewAt <= nowSeconds,
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
  lesson_card: LessonCard | null;
  srs: SrsState | null;
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
    srs: srsRow as SrsState | null,
  };
}

export async function regenerateWordCard(
  supabase: SupabaseClient,
  userId: string,
  wordId: number,
  reason?: string
): Promise<{
  word: Word;
  lesson_card: LessonCard;
  srs: SrsState | null;
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
    srs: srsRow as SrsState | null,
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
      .is("srs_state", null)
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
      .is("srs_state", null)
      .order("frequency_rank", { ascending: true, nullsFirst: false })
      .limit(size);
    words = (data ?? []).map(normalizeWordRow);
  }
  return words;
}
