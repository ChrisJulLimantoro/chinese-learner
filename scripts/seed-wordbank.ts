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
import { fetchRaw, parseRows } from "./wordbank-parse";

// Load .env.local (or .env) into process.env using Node's native loader
// (Node >= 20.12 / 22). No dotenv dependency needed.
for (const f of [".env.local", ".env"]) {
  if (existsSync(f)) {
    process.loadEnvFile(f);
    break;
  }
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
  const rows = parseRows(raw);

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
