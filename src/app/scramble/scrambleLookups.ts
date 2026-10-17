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
