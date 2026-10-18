const KEY_INFO_URL = "https://openrouter.ai/api/v1/key";
const REQUEST_TIMEOUT_MS = 8000;

export type KeyQuota = { used: number; limit: number; remaining: number };

export function fetchKeyInfo(key: string, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Response> {
  return fetch(KEY_INFO_URL, {
    headers: { Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });
}

export function parseQuota(body: unknown): KeyQuota | null {
  const raw = (body as { data?: { free_model_daily_requests?: Partial<KeyQuota> } })?.data?.free_model_daily_requests;
  if (!raw || typeof raw.used !== "number" || typeof raw.limit !== "number") return null;
  return { used: raw.used, limit: raw.limit, remaining: raw.remaining ?? Math.max(raw.limit - raw.used, 0) };
}

export async function getUserKeyQuota(key: string, timeoutMs = REQUEST_TIMEOUT_MS): Promise<KeyQuota | null> {
  try {
    const response = await fetchKeyInfo(key, timeoutMs);
    return response.ok ? parseQuota(await response.json()) : null;
  } catch {
    return null;
  }
}

export async function isKeyAccepted(key: string): Promise<boolean> {
  try {
    return (await fetchKeyInfo(key)).status === 200;
  } catch {
    return false;
  }
}
