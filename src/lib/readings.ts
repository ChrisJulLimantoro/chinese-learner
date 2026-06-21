import type { Reading } from "./types";

/** True when a word has more than one reading (heteronym). */
export function hasMultipleReadings(readings: Reading[] | undefined): boolean {
  return !!readings && readings.length > 1;
}

/** "hái · huán" */
export function formatReadingsPinyin(readings: Reading[]): string {
  return readings.map((r) => r.pinyin).join(" · ");
}
