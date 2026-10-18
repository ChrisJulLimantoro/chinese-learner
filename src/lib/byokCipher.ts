import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const SECRET_BYTES = 32;
const IV_BYTES = 12;
const SEPARATOR = ".";

export function parseSecret(raw: string | undefined): Buffer | null {
  const secret = Buffer.from(raw ?? "", "base64");
  return secret.length === SECRET_BYTES ? secret : null;
}

export function encryptWith(secret: Buffer, plain: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, secret, iv);
  const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), body].map((part) => part.toString("base64")).join(SEPARATOR);
}

export function decryptWith(secret: Buffer, payload: string): string {
  const [iv, tag, body] = payload.split(SEPARATOR).map((part) => Buffer.from(part, "base64"));
  const decipher = createDecipheriv(ALGORITHM, secret, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(body), decipher.final()]).toString("utf8");
}
