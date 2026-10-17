"use client";

import { Button } from "@/components/ui";

interface SelfGradePanelProps {
  userAnswer: string;
  referenceAnswer: string;
  busy: boolean;
  onGrade: (gotIt: boolean) => void;
}

export default function SelfGradePanel({ userAnswer, referenceAnswer, busy, onGrade }: SelfGradePanelProps) {
  return (
    <div className="rounded-2xl border border-ochre/30 bg-surface overflow-hidden animate-fade-up">
      <div className="px-4 py-2.5 bg-ochre text-white text-sm font-semibold">Grade yourself</div>
      <div className="px-4 py-3 space-y-3">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-faint mb-1">Your answer</p>
          <p className="hanzi text-ink">{userAnswer}</p>
        </div>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-faint mb-1">Model answer</p>
          <p className="hanzi text-ink">{referenceAnswer}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" className="flex-1" disabled={busy} onClick={() => onGrade(true)}>
            I got it
          </Button>
          <Button variant="outline" className="flex-1" disabled={busy} onClick={() => onGrade(false)}>
            I missed
          </Button>
        </div>
      </div>
    </div>
  );
}
