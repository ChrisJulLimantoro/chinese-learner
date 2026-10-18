"use client";

import { useState } from "react";
import { Button, Card, PageHeader } from "@/components/ui";
import { DIFFICULTIES, DIFFICULTY_ORDER } from "@/lib/scramble";
import type { Difficulty } from "@/lib/scramble";
import MeaningPicker from "./MeaningPicker";
import ScrambleSummary from "./ScrambleSummary";
import ScrambleTimer from "./ScrambleTimer";
import TileGrid from "./TileGrid";
import { selectionText } from "./scrambleLookups";
import { useScrambleGame } from "./useScrambleGame";
import type { Miss } from "./useScrambleGame";

function DifficultyPicker({ value, onChange }: { value: Difficulty; onChange: (d: Difficulty) => void }) {
  return (
    <div className="flex justify-center gap-2" role="radiogroup" aria-label="Difficulty">
      {DIFFICULTY_ORDER.map((d) => (
        <Button key={d} size="sm" variant={d === value ? "primary" : "outline"} onClick={() => onChange(d)} aria-pressed={d === value}>
          {DIFFICULTIES[d].label} · {DIFFICULTIES[d].tiles}
        </Button>
      ))}
    </div>
  );
}

type IntroCardProps = { loading: boolean; message: string | null; onStart: (d: Difficulty) => void; initial: Difficulty };

function IntroCard({ loading, message, onStart, initial }: IntroCardProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>(initial);
  const { tiles, seconds } = DIFFICULTIES[difficulty];
  return (
    <Card variant="elevated" padding="lg" className="text-center space-y-5">
      <div className="hanzi text-6xl font-bold text-ink/80 leading-none" aria-hidden>字</div>
      <DifficultyPicker value={difficulty} onChange={setDifficulty} />
      <p className="text-muted text-sm max-w-md mx-auto">
        {tiles} tiles, {seconds / 60} minutes. Tap 1–3 tiles to spell a word, press Check, then pick its
        meaning. Correct words clear their tiles and score points; wrong guesses turn their tiles red.
      </p>
      {message && <p className="text-seal text-sm">{message}</p>}
      <Button variant="primary" size="lg" onClick={() => onStart(difficulty)} loading={loading} disabled={loading}>
        Start scramble →
      </Button>
    </Card>
  );
}

function MissNote({ miss }: { miss: Miss }) {
  return (
    <p className="text-seal text-sm font-sans font-normal">
      ✗ <span className="hanzi">{miss.word.simplified}</span> ({miss.word.pinyin}) means “{miss.word.meaning}”, not “{miss.chosen}”
    </p>
  );
}

function SelectionTray({
  text,
  message,
  miss,
  onCheck,
  onClear,
}: {
  text: string;
  message: string | null;
  miss: Miss | null;
  onCheck: () => void;
  onClear: () => void;
}) {
  return (
    <Card variant="paper" padding="md" className="flex flex-wrap items-center gap-3">
      <div className="hanzi text-3xl font-bold text-ink min-w-[5rem] min-h-10 flex items-center">
        {text || (miss ? <MissNote miss={miss} /> : <span className="text-faint text-sm font-sans font-normal">{message ?? "Tap tiles…"}</span>)}
      </div>
      <div className="flex gap-2 ml-auto">
        <Button variant="outline" size="sm" onClick={onClear} disabled={!text}>Clear</Button>
        <Button variant="primary" size="sm" onClick={onCheck} disabled={!text}>Check</Button>
      </div>
    </Card>
  );
}

export default function ScrambleClient() {
  const game = useScrambleGame();
  const { lookups } = game;
  const showBoard = game.phase === "playing" && game.board && lookups;

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Word game" rubric="乱" title="Scramble" />
      {(game.phase === "intro" || game.phase === "loading") && (
        <IntroCard loading={game.phase === "loading"} message={game.message} onStart={game.start} initial={game.difficulty} />
      )}
      {showBoard && (
        <>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <ScrambleTimer key={game.board!.runId} seconds={DIFFICULTIES[game.board!.difficulty].seconds} running onExpire={game.expire} />
            </div>
            <span className="font-mono text-sm tabular-nums text-ink">{game.score} pts</span>
          </div>
          <TileGrid
            tiles={game.board!.tiles}
            selected={game.selected}
            removed={game.removed}
            missed={game.missedTiles}
            disabled={game.picker !== null}
            onToggle={game.toggleTile}
          />
          {game.picker ? (
            <MeaningPicker
              key={game.picker.word.id}
              word={game.picker.word}
              options={game.picker.options}
              onResolved={game.resolvePicker}
            />
          ) : (
            <SelectionTray
              text={selectionText(lookups, game.selected)}
              message={game.message}
              miss={game.lastMiss}
              onCheck={game.checkSelection}
              onClear={game.clearSelection}
            />
          )}
        </>
      )}
      {game.phase === "done" && (
        <ScrambleSummary score={game.score} found={game.found} saved={game.saved} onPlayAgain={() => game.start(game.difficulty)} />
      )}
    </div>
  );
}
