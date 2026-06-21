// config.ts — constants, SRS settings, model config.
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
export const LEAK_PLUGGER_THRESHOLD = 2;     // wrong_count >= N → force back to box 1
export const MASTERY_PERCENT = 0.95;         // 95% of level words mastered to advance
export const LEVEL_FLOOR = 150;              // min mastered words at current level to advance
export const LOWER_LEVEL_REVIEW_SHARE = 0.30; // 30% of reviews from lower levels
export const DRILL_TIMER_SECONDS = 120;

// ---------------------------------------------------------------------------
// Session defaults
// ---------------------------------------------------------------------------
export const DEFAULT_SESSION_SIZE = 10;
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
