/**
 * backfill-readings.ts — update EXISTING `words` rows in place with the
 * multi-reading (heteronym) data, without re-inserting.
 *
 * Why not re-run the seed? The seed only inserts into an empty table, and a
 * delete+reinsert would change `words.id` and orphan the `srs_state` /
 * `session_items` rows that reference `word_id`. This script matches each
 * existing row by `simplified` and UPSERTs the full row keyed by its existing
 * `id`, so ids (and all FKs) are preserved while pinyin/meanings/traditional/
 * readings are refreshed.
 *
 * Run:  npm run backfill-readings
 *       # or: npx tsx scripts/backfill-readings.ts
 *
 * Idempotent — safe to run more than once. Run AFTER applying migration
 * 004_add_readings.sql.
 */

import { existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { fetchRaw, parseRows } from "./wordbank-parse";

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

  // Parse the dataset → map by simplified.
  const raw = await fetchRaw();
  const parsed = parseRows(raw);
  const bySimplified = new Map(parsed.map((r) => [r.simplified, r]));
  console.log(`Parsed ${parsed.length} dataset words.`);

  // Page through existing rows (Supabase caps a query at 1000).
  const PAGE = 1000;
  const existing: { id: number; simplified: string }[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("words")
      .select("id, simplified")
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) {
      console.error("Fetch error:", error.message);
      process.exit(1);
    }
    if (!data || data.length === 0) break;
    existing.push(...(data as { id: number; simplified: string }[]));
    if (data.length < PAGE) break;
  }
  console.log(`Found ${existing.length} existing rows.`);

  // Build full-row upserts keyed by existing id.
  const updates: Record<string, unknown>[] = [];
  let unmatched = 0;
  for (const row of existing) {
    const p = bySimplified.get(row.simplified);
    if (!p) {
      unmatched++;
      continue;
    }
    updates.push({ id: row.id, ...p });
  }
  console.log(
    `Matched ${updates.length} rows for update` +
      (unmatched ? ` (${unmatched} existing rows not in dataset — left unchanged).` : ".")
  );

  // Upsert in batches (onConflict id → updates the existing row).
  const BATCH = 500;
  let done = 0;
  for (let i = 0; i < updates.length; i += BATCH) {
    const batch = updates.slice(i, i + BATCH);
    const { error } = await supabase.from("words").upsert(batch, { onConflict: "id" });
    if (error) {
      console.error(`Batch ${i}–${i + BATCH} error:`, error.message);
      process.exit(1);
    }
    done += batch.length;
    console.log(`  ${done}/${updates.length} updated`);
  }

  console.log(`Done! Backfilled ${done} words.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
