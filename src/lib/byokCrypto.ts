import "server-only";
import { decryptWith, encryptWith, parseSecret } from "./byokCipher";

function secret(): Buffer | null {
  return parseSecret(process.env.BYOK_ENCRYPTION_SECRET);
}

export function isByokEnabled(): boolean {
  return secret() !== null;
}

export function encryptKey(plain: string): string {
  const key = secret();
  if (!key) throw new Error("BYOK not configured");
  return encryptWith(key, plain);
}

export function decryptKey(payload: string): string | null {
  const key = secret();
  if (!key) return null;
  try {
    return decryptWith(key, payload);
  } catch {
    return null;
  }
}
