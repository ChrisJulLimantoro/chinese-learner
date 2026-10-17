import type { LessonCard, Reading, Word } from "./types";

export function normalizeWordRow(row: Record<string, unknown>): Word {
  return {
    id: row.id as number,
    simplified: row.simplified as string,
    traditional: (row.traditional as string | null) ?? null,
    pinyin: row.pinyin as string,
    hsk_level: row.hsk_level as number,
    frequency_rank: (row.frequency_rank as number | null) ?? null,
    pos: Array.isArray(row.pos) ? (row.pos as string[]) : [],
    meanings: Array.isArray(row.meanings) ? (row.meanings as string[]) : [],
    measure_word: (row.measure_word as { mw: string; pinyin: string } | null) ?? null,
    lesson_card: (row.lesson_card as LessonCard | null) ?? null,
    readings: Array.isArray(row.readings) ? (row.readings as Reading[]) : [
      { pinyin: row.pinyin as string, traditional: (row.traditional as string | null) ?? null, meanings: Array.isArray(row.meanings) ? (row.meanings as string[]) : [] }
    ],
  };
}
