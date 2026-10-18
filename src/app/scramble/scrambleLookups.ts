import { buildWordIndex } from "@/lib/scramble";
import type { BoardWord, ScrambleBoard } from "@/lib/scramble";

export type ScrambleLookups = {
  byText: Map<string, BoardWord>;
  byId: Map<number, BoardWord>;
  charOfTile: Map<number, string>;
};

export function makeLookups(board: ScrambleBoard): ScrambleLookups {
  return {
    byText: buildWordIndex(board.words) as Map<string, BoardWord>,
    byId: new Map(board.words.map((w) => [w.id, w])),
    charOfTile: new Map(board.tiles.map((t) => [t.id, t.char])),
  };
}

export function selectionText(lookups: ScrambleLookups, selected: number[]): string {
  return selected.map((id) => lookups.charOfTile.get(id) ?? "").join("");
}

function charCounts(chars: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  chars.forEach((c) => counts.set(c, (counts.get(c) ?? 0) + 1));
  return counts;
}

function fitsTiles(word: BoardWord, available: Map<string, number>): boolean {
  const needed = charCounts(Array.from(word.simplified));
  return [...needed].every(([char, count]) => (available.get(char) ?? 0) >= count);
}

export function hasPlayableWord(board: ScrambleBoard, removed: Set<number>, tried: Set<number>): boolean {
  const available = charCounts(board.tiles.filter((t) => !removed.has(t.id)).map((t) => t.char));
  return board.words.some((w) => !tried.has(w.id) && fitsTiles(w, available));
}
