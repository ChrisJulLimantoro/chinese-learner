import { buildWordIndex, buildDistractorPools } from "@/lib/scramble";
import type { DistractorPools, IndexedWord, ScrambleBoard } from "@/lib/scramble";

export type ScrambleLookups = {
  byText: Map<string, IndexedWord>;
  byId: Map<number, IndexedWord>;
  pools: DistractorPools;
  charOfTile: Map<number, string>;
  seeded: Set<number>;
};

export function makeLookups(board: ScrambleBoard): ScrambleLookups {
  return {
    byText: buildWordIndex(board.index),
    byId: new Map(board.index.map((w) => [w.id, w])),
    pools: buildDistractorPools(board.index),
    charOfTile: new Map(board.tiles.map((t) => [t.id, t.char])),
    seeded: new Set(board.seeded),
  };
}

export function selectionText(lookups: ScrambleLookups, selected: number[]): string {
  return selected.map((id) => lookups.charOfTile.get(id) ?? "").join("");
}

export function isRejectedSingleChar(lookups: ScrambleLookups, word: IndexedWord): boolean {
  return word.simplified.length === 1 && !lookups.seeded.has(word.id);
}
