// config.ts — constants, SRS settings, model config.
import type { Question } from "./types";
// Ported from config.py.

// ---------------------------------------------------------------------------
// SRS constants
// ---------------------------------------------------------------------------
// Box intervals in seconds
export const BOX_INTERVALS: Record<number, number> = {
  1: 8 * 3600,    // 8 hours
  2: 1 * 86400,   // 1 day
  3: 3 * 86400,   // 3 days
  4: 7 * 86400,   // 7 days
  5: 21 * 86400,  // 21 days
};

export const MASTERY_BOX = 5;
export const MASTERY_EXTRA_CORRECT = 3;      // additional correct in box-5 to mark mastered
export const MAINTENANCE_INTERVAL = 90 * 86400;
export const LEAK_PLUGGER_THRESHOLD = 2;     // wrong_count >= N → force back to box 1
export const MASTERY_PERCENT = 0.95;         // 95% of level words mastered to advance
export const LEVEL_FLOOR = 150;              // min mastered words at current level to advance
export const LOWER_LEVEL_REVIEW_SHARE = 0.30; // 30% of reviews from lower levels
export const DRILL_TIMER_SECONDS = 120;
export const DEFAULT_OVER_TIMER_MS = 20_000;
export const OVER_TIMER_MS_BY_TYPE: Record<Question["type"], number> = {
  tone_pick: 10_000,
  gloss_to_word: 20_000,
  synonym_discrim: 20_000,
  cloze: 30_000,
  en_to_zh: 60_000,
};

// ---------------------------------------------------------------------------
// Session defaults
// ---------------------------------------------------------------------------
export const DEFAULT_SESSION_SIZE = 10;
export const QUESTIONS_PER_WORD = 10;
export const MIN_PER_PREFERRED_TYPE = 3;
export const UNSEEN_BOX = 1;
export const TONE_PICK_SHARE = 1 / 3;
export const PREFERRED_TYPES_BY_BOX: Record<number, Question["type"][]> = {
  1: ["gloss_to_word", "synonym_discrim", "tone_pick"],
  2: ["gloss_to_word", "synonym_discrim", "tone_pick"],
  3: ["cloze"],
  4: ["cloze"],
  5: ["en_to_zh"],
};
export const MAX_HSK_LEVEL = 6;
export const MIN_HSK_LEVEL = 1;
export const START_HSK_LEVEL = 2;

// ---------------------------------------------------------------------------
// LLM
// ---------------------------------------------------------------------------
export const OPENCODE_ZEN_BASE_URL = "https://opencode.ai/zen/v1";

const DEFAULT_MODEL = "deepseek-v4-flash-free";

export const MODEL_BY_PURPOSE: Record<string, string> = {
  lesson:   process.env.MODEL_LESSON   ?? DEFAULT_MODEL,
  question: process.env.MODEL_QUESTION ?? DEFAULT_MODEL,
  grader:   process.env.MODEL_GRADER   ?? DEFAULT_MODEL,
};

export const LLM_MAX_TOKENS = parseInt(process.env.LLM_MAX_TOKENS ?? "4096", 10);
export const LLM_MAX_RETRIES = parseInt(process.env.LLM_MAX_RETRIES ?? "2", 10);
export const LLM_TIMEOUT_MS = parseInt(process.env.LLM_TIMEOUT_MS ?? "20000", 10);

// Per-purpose token budgets. Questions lowered to 4096 (avoids Vercel timeout).
export const MAX_TOKENS_BY_PURPOSE: Record<string, number> = {
  lesson:   parseInt(process.env.LLM_MAX_TOKENS_LESSON   ?? String(LLM_MAX_TOKENS), 10),
  question: parseInt(process.env.LLM_MAX_TOKENS_QUESTION ?? "4096", 10),
  grader:   parseInt(process.env.LLM_MAX_TOKENS_GRADER   ?? "16384", 10),
};

export const USE_STUB = !(process.env.LLM_API_KEY ?? "").trim();

// ---------------------------------------------------------------------------
// Free-tier limits & admin
// ---------------------------------------------------------------------------
export const FREE_MAX_VOCAB_WORDS = 5;
export const FREE_MAX_SESSIONS = 3;
export const SUPER_ADMIN_EMAIL = "christopherlimantoro@gmail.com";

// ---------------------------------------------------------------------------
// Word bank source
// ---------------------------------------------------------------------------
export const WORDBANK_URL_MASTER =
  "https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/master/complete.json";
export const WORDBANK_URL_MAIN =
  "https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/main/complete.json";
