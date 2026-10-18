"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateHskLevelAction } from "@/app/actions/profile";
import { Button } from "@/components/ui";
import LedgerCard, { LedgerHeading } from "./LedgerCard";

const HSK_LEVELS = [
  { level: 1, cn: "一", name: "Beginner", words: "~150" },
  { level: 2, cn: "二", name: "Elementary", words: "~300" },
  { level: 3, cn: "三", name: "Intermediate", words: "~600" },
  { level: 4, cn: "四", name: "Upper-int.", words: "~1,200" },
  { level: 5, cn: "五", name: "Advanced", words: "~2,500" },
  { level: 6, cn: "六", name: "Proficiency", words: "~5,000" },
];

type Status = { kind: "idle" } | { kind: "saved" } | { kind: "error"; message: string };

function LevelTile({ hsk, selected, current, onSelect }: {
  hsk: (typeof HSK_LEVELS)[number];
  selected: boolean;
  current: boolean;
  onSelect: () => void;
}) {
  return (
    <label className="relative flex flex-col items-center gap-1 px-3 py-4 rounded-xl border border-border bg-paper cursor-pointer transition-[transform,background-color,border-color] duration-150 hover:-translate-y-0.5 hover:bg-surface-2 active:scale-[0.97] has-[:checked]:border-seal has-[:checked]:bg-seal/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-seal">
      <input type="radio" name="hsk_level" checked={selected} onChange={onSelect} className="sr-only" />
      {current && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-jade" aria-label="Current level" />}
      <span className={`hanzi text-3xl font-bold ${selected ? "text-seal" : "text-ink"}`}>{hsk.cn}</span>
      <span className="text-[10px] font-mono uppercase tracking-widest text-faint">HSK {hsk.level}</span>
      <span className="text-xs text-muted text-center leading-tight">{hsk.name}</span>
      <span className="text-[10px] text-faint">{hsk.words} words</span>
    </label>
  );
}

function StatusMessage({ status }: { status: Status }) {
  if (status.kind === "saved") return <p className="text-sm text-jade">HSK level updated.</p>;
  if (status.kind === "error") return <p className="text-sm text-seal">{status.message}</p>;
  return null;
}

function StreakWarning() {
  return (
    <p className="text-xs text-ochre leading-relaxed">
      Changing level resets your study streak. Vocabulary and SRS progress are kept.
    </p>
  );
}

function useSaveLevel(currentLevel: number) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const save = (level: number) => {
    if (level === currentLevel) return;
    startTransition(() => persistLevel(level, setStatus, router.refresh));
  };
  return { isPending, status, save };
}

async function persistLevel(level: number, setStatus: (s: Status) => void, refresh: () => void) {
  try {
    await updateHskLevelAction(level);
    setStatus({ kind: "saved" });
    refresh();
  } catch (e) {
    setStatus({ kind: "error", message: String(e) });
  }
}

export default function HskLevelPicker({ currentLevel }: { currentLevel: number }) {
  const [selected, setSelected] = useState(currentLevel);
  const { isPending, status, save } = useSaveLevel(currentLevel);

  return (
    <LedgerCard hanzi="级" label="LEVEL">
      <LedgerHeading>HSK level</LedgerHeading>
      <div className="p-5">
        <fieldset className="grid grid-cols-3 gap-3 mb-5">
          <legend className="sr-only">Select HSK level</legend>
          {HSK_LEVELS.map((hsk) => (
            <LevelTile key={hsk.level} hsk={hsk} selected={selected === hsk.level} current={currentLevel === hsk.level} onSelect={() => setSelected(hsk.level)} />
          ))}
        </fieldset>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Button variant="primary" onClick={() => save(selected)} disabled={isPending || selected === currentLevel} loading={isPending}>
            Save level
          </Button>
          <div className="flex-1"><StatusMessage status={status} />{status.kind === "idle" && <StreakWarning />}</div>
        </div>
      </div>
    </LedgerCard>
  );
}
