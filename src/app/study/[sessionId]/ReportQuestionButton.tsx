"use client";

import { useState } from "react";
import { reportQuestionAction } from "../../actions/session";

const REASONS = [
  { value: "wrong_answer_key", label: "Wrong answer key" },
  { value: "ambiguous", label: "Ambiguous" },
  { value: "unnatural_chinese", label: "Unnatural Chinese" },
];

type Props = { questionId: number };

export default function ReportQuestionButton({ questionId }: Props) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const report = async (reason: string) => {
    setSent(true);
    await reportQuestionAction(questionId, reason).catch(() => setSent(false));
  };

  if (sent) return <p className="text-xs text-faint font-mono">Reported — thanks</p>;
  if (!open) return <ReportLink onClick={() => setOpen(true)} />;
  return <ReasonChoices onPick={report} />;
}

function ReportLink({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-xs text-faint underline hover:text-muted">
      Report question
    </button>
  );
}

function ReasonChoices({ onPick }: { onPick: (reason: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {REASONS.map((r) => (
        <button
          key={r.value}
          type="button"
          onClick={() => onPick(r.value)}
          className="px-2 py-1 rounded-lg border border-border text-muted hover:text-ink"
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
