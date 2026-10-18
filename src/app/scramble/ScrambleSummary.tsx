"use client";

import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";
import CheckedWordList from "./CheckedWordList";
import type { FoundWord } from "./CheckedWordList";

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
      <CheckedWordList found={found} />
      <div className="flex flex-wrap gap-3 justify-center">
        <Button variant="outline" onClick={() => router.push("/")}>Home</Button>
        <Button variant="primary" onClick={onPlayAgain}>Play again</Button>
      </div>
    </Card>
  );
}
