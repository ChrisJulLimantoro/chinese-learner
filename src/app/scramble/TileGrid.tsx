"use client";

import type { Tile } from "@/lib/scramble";

interface TileGridProps {
  tiles: Tile[];
  selected: number[];
  removed: Set<number>;
  disabled: boolean;
  onToggle: (tileId: number) => void;
}

function tileClass(isSelected: boolean, isRemoved: boolean): string {
  const base =
    "hanzi relative aspect-square rounded-lg border text-2xl sm:text-3xl font-semibold select-none transition-colors";
  if (isRemoved) return `${base} invisible`;
  const tone = isSelected
    ? "bg-seal text-white border-seal"
    : "bg-surface text-ink border-border hover:bg-surface-2";
  return `${base} ${tone}`;
}

export default function TileGrid({ tiles, selected, removed, disabled, onToggle }: TileGridProps) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
      {tiles.map((tile) => {
        const order = selected.indexOf(tile.id);
        return (
          <button
            key={tile.id}
            type="button"
            disabled={disabled || removed.has(tile.id)}
            onClick={() => onToggle(tile.id)}
            className={tileClass(order !== -1, removed.has(tile.id))}
          >
            {tile.char}
            {order !== -1 && (
              <span className="absolute top-0.5 right-1 font-mono text-[10px] opacity-80">{order + 1}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
