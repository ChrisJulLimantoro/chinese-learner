"use server";

import { getUserContext } from "@/lib/user";
import {
  listVocabulary,
  getWordCard,
  addWordsToBank,
  listAddableWords,
  vocabCount,
  getStats,
} from "@/lib/services";

export async function listVocabularyAction() {
  const { supabase, userId } = await getUserContext();
  return listVocabulary(supabase, userId);
}

export async function getWordCardAction(wordId: number) {
  const { supabase, userId } = await getUserContext();
  return getWordCard(supabase, userId, wordId);
}

export async function addWordsToBankAction(count?: number) {
  const { supabase, userId } = await getUserContext();
  return addWordsToBank(supabase, userId, count);
}

export async function listAddableWordsAction(size?: number) {
  const { supabase, userId } = await getUserContext();
  return listAddableWords(supabase, userId, size);
}

export async function vocabCountAction() {
  const { supabase, userId } = await getUserContext();
  return vocabCount(supabase, userId);
}

export async function getStatsAction() {
  const { supabase, userId } = await getUserContext();
  return getStats(supabase, userId);
}
