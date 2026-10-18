import "server-only";
import { createAdminClient } from "./supabase/admin";
import { decryptKey, encryptKey, isByokEnabled } from "./byokCrypto";
import { isValidKeyFormat, keyHint } from "./byokKeyFormat";
import { getUserKeyQuota, isKeyAccepted } from "./byokQuota";
import type { KeyQuota } from "./byokQuota";

const TABLE = "user_llm_keys";
const QUOTA_TIMEOUT_MS = 2500;

export { getUserKeyQuota };
export type SaveKeyResult = { ok: true } | { ok: false; error: string };
export type ByokCardState = { enabled: boolean; connected: boolean; hint: string | null; quota: KeyQuota | null };

async function keyRejection(key: string): Promise<string | null> {
  if (!isValidKeyFormat(key)) return "Invalid key format";
  return (await isKeyAccepted(key)) ? null : "Key rejected by OpenRouter";
}

export async function saveUserKey(userId: string, key: string): Promise<SaveKeyResult> {
  if (!isByokEnabled()) return { ok: false, error: "BYOK not configured on this server" };
  const rejection = await keyRejection(key);
  if (rejection) return { ok: false, error: rejection };
  const row = { user_id: userId, encrypted_key: encryptKey(key), key_hint: keyHint(key), updated_at: new Date().toISOString() };
  const { error } = await createAdminClient().from(TABLE).upsert(row, { onConflict: "user_id" });
  return error ? { ok: false, error: "Could not save key" } : { ok: true };
}

export async function removeUserKey(userId: string): Promise<void> {
  await createAdminClient().from(TABLE).delete().eq("user_id", userId);
}

async function loadRow(userId: string) {
  const { data } = await createAdminClient().from(TABLE).select("encrypted_key, key_hint").eq("user_id", userId).maybeSingle();
  return data as { encrypted_key: string; key_hint: string } | null;
}

async function loadRowQuietly(userId: string) {
  try {
    return await loadRow(userId);
  } catch {
    return null;
  }
}

export async function getUserLlmKey(userId: string): Promise<string | null> {
  if (!isByokEnabled()) return null;
  const row = await loadRowQuietly(userId);
  return row ? decryptKey(row.encrypted_key) : null;
}

async function quotaFor(encryptedKey: string): Promise<KeyQuota | null> {
  const key = decryptKey(encryptedKey);
  return key ? getUserKeyQuota(key, QUOTA_TIMEOUT_MS) : null;
}

export async function getByokCardState(userId: string): Promise<ByokCardState> {
  if (!isByokEnabled()) return { enabled: false, connected: false, hint: null, quota: null };
  const row = await loadRowQuietly(userId);
  if (!row) return { enabled: true, connected: false, hint: null, quota: null };
  return { enabled: true, connected: true, hint: row.key_hint, quota: await quotaFor(row.encrypted_key) };
}
