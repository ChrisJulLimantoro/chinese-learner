"""
llm.py — OpenCode Zen client + stub.
Three call sites: generate_lesson_card, generate_questions, grade.
When USE_STUB is True, deterministic canned output is returned with no HTTP calls.
"""
import json
import logging
import re
from typing import Any

from learner.config import (
    USE_STUB,
    OPENCODE_API_KEY,
    OPENCODE_ZEN_BASE_URL,
    MODEL_BY_PURPOSE,
    LLM_MAX_TOKENS,
    LLM_MAX_RETRIES,
    MAX_TOKENS_BY_PURPOSE,
)

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# OpenAI client (lazy init)
# ---------------------------------------------------------------------------
_client = None


def _get_client():
    global _client
    if _client is None:
        from openai import OpenAI
        _client = OpenAI(
            api_key=OPENCODE_API_KEY,
            base_url=OPENCODE_ZEN_BASE_URL,
        )
    return _client


_THINK_RE = re.compile(r"<think>.*?</think>", re.DOTALL | re.IGNORECASE)


def _chat(purpose: str, messages: list[dict], temperature: float = 0.4) -> tuple[str, str]:
    """
    Make one OpenCode Zen chat completion.
    Returns (content, finish_reason). Reasoning text is never returned as content.
    """
    client = _get_client()
    model = MODEL_BY_PURPOSE[purpose]
    log.info("[LLM] %s → %s", purpose, model)
    resp = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,
        max_tokens=MAX_TOKENS_BY_PURPOSE.get(purpose, LLM_MAX_TOKENS),
        response_format={"type": "json_object"},
    )
    msg = resp.choices[0].message
    finish = resp.choices[0].finish_reason

    content = _THINK_RE.sub("", msg.content or "").strip()
    log.debug("[LLM] %s finish=%s content_len=%d", purpose, finish, len(content))
    return content, finish


def _chat_json(purpose: str, messages: list[dict], temperature: float = 0.4) -> Any:
    """
    Call the LLM and return parsed JSON, retrying on empty/truncated/invalid output.
    Raises RuntimeError if no valid JSON is produced within LLM_MAX_RETRIES attempts.
    """
    last_err = "no response"
    for attempt in range(1, LLM_MAX_RETRIES + 1):
        try:
            content, finish = _chat(purpose, messages, temperature)
        except Exception as e:  # noqa: BLE001 — network/API errors are retryable
            last_err = f"request failed: {e}"
            log.warning("[LLM] %s attempt %d/%d %s", purpose, attempt, LLM_MAX_RETRIES, last_err)
            continue

        if not content:
            last_err = f"empty content (finish_reason={finish})"
        elif finish == "length":
            last_err = "response truncated (finish_reason=length)"
        else:
            try:
                return _extract_json(content)
            except ValueError as e:
                last_err = str(e)

        log.warning("[LLM] %s attempt %d/%d failed: %s", purpose, attempt, LLM_MAX_RETRIES, last_err)

    raise RuntimeError(f"LLM '{purpose}' did not return valid JSON after {LLM_MAX_RETRIES} attempts: {last_err}")


def _extract_json(text: str) -> Any:
    """Extract the first JSON object or array from text, handling markdown fences."""
    # Strip markdown code fences (```json ... ``` or ``` ... ```)
    fenced = re.sub(r"^```(?:json)?\s*", "", text.strip(), flags=re.IGNORECASE)
    fenced = re.sub(r"\s*```$", "", fenced.strip())

    # Try direct parse on stripped text
    for candidate in (fenced, text.strip()):
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            pass

    # Find first { or [ and match to its closing bracket
    for start_char, end_char in [('{', '}'), ('[', ']')]:
        idx = text.find(start_char)
        if idx == -1:
            continue
        depth = 0
        in_string = False
        escape_next = False
        for i, ch in enumerate(text[idx:], start=idx):
            if escape_next:
                escape_next = False
                continue
            if ch == '\\' and in_string:
                escape_next = True
                continue
            if ch == '"':
                in_string = not in_string
                continue
            if in_string:
                continue
            if ch == start_char:
                depth += 1
            elif ch == end_char:
                depth -= 1
                if depth == 0:
                    try:
                        return json.loads(text[idx:i + 1])
                    except json.JSONDecodeError:
                        break

    raise ValueError(f"No valid JSON found in LLM response: {text[:300]}")


# ---------------------------------------------------------------------------
# Stub helpers (offline, deterministic)
# ---------------------------------------------------------------------------

def _stub_lesson_card(word: dict) -> dict:
    """Return a canned lesson card matching the §6 schema."""
    simplified = word.get("simplified", "?")
    pinyin = word.get("pinyin", "")
    meanings = word.get("meanings") or ["(meaning)"]
    if isinstance(meanings, str):
        import json as _j
        try:
            meanings = _j.loads(meanings)
        except Exception:
            meanings = [meanings]
    pos = word.get("pos") or ["word"]
    if isinstance(pos, str):
        import json as _j
        try:
            pos = _j.loads(pos)
        except Exception:
            pos = [pos]

    return {
        "simplified": simplified,
        "traditional": word.get("traditional"),
        "pinyin_marked": pinyin,
        "pinyin_numbered": pinyin,
        "hsk_level": word.get("hsk_level", 2),
        "frequency_rank": word.get("frequency_rank"),
        "pos": pos,
        "core_meanings": meanings[:3] if meanings else ["(stub meaning)"],
        "nuance": f"[STUB] This is a stub lesson card for '{simplified}'. No API key set.",
        "register": "neutral",
        "measure_word": None,
        "examples": [
            {
                "hanzi": f"我喜欢{simplified}。",
                "pinyin": f"Wǒ xǐhuān {pinyin}。",
                "gloss": f"I like {meanings[0] if meanings else simplified}.",
            },
            {
                "hanzi": f"这个{simplified}很好。",
                "pinyin": f"Zhège {pinyin} hěn hǎo。",
                "gloss": f"This {meanings[0] if meanings else simplified} is very good.",
            },
        ],
        "collocations": [simplified],
        "near_synonyms": [],
        "common_mistakes": [
            "[STUB] Add a real API key to see real common mistakes."
        ],
        "character_breakdown": [
            {"char": c, "meaning": "(stub)", "mnemonic": "(stub)"}
            for c in simplified
        ],
    }


def _stub_questions(words: list[dict]) -> list[dict]:
    """Return one question per word, cycling through all four types."""
    types = ["en_to_zh", "cloze", "synonym_discrim", "gloss_to_word"]
    questions = []
    for i, w in enumerate(words):
        simplified = w.get("simplified", "?")
        meanings = w.get("meanings") or ["(meaning)"]
        if isinstance(meanings, str):
            import json as _j
            try:
                meanings = _j.loads(meanings)
            except Exception:
                meanings = [meanings]
        gloss = meanings[0] if meanings else "something"

        qtype = types[i % len(types)]

        if qtype == "en_to_zh":
            prompt = f"Translate into Mandarin: '{gloss}'"
        elif qtype == "cloze":
            prompt = f"Fill in the blank: 我___ (using '{simplified}')"
        elif qtype == "synonym_discrim":
            prompt = (
                f"Choose the word that fits better in context (habitual action): "
                f"Option A: {simplified} | Option B: [near synonym]. "
                f"Type your answer in hanzi."
            )
        else:  # gloss_to_word
            prompt = f"What Mandarin word means '{gloss}'? (Enter the hanzi)"

        questions.append({
            "type": qtype,
            "prompt": prompt,
            "target_word": simplified,
            "context": gloss,
        })
    return questions


def _stub_grade(question: dict, answer: str) -> dict:
    """
    Stub grader: correct if the answer contains the target word (case-insensitive
    for ASCII fallback). Matches spec §7 grader_output_json schema.
    """
    target = question.get("target_word", "")
    normalized = answer.strip().replace("。", "").replace("，", "").replace(",", "").replace(".", "")
    correct = target in answer if target else bool(answer.strip())
    return {
        "correct": correct,
        "naturalness": 4 if correct else 2,
        "normalized_answer": normalized,
        "feedback": (
            f"[STUB] {'Correct' if correct else 'Incorrect'}. "
            f"Target word was '{target}'."
        ),
        "issues": [] if correct else ["stub_mismatch"],
        "confused_with": None,
        "accept_for_cache": correct,
    }


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_lesson_card(word: dict) -> dict:
    """
    Generate (or stub) a rich lesson card for `word` (a words-table row as dict).
    Returns the §6 JSON object.
    """
    if USE_STUB:
        return _stub_lesson_card(word)

    simplified = word.get("simplified", "")
    pinyin = word.get("pinyin", "")
    meanings = word.get("meanings") or []
    if isinstance(meanings, str):
        try:
            meanings = json.loads(meanings)
        except Exception:
            meanings = [meanings]
    hsk = word.get("hsk_level", 2)

    system = (
        "You are a Chinese-language pedagogy expert. "
        "Output a single JSON object and nothing else. "
        "Do not think out loud, do not explain, do not use markdown fences or any prose. "
        "Begin your response with '{' and end with '}'. "
        "The entire response must be valid for json.loads()."
    )
    user = f"""Create a detailed HSK lesson card for the Mandarin word:
Simplified: {simplified}
Pinyin: {pinyin}
HSK Level: {hsk}
Base meanings: {', '.join(str(m) for m in meanings)}

Return JSON matching EXACTLY this schema (all fields required unless marked nullable):
{{
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
  "measure_word": {{"mw": string, "pinyin": string}} | null,
  "examples": [{{"hanzi": string, "pinyin": string, "gloss": string}}],
  "collocations": [string],
  "near_synonyms": [{{"word": string, "pinyin": string, "distinction": string}}],
  "common_mistakes": [string],
  "character_breakdown": [{{"char": string, "meaning": string, "mnemonic": string}}]
}}
Provide 2-3 examples, near_synonyms if any exist, and character_breakdown for each character.
"""
    return _chat_json("lesson", [{"role": "system", "content": system}, {"role": "user", "content": user}])


def generate_questions(words: list[dict]) -> list[dict]:
    """
    Batch-generate questions for a list of words.
    Returns a list of question dicts matching the §7 schema.
    """
    if USE_STUB:
        return _stub_questions(words)

    words_str = "\n".join(
        f"- {w['simplified']} ({w.get('pinyin','')}) hsk{w.get('hsk_level','')}:"
        f" {', '.join(json.loads(w['meanings']) if isinstance(w.get('meanings'), str) else (w.get('meanings') or []))}"
        for w in words
    )

    system = (
        "You are a Mandarin-language drill designer. "
        "Output a single JSON array and nothing else. "
        "Do not think out loud, do not explain, do not use markdown fences or any prose. "
        "Begin your response with '[' and end with ']'. "
        "The entire response must be valid for json.loads()."
    )
    user = f"""Generate one practice question for each of these Mandarin words.
Use a variety of types: en_to_zh, cloze, synonym_discrim, gloss_to_word.

Words:
{words_str}

Each question JSON must match:
{{
  "type": "en_to_zh" | "cloze" | "synonym_discrim" | "gloss_to_word",
  "prompt": string,       // the question shown to the learner
  "target_word": string,  // the simplified hanzi being tested
  "context": string       // short note on usage context
}}

Rules:
- en_to_zh: give an English sentence to translate into Mandarin
- cloze: give a Mandarin sentence with the target word replaced by ___
- synonym_discrim: give a context sentence + two near-synonym choices described in English; ask learner to type the better one in hanzi
- gloss_to_word: give the English gloss + a usage context; ask learner to type the hanzi
- NO multiple choice — learner types the answer in Mandarin
- Vary types; don't use the same type more than twice in a row

Return a JSON array of exactly {len(words)} question objects.
"""
    result = _chat_json("question", [{"role": "system", "content": system}, {"role": "user", "content": user}])
    if isinstance(result, dict):
        result = list(result.values())
    return result


def grade(question: dict, answer: str) -> dict:
    """
    Grade `answer` against `question`. Returns §7 grader_output_json.
    """
    if USE_STUB:
        return _stub_grade(question, answer)

    system = (
        "You are a Mandarin Chinese language teacher grading a learner's answer. "
        "Output a single JSON object and nothing else. "
        "Do not think out loud, do not explain, do not use markdown fences or any prose. "
        "Begin your response with '{' and end with '}'. "
        "The entire response must be valid for json.loads()."
    )
    user = f"""Grade this answer:

Question type: {question['type']}
Prompt: {question['prompt']}
Target word: {question['target_word']}
Context: {question.get('context', '')}
Learner's answer: {answer}

Return JSON matching EXACTLY:
{{
  "correct": bool,
  "naturalness": int (1-5),
  "normalized_answer": string,
  "feedback": string,
  "issues": [string],
  "confused_with": string | null,
  "accept_for_cache": bool
}}

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
"""
    return _chat_json("grader", [{"role": "system", "content": system}, {"role": "user", "content": user}])
