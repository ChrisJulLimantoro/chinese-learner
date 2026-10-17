"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/ui";
import type { IndexedWord } from "@/lib/scramble";

const REVEAL_MS = 900;

interface MeaningPickerProps {
  word: IndexedWord;
  options: string[];
  onResolved: (correct: boolean) => void;
}

function optionClass(option: string, chosen: string | null, answer: string): string {
  const base = "w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors";
  if (chosen === null) return `${base} border-border bg-surface hover:bg-surface-2 text-ink`;
  if (option === answer) return `${base} border-jade bg-jade/10 text-jade`;
  if (option === chosen) return `${base} border-seal bg-seal/10 text-seal`;
  return `${base} border-border bg-surface text-faint`;
}

export default function MeaningPicker({ word, options, onResolved }: MeaningPickerProps) {
  const [chosen, setChosen] = useState<string | null>(null);
  const resolvedRef = useRef(false);

  const choose = (option: string) => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    setChosen(option);
    setTimeout(() => onResolved(option === word.meaning), REVEAL_MS);
  };

  return (
    <Card variant="elevated" padding="md" className="animate-fade-up">
      <div className="text-center mb-4">
        <div className="hanzi text-5xl font-bold text-ink leading-none">{word.simplified}</div>
        <div className="text-jade text-sm mt-2 h-5">{chosen !== null ? word.pinyin : ""}</div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => choose(option)}
            className={optionClass(option, chosen, word.meaning)}
          >
            {option}
          </button>
        ))}
      </div>
    </Card>
  );
}
