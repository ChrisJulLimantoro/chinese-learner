/**
 * llm.ts — OpenCode Zen client + stub.
 * Ported from llm.py.
 * USE_STUB when LLM_API_KEY is missing — deterministic canned output, no HTTP calls.
 */
import OpenAI from "openai";
import {
  USE_STUB,
  OPENCODE_ZEN_BASE_URL,
  MODEL_BY_PURPOSE,
  LLM_MAX_TOKENS,
  LLM_MAX_RETRIES,
  MAX_TOKENS_BY_PURPOSE,
} from "./config";
import type { LessonCard, Question, GraderOutput, Reading } from "./types";

// ---------------------------------------------------------------------------
// OpenAI client (lazy)
// ---------------------------------------------------------------------------
let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.LLM_API_KEY ?? "",
      baseURL: OPENCODE_ZEN_BASE_URL,
      timeout: 20_000,
      maxRetries: 0,
    });
  }
  return _client;
}

const THINK_RE = /<think>.*?<\/think>/gis;

async function chat(
  purpose: string,
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  temperature = 0.4
): Promise<[string, string]> {
  const client = getClient();
  const model = MODEL_BY_PURPOSE[purpose];
  const resp = await client.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: MAX_TOKENS_BY_PURPOSE[purpose] ?? LLM_MAX_TOKENS,
    response_format: { type: "json_object" },
  });
  const msg = resp.choices[0].message;
  const finish = resp.choices[0].finish_reason ?? "stop";
  const content = (msg.content ?? "").replace(THINK_RE, "").trim();
  return [content, finish];
}

async function chatJson<T>(
  purpose: string,
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  temperature = 0.4
): Promise<T> {
  let lastErr = "no response";
  for (let attempt = 1; attempt <= LLM_MAX_RETRIES; attempt++) {
    try {
      const [content, finish] = await chat(purpose, messages, temperature);
      if (!content) {
        lastErr = `empty content (finish_reason=${finish})`;
      } else if (finish === "length") {
        lastErr = "response truncated (finish_reason=length)";
      } else {
        try {
          return extractJson<T>(content);
        } catch (e) {
          lastErr = String(e);
        }
      }
    } catch (e) {
      lastErr = `request failed: ${e}`;
    }
  }
  throw new Error(
    `LLM '${purpose}' did not return valid JSON after ${LLM_MAX_RETRIES} attempts: ${lastErr}`
  );
}

function extractJson<T>(text: string): T {
  // Strip markdown fences
  const candidate = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  // Try direct parse
  for (const s of [candidate, text.trim()]) {
    try {
      return JSON.parse(s) as T;
    } catch {
      // continue
    }
  }

  // Find first { or [
  for (const [startChar, endChar] of [
    ["{", "}"],
    ["[", "]"],
  ]) {
    const idx = text.indexOf(startChar);
    if (idx === -1) continue;
    let depth = 0;
    let inString = false;
    let escapeNext = false;
    for (let i = idx; i < text.length; i++) {
      const ch = text[i];
      if (escapeNext) { escapeNext = false; continue; }
      if (ch === "\\" && inString) { escapeNext = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === startChar) depth++;
      else if (ch === endChar) {
        depth--;
        if (depth === 0) {
          try {
            return JSON.parse(text.slice(idx, i + 1)) as T;
          } catch {
            break;
          }
        }
      }
    }
  }

  throw new Error(`No valid JSON found in LLM response: ${text.slice(0, 300)}`);
}

// ---------------------------------------------------------------------------
// Stub helpers (offline, deterministic)
// ---------------------------------------------------------------------------

export function stubLessonCard(word: {
  simplified: string;
  traditional?: string | null;
  pinyin?: string;
  hsk_level?: number;
  frequency_rank?: number | null;
  pos?: string[];
  meanings?: string[];
  readings?: Reading[];
}): LessonCard {
  const simplified = word.simplified ?? "?";
  const pinyin = word.pinyin ?? "";
  const readings = word.readings;
  const meanings = (readings && readings.length > 1)
    ? Array.from(new Set(readings.flatMap((r) => r.meanings)))
    : (word.meanings ?? ["(meaning)"]);
  const pos = word.pos ?? ["word"];

  return {
    simplified,
    traditional: word.traditional ?? null,
    pinyin_marked: pinyin,
    pinyin_numbered: pinyin,
    hsk_level: word.hsk_level ?? 2,
    frequency_rank: word.frequency_rank ?? null,
    pos,
    core_meanings: meanings.slice(0, 3).length ? meanings.slice(0, 3) : ["(stub meaning)"],
    nuance: `[STUB] This is a stub lesson card for '${simplified}'. No API key set.`,
    register: "neutral",
    measure_word: null,
    examples: [
      {
        hanzi: `我喜欢${simplified}。`,
        pinyin: `Wǒ xǐhuān ${pinyin}。`,
        gloss: `I like ${meanings[0] ?? simplified}.`,
      },
      {
        hanzi: `这个${simplified}很好。`,
        pinyin: `Zhège ${pinyin} hěn hǎo。`,
        gloss: `This ${meanings[0] ?? simplified} is very good.`,
      },
    ],
    collocations: [simplified],
    near_synonyms: [],
    common_mistakes: ["[STUB] Add a real API key to see real common mistakes."],
    character_breakdown: Array.from(simplified).map((char) => ({
      char,
      meaning: "(stub)",
      mnemonic: "(stub)",
    })),
  };
}

export function stubQuestions(words: { simplified: string; meanings?: string[]; readings?: Reading[] }[]): Question[] {
  const types: Question["type"][] = [
    "en_to_zh",
    "cloze",
    "synonym_discrim",
    "gloss_to_word",
  ];
  return words.map((w, i) => {
    const simplified = w.simplified ?? "?";
    const readings = w.readings;
    const meanings = w.meanings ?? ["something"];
    const gloss = meanings[0] ?? "something";
    const qtype = types[i % types.length];
    // Pick a target reading for multi-reading words
    const targetReading = readings && readings.length > 1 ? readings[i % readings.length] : null;
    const readingHint = targetReading ? ` (intended reading: ${targetReading.pinyin})` : "";

    let prompt: string;
    if (qtype === "en_to_zh") {
      prompt = `Translate into Mandarin: '${gloss}'${readingHint}`;
    } else if (qtype === "cloze") {
      prompt = `Fill in the blank: 我___ (using '${simplified}'${readingHint})`;
    } else if (qtype === "synonym_discrim") {
      prompt =
        `Choose the word that fits better in context (habitual action)${readingHint}: ` +
        `Option A: ${simplified} | Option B: [near synonym]. Type your answer in hanzi.`;
    } else {
      prompt = `What Mandarin word means '${gloss}'?${readingHint} (Enter the hanzi)`;
    }

    return { type: qtype, prompt, target_word: simplified, context: gloss };
  });
}

function stubGrade(question: Question, answer: string): GraderOutput {
  const target = question.target_word ?? "";
  const normalized = answer
    .trim()
    .replace(/[。，,.]/g, "");
  const correct = target ? answer.includes(target) : Boolean(answer.trim());
  return {
    correct,
    naturalness: correct ? 4 : 2,
    normalized_answer: normalized,
    feedback: `[STUB] ${correct ? "Correct" : "Incorrect"}. Target word was '${target}'.`,
    issues: correct ? [] : ["stub_mismatch"],
    confused_with: null,
    accept_for_cache: correct,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function safeGenerateQuestion(
  word: { simplified: string; pinyin?: string; hsk_level?: number; meanings?: string[]; readings?: Reading[] }
): Promise<Question> {
  try {
    const results = await generateQuestions([word]);
    return results[0];
  } catch {
    return stubQuestions([word])[0];
  }
}

export async function generateLessonCard(word: {
  simplified: string;
  traditional?: string | null;
  pinyin?: string;
  hsk_level?: number;
  frequency_rank?: number | null;
  pos?: string[];
  meanings?: string[];
  readings?: Reading[];
}, reason?: string): Promise<LessonCard> {
  if (USE_STUB) return stubLessonCard(word);

  const simplified = word.simplified ?? "";
  const pinyin = word.pinyin ?? "";
  const meanings = word.meanings ?? [];
  const hsk = word.hsk_level ?? 2;
  const readings = word.readings;
  const hasMultipleReadings = readings && readings.length > 1;

  const system =
    "You are a Chinese-language pedagogy expert. " +
    "Output a single JSON object and nothing else. " +
    "Do not think out loud, do not explain, do not use markdown fences or any prose. " +
    "Begin your response with '{' and end with '}'. " +
    "The entire response must be valid for JSON.parse().";

  const correction = reason?.trim()
    ? `\n\nThe previous version of this card was reported as INCORRECT for the following reason:\n"${reason.trim()}"\nFix this specifically and ensure the new card is accurate.`
    : "";

  const multiReadingBlock = hasMultipleReadings
    ? `\nThis word has multiple readings:\n${readings!.map((r) => `- ${r.pinyin}: ${r.meanings.join(", ")}`).join("\n")}\n\nDocument EVERY reading in this lesson card — each with its own pinyin headline and meanings. The examples, nuance, and character_breakdown must cover all readings.\n`
    : "";

  const pinyinGrounding = hasMultipleReadings
    ? readings!.map((r) => r.pinyin).join(" / ")
    : pinyin;

  const user = `Create a detailed HSK lesson card for the Mandarin word:
Simplified: ${simplified}
Pinyin: ${pinyin}
HSK Level: ${hsk}
Base meanings: ${meanings.join(", ")}
${multiReadingBlock}
Return JSON matching EXACTLY this schema (all fields required unless marked nullable):
{
  "simplified": string,
  "traditional": string | null,
  "pinyin_marked": string,
  "pinyin_numbered": string,
  "hsk_level": int,
  "frequency_rank": int | null,
  "pos": [string],
  "core_meanings": [string],
  "nuance": string,
  "register": string,
  "measure_word": {"mw": string, "pinyin": string} | null,
  "examples": [{"hanzi": string, "pinyin": string, "gloss": string}],
  "collocations": [string],
  "near_synonyms": [{"word": string, "pinyin": string, "distinction": string}],
  "common_mistakes": [string],
  "character_breakdown": [{"char": string, "meaning": string, "mnemonic": string}]
}
Provide 2-3 examples, near_synonyms if any exist, and character_breakdown for each character.

Grounding rules (critical for accuracy):
- Describe ONLY "${simplified}" (${pinyinGrounding}). Do NOT confuse it with a similar-looking or similar-sounding character (e.g. a homophone or a different-tone reading). The pinyin you output must match "${pinyinGrounding}".
- Base every field on the "Base meanings" above. Do NOT invent senses, surnames, or proper-noun readings that the Base meanings do not support. "core_meanings" must stay consistent with the Base meanings — you may refine or reorder them, but not replace them with an unrelated meaning.
- "character_breakdown" must contain exactly the characters of "${simplified}", in order, and explain those exact characters and nothing else.${correction}
`;

  return chatJson<LessonCard>("lesson", [
    { role: "system", content: system },
    { role: "user", content: user },
  ], 0.2);
}

export async function generateQuestions(
  words: { simplified: string; pinyin?: string; hsk_level?: number; meanings?: string[]; readings?: Reading[] }[]
): Promise<Question[]> {
  if (USE_STUB) return stubQuestions(words);

  const wordsStr = words
    .map((w) => {
      const allMeanings = (w.meanings ?? []).join(", ");
      const base = `- ${w.simplified} (${w.pinyin ?? ""}) hsk${w.hsk_level ?? "?"}: ${allMeanings}`;
      if (w.readings && w.readings.length > 1) {
        const readingLines = w.readings.map((r) => `  Readings: ${r.pinyin} = ${r.meanings.join(", ")}`).join("\n");
        return `${base}\n${readingLines}`;
      }
      return base;
    })
    .join("\n");

  const system =
    "You are a Mandarin-language drill designer. " +
    "Output a single JSON array and nothing else. " +
    "Do not think out loud, do not explain, do not use markdown fences or any prose. " +
    "Begin your response with '[' and end with ']'. " +
    "The entire response must be valid for JSON.parse().";

  const user = `Generate one practice question for each of these Mandarin words.
Use a variety of types: en_to_zh, cloze, synonym_discrim, gloss_to_word.

Words:
${wordsStr}

Each question JSON must match:
{
  "type": "en_to_zh" | "cloze" | "synonym_discrim" | "gloss_to_word",
  "prompt": string,
  "target_word": string,
  "context": string
}

Rules:
- en_to_zh: give an English sentence to translate into Mandarin
- cloze: give a Mandarin sentence with the target word replaced by ___
- synonym_discrim: give a context sentence + two near-synonym choices described in English; ask learner to type the better one in hanzi
- gloss_to_word: give the English gloss + a usage context; ask learner to type the hanzi
- NO multiple choice — learner types the answer in Mandarin
- Vary types; don't use the same type more than twice in a row
- GROUND each question in the meanings listed for that exact word. The gloss/context MUST come from those meanings — do NOT invent a meaning, surname, or proper noun that is not listed, and do NOT confuse a word with a similar-looking or similar-sounding character.
- "target_word" MUST be the exact simplified word from the list, and the prompt's meaning MUST be the meaning of that word (not a homophone or near-homophone).
- If a word has multiple readings, VARY questions across readings — target different readings across the set. State the intended reading in the prompt text (e.g., "Using 还 in the sense of 'to return' (huán)...").

Return a JSON array of exactly ${words.length} question objects.
`;

  const result = await chatJson<Question[] | Record<string, Question>>("question", [
    { role: "system", content: system },
    { role: "user", content: user },
  ], 0.2);

  if (Array.isArray(result)) return result;
  // coerce dict → values (as Python does)
  return Object.values(result);
}

export async function grade(question: Question, answer: string): Promise<GraderOutput> {
  if (USE_STUB) return stubGrade(question, answer);

  const system =
    "You are a Mandarin Chinese language teacher grading a learner's answer. " +
    "Output a single JSON object and nothing else. " +
    "Do not think out loud, do not explain, do not use markdown fences or any prose. " +
    "Begin your response with '{' and end with '}'. " +
    "The entire response must be valid for JSON.parse().";

  const user = `Grade this answer:

Question type: ${question.type}
Prompt: ${question.prompt}
Target word: ${question.target_word}
Context: ${question.context ?? ""}
Learner's answer: ${answer}

Return JSON matching EXACTLY:
{
  "correct": bool,
  "naturalness": int (1-5),
  "normalized_answer": string,
  "feedback": string,
  "issues": [string],
  "confused_with": string | null,
  "accept_for_cache": bool
}

Rules:
- "correct": true if the answer is semantically acceptable (synonyms OK, punctuation ignored)
- "naturalness": 5=perfect native, 4=natural learner, 3=understandable, 2=unnatural, 1=wrong
- "feedback": WRITE IN ENGLISH. Explain what was right or wrong so a beginner can learn from it.
  When you show the correct answer or a corrected phrase, give it in Mandarin hanzi with pinyin in
  parentheses, e.g. 他去酒吧喝酒 (tā qù jiǔbā hē jiǔ). Quote the specific characters the learner got
  wrong and the correct ones. Keep prose itself in English — do not write the explanation in Chinese.
- "issues": use tags like wrong_measure_word, synonym_confusion, grammar_error, etc.
- "confused_with": simplified hanzi of a word the learner likely confused with the target
- "accept_for_cache": true only if this exact normalized answer should always be accepted
`;

  return chatJson<GraderOutput>("grader", [
    { role: "system", content: system },
    { role: "user", content: user },
  ]);
}
