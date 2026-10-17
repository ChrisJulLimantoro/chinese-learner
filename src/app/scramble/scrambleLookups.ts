import { buildWordIndex, buildDistractorPools } from "@/lib/scramble";
import type { DistractorPools, IndexedWord, ScrambleBoard } from "@/lib/scramble";

export type ScrambleLookups = {
  byText: Map<string, IndexedWord>;
  byId: Map<number, IndexedWord>;
  pools: DistractorPools;
  charOfTile: Map<number, string>;
};

export function makeLookups(board: ScrambleBoard): ScrambleLookups {
  return {
    byText: buildWordIndex(board.index),
    byId: new Map(board.index.map((w) => [w.id, w])),
    pools: buildDistractorPools(board.index),
    charOfTile: new Map(board.tiles.map((t) => [t.id, t.char])),
  };
}

export function selectionText(lookups: ScrambleLookups, selected: number[]): string {
  return selected.map((id) => lookups.charOfTile.get(id) ?? "").join("");
}
