/**
 * wordbank-parse.ts — shared fetch + parse for the HSK word bank
 * (drkameleon/complete-hsk-vocabulary). Used by both seed-wordbank.ts
 * (initial insert) and backfill-readings.ts (update existing rows).
 *
 * Single source of truth for how raw dataset entries become `words` rows —
 * including multi-reading (heteronym) handling.
 */

const WORDBANK_URL_MASTER =
  "https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/master/complete.json";
const WORDBANK_URL_MAIN =
  "https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/main/complete.json";

export async function fetchRaw(): Promise<unknown[]> {
  for (const url of [WORDBANK_URL_MASTER, WORDBANK_URL_MAIN]) {
    try {
      console.log(`Fetching from ${url}…`);
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return (await resp.json()) as unknown[];
    } catch (e) {
      console.warn(`Failed: ${e}`);
    }
  }
  throw new Error("Could not fetch word bank from either URL");
}

function parseLevel(levels: string[]): number | null {
  for (const lv of levels ?? []) {
    if (lv.startsWith("old-")) {
      const n = parseInt(lv.split("-")[1], 10);
      if (n >= 1 && n <= 6) return n;
    }
  }
  return null;
}

export interface Reading {
  pinyin: string;
  traditional: string | null;
  meanings: string[];
}

export interface WordRow {
  simplified: string;
  traditional: string | null;
  pinyin: string;
  hsk_level: number;
  frequency_rank: number | null;
  pos: string[];
  meanings: string[];
  measure_word: { mw: string; pinyin: string } | null;
  readings: Reading[];
}

/** Parse raw dataset entries into `words` rows (multi-reading aware). */
export function parseRows(raw: unknown[]): WordRow[] {
  const rows: WordRow[] = [];

  for (const entry of raw as Record<string, unknown>[]) {
    const level = parseLevel((entry.level as string[]) ?? []);
    if (level === null) continue;

    const simplified = ((entry.simplified as string) ?? "").trim();
    if (!simplified) continue;

    const forms = (entry.forms as Record<string, unknown>[]) ?? [];

    // --- Build candidate readings from all forms ---
    const candidateReadings: Reading[] = [];
    let measureWord: { mw: string; pinyin: string } | null = null;

    for (const form of forms) {
      const f = (form ?? {}) as Record<string, unknown>;
      const transcriptions = (f.transcriptions as Record<string, string>) ?? {};
      const fPinyin = (transcriptions.pinyin ?? "").trim() || simplified;
      const fTraditional = ((f.traditional as string) ?? "").trim() || null;
      const fTrad = fTraditional === simplified ? null : fTraditional;
      const meaningsRaw = (f.meanings as unknown[]) ?? [];
      const fMeanings: string[] = meaningsRaw.map((m) => String(m).trim()).filter(Boolean);

      candidateReadings.push({ pinyin: fPinyin, traditional: fTrad, meanings: fMeanings });

      // Pick measure word from first form that has classifiers
      if (measureWord === null) {
        const classifiers = (f.classifiers as unknown[]) ?? [];
        if (classifiers.length > 0) {
          const mwEntry = classifiers[0];
          if (typeof mwEntry === "object" && mwEntry !== null) {
            measureWord = {
              mw: (mwEntry as Record<string, string>).simplified ?? String(mwEntry),
              pinyin: "",
            };
          } else if (typeof mwEntry === "string") {
            measureWord = { mw: mwEntry, pinyin: "" };
          }
        }
      }
    }

    // --- Filter out proper-noun-only readings ---
    const isProperNounOnly = (r: Reading) =>
      r.meanings.length > 0 && r.meanings.every((m) => /^surname\b/i.test(m));

    let meaningful = candidateReadings.filter((r) => !isProperNounOnly(r));
    if (meaningful.length === 0) meaningful = candidateReadings;

    // --- Dedup by lowercased pinyin (merge meanings) ---
    const byPinyin = new Map<string, Reading>();
    for (const r of meaningful) {
      const key = r.pinyin.toLowerCase();
      if (byPinyin.has(key)) {
        const existing = byPinyin.get(key)!;
        const merged = Array.from(new Set([...existing.meanings, ...r.meanings]));
        byPinyin.set(key, { ...existing, meanings: merged });
      } else {
        byPinyin.set(key, { ...r, pinyin: r.pinyin.toLowerCase() });
      }
    }
    const dedupedReadings = Array.from(byPinyin.values());

    // --- Pick primary reading (most meanings; prefer lowercase-initial) ---
    const maxMeanings = Math.max(...dedupedReadings.map((r) => r.meanings.length));
    const topReadings = dedupedReadings.filter((r) => r.meanings.length === maxMeanings);
    const primary = topReadings.find((r) => !/^[A-Z]/.test(r.pinyin)) ?? topReadings[0];

    // --- Derive convenience fields ---
    const pinyin = primary.pinyin.toLowerCase();
    const traditional = primary.traditional;

    // Merge all meanings: primary first, then others, deduped
    const allMeaningsSet = new Set<string>();
    const meanings: string[] = [];
    for (const m of primary.meanings) {
      if (!allMeaningsSet.has(m)) { allMeaningsSet.add(m); meanings.push(m); }
    }
    for (const r of dedupedReadings) {
      if (r === primary) continue;
      for (const m of r.meanings) {
        if (!allMeaningsSet.has(m)) { allMeaningsSet.add(m); meanings.push(m); }
      }
    }

    const posRaw = (entry.pos as unknown[]) ?? [];
    const pos: string[] = posRaw.map((p) => String(p).trim()).filter(Boolean);

    const freqRank = (entry.frequency as number | null) ?? null;

    rows.push({
      simplified,
      traditional,
      pinyin,
      hsk_level: level,
      frequency_rank: freqRank,
      pos,
      meanings,
      measure_word: measureWord,
      readings: dedupedReadings,
    });
  }

  return rows;
}
