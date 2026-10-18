const KEY_FORMAT = /^sk-or-[A-Za-z0-9_-]{10,}$/;
const HINT_PREFIX = "sk-or-…";
const HINT_TAIL_LENGTH = 4;

export function isValidKeyFormat(key: string): boolean {
  return KEY_FORMAT.test(key);
}

export function keyHint(key: string): string {
  return HINT_PREFIX + key.slice(-HINT_TAIL_LENGTH);
}
