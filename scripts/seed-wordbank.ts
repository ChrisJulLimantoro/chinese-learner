/**
 * seed-wordbank.ts — one-time seed of the `words` table from
 * drkameleon/complete-hsk-vocabulary.
 *
 * Run against a Supabase project (reads .env.local automatically):
 *   npm run seed
 *   # or: npx tsx scripts/seed-wordbank.ts
 *
 * Ported from wordbank.py.
 */

import { existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// Load .env.local (or .env) into process.env using Node's native loader
// (Node >= 20.12 / 22). No dotenv dependency needed.
for (const f of [".env.local", ".env"]) {
  if (existsSync(f)) {
    process.loadEnvFile(f);
    break;
  }
}

const WORDBANK_URL_MASTER =
  "https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/master/complete.json";
const WORDBANK_URL_MAIN =
  "https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/main/complete.json";

async function fetchRaw(): Promise<unknown[]> {
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

interface WordRow {
  simplified: string;
  traditional: string | null;
  pinyin: string;
  hsk_level: number;
  frequency_rank: number | null;
  pos: string[];
  meanings: string[];
  measure_word: { mw: string; pinyin: string } | null;
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error(
      "Missing env vars: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Check if already seeded
  const { count } = await supabase
    .from("words")
    .select("*", { count: "exact", head: true });

  if (count && count > 0) {
    console.log(`Word bank already has ${count} rows — skipping.`);
    return;
  }

  const raw = await fetchRaw();
  const rows: WordRow[] = [];

  for (const entry of raw as Record<string, unknown>[]) {
    const level = parseLevel((entry.level as string[]) ?? []);
    if (level === null) continue;

    const simplified = ((entry.simplified as string) ?? "").trim();
    if (!simplified) continue;

    const forms = (entry.forms as Record<string, unknown>[]) ?? [];
    const firstForm = (forms[0] ?? {}) as Record<string, unknown>;

    let traditional = ((firstForm.traditional as string) ?? "").trim() || null;
    if (traditional === simplified) traditional = null;

    const transcriptions = (firstForm.transcriptions as Record<string, string>) ?? {};
    const pinyin = (transcriptions.pinyin ?? "").trim() || simplified;

    const meaningsRaw = (firstForm.meanings as unknown[]) ?? [];
    const meanings: string[] = meaningsRaw.map((m) => String(m).trim()).filter(Boolean);

    const classifiers = (firstForm.classifiers as unknown[]) ?? [];
    let measureWord: { mw: string; pinyin: string } | null = null;
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
    });
  }

  console.log(`Parsed ${rows.length} HSK 2.0 words. Inserting in batches…`);

  // Insert in batches of 500
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("words").insert(batch);
    if (error) {
      console.error(`Batch ${i}–${i + BATCH} error:`, error.message);
      process.exit(1);
    }
    inserted += batch.length;
    console.log(`  ${inserted}/${rows.length} inserted`);
  }

  console.log(`Done! Seeded ${inserted} words.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
