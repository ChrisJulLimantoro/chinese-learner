"use client";

import { useRouter } from "next/navigation";
import { Badge, Button, Card } from "@/components/ui";
import type { IndexedWord } from "@/lib/scramble";

export type FoundWord = { word: IndexedWord; correct: boolean };

interface ScrambleSummaryProps {
  score: number;
  found: FoundWord[];
  saved: boolean;
  onPlayAgain: () => void;
}

export default function ScrambleSummary({ score, found, saved, onPlayAgain }: ScrambleSummaryProps) {
  const router = useRouter();
  const correctCount = found.filter((f) => f.correct).length;

  return (
    <Card variant="elevated" padding="lg" className="space-y-6 animate-fade-up">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-faint mb-2">Score</p>
        <div className="font-display text-6xl font-semibold text-ink tabular-nums">{score}</div>
        <p className="text-muted text-sm mt-2">
          {correctCount}/{found.length} words correct{saved ? "" : " · saving…"}
        </p>
      </div>
      {found.length > 0 && (
        <ul className="divide-y divide-border rounded-xl border border-border overflow-hidden">
          {found.map(({ word, correct }) => (
            <li key={word.id} className="flex items-center gap-3 px-4 py-2.5">
              <Badge variant={correct ? "jade" : "seal"}>{correct ? "✓" : "✗"}</Badge>
              <span className="hanzi font-semibold text-ink">{word.simplified}</span>
              <span className="text-jade text-sm">{word.pinyin}</span>
              <span className="text-muted text-sm truncate ml-auto">{word.meaning}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button variant="outline" onClick={() => router.push("/")}>Home</Button>
        <Button variant="primary" onClick={onPlayAgain}>Play again</Button>
      </div>
    </Card>
  );
}
