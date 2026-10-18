import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { decryptWith, encryptWith, parseSecret } from "./byokCipher";
import { isValidKeyFormat, keyHint } from "./byokKeyFormat";

const secret = randomBytes(32);
const key = "sk-or-v1-abcdef1234567890";

test("round-trips a key", () => {
  assert.equal(decryptWith(secret, encryptWith(secret, key)), key);
});

test("uses a fresh iv each time", () => {
  assert.notEqual(encryptWith(secret, key), encryptWith(secret, key));
});

test("tampered ciphertext is rejected", () => {
  const [iv, tag, body] = encryptWith(secret, key).split(".");
  const flipped = Buffer.from(body, "base64");
  flipped[0] ^= 1;
  assert.throws(() => decryptWith(secret, [iv, tag, flipped.toString("base64")].join(".")));
});

test("wrong secret is rejected", () => {
  assert.throws(() => decryptWith(randomBytes(32), encryptWith(secret, key)));
});

test("parseSecret requires 32 bytes", () => {
  assert.equal(parseSecret(undefined), null);
  assert.equal(parseSecret(randomBytes(16).toString("base64")), null);
  assert.equal(parseSecret(secret.toString("base64"))?.length, 32);
});

test("key format validator", () => {
  assert.equal(isValidKeyFormat(key), true);
  assert.equal(isValidKeyFormat("sk-or-short"), false);
  assert.equal(isValidKeyFormat("sk-xx-v1-abcdef1234567890"), false);
  assert.equal(isValidKeyFormat(`${key} `), false);
});

test("hint shows last four only", () => {
  assert.equal(keyHint(key), "sk-or-…7890");
});
