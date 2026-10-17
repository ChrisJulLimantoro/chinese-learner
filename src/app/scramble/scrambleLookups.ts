import { buildWordIndex, levelPools } from "@/lib/scramble";
import type { IndexedWord, ScrambleBoard } from "@/lib/scramble";

export type ScrambleLookups = {
  byText: Map<string, IndexedWord>;
  byId: Map<number, IndexedWord>;
  pools: Map<number, IndexedWord[]>;
  charOfTile: Map<number, string>;
};

export function makeLookups(board: ScrambleBoard): ScrambleLookups {
  return {
    byText: buildWordIndex(board.index),
    byId: new Map(board.index.map((w) => [w.id, w])),
    pools: levelPools(board.index),
    charOfTile: new Map(board.tiles.map((t) => [t.id, t.char])),
  };
}

export function selectionText(lookups: ScrambleLookups, selected: number[]): string {
  return selected.map((id) => lookups.charOfTile.get(id) ?? "").join("");
}
