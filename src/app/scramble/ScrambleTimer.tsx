"use client";

import { useEffect, useState } from "react";
import { ProgressBar } from "@/components/ui";

interface ScrambleTimerProps {
  seconds: number;
  running: boolean;
  onExpire: () => void;
}

function timerColor(left: number): "jade" | "ochre" | "seal" {
  if (left <= 10) return "seal";
  return left <= 30 ? "ochre" : "jade";
}

export default function ScrambleTimer({ seconds, running, onExpire }: ScrambleTimerProps) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (left === 0) onExpire();
  }, [left, onExpire]);

  return (
    <div className="flex items-center gap-3">
      <ProgressBar value={left} max={seconds} color={timerColor(left)} height="sm" />
      <span className="font-mono text-sm tabular-nums text-muted w-10 text-right">{left}s</span>
    </div>
  );
}
