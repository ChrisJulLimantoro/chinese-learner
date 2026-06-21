// Shared TypeScript types for the Chinese Learner app.
import type { SupabaseClient } from "@supabase/supabase-js";

export type Supabase = SupabaseClient;

export type Outcome = "correct" | "wrong" | "hesitated";

export interface Reading {
  pinyin: string;
  traditional: string | null;
  meanings: string[];
}

export interface Word {
  id: number;
  simplified: string;
  traditional: string | null;
  pinyin: string;
  hsk_level: number;
  frequency_rank: number | null;
  pos: string[];
  meanings: string[];
  measure_word: { mw: string; pinyin: string } | null;
  lesson_card: LessonCard | null;
  readings: Reading[];
}

export interface LessonCard {
  simplified: string;
  traditional: string | null;
  pinyin_marked: string;
  pinyin_numbered: string;
  hsk_level: number;
  frequency_rank: number | null;
  pos: string[];
  core_meanings: string[];
  nuance: string;
  register: string;
  measure_word: { mw: string; pinyin: string } | null;
  examples: { hanzi: string; pinyin: string; gloss: string }[];
  collocations: string[];
  near_synonyms: { word: string; pinyin: string; distinction: string }[];
  common_mistakes: string[];
  character_breakdown: { char: string; meaning: string; mnemonic: string }[];
}

export interface Question {
  type: "en_to_zh" | "cloze" | "synonym_discrim" | "gloss_to_word";
  prompt: string;
  target_word: string;
  context: string;
}

export interface GraderOutput {
  correct: boolean;
  naturalness: number; // 1-5
  normalized_answer: string;
  feedback: string;
  issues: string[];
  confused_with: string | null;
  accept_for_cache: boolean;
}

export interface SrsState {
  user_id: string;
  word_id: number;
  box: number;
  next_review_at: number; // unix seconds
  correct_count: number;
  wrong_count: number;
  hesitated_count: number;
  mastered: boolean;
}

export interface SessionItem {
  item_id: number;
  order_index: number;
  word: Word;
  lesson_card: LessonCard | null;
  question_json: Question | null;
  user_answer: string | null;
  grader_output_json: GraderOutput | null;
  response_time_ms: number | null;
  outcome: Outcome | null;
}

export interface Session {
  session_id: number;
  kind: string;
  status: "in_progress" | "completed" | "abandoned";
  created_at: number;
  completed_at: number | null;
  cursor: number;
  parent_session_id: number | null;
  config: Record<string, unknown> | null;
  items: SessionItem[];
}

export interface SessionSummary {
  id: number;
  kind: string;
  status: string;
  created_at: number;
  completed_at: number | null;
  cursor: number;
  size: number;
  answered: number;
  correct: number;
  score: string;
}

export interface Profile {
  user_id: string;
  current_hsk_level: number;
  study_streak_days: number;
  last_study_date: string | null;
  role: "user" | "admin";
  email: string | null;
  max_vocab_words: number | null;
  max_sessions: number | null;
}

export interface DueReviews {
  count: number;
  words: { simplified: string; pinyin: string; box: number; wrong_count: number }[];
}

export interface Stats {
  level: number;
  mastered: number;
  total: number;
  mastery_pct: number;
  weakest: { simplified: string; pinyin: string; box: number; wrong_count: number; correct_count: number }[];
  next_level_progress: {
    can_advance: boolean;
    mastered: number;
    total: number;
  };
  due_count: number;
  streak_days: number;
}
