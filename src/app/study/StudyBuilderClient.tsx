"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startSessionAction, startSessionWithWordsAction } from "../actions/session";
import type { Word } from "@/lib/types";
import { formatReadingsPinyin, hasMultipleReadings } from "@/lib/readings";
import { Button, Badge, PageHeader, ProgressBar } from "@/components/ui";

type VocabWord = Word & {
  box?: number;
  mastered?: boolean;
  due?: boolean;
};

export default function StudyBuilderClient({
  bank,
  addableWords,
}: {
  bank: VocabWord[];
  addableWords: Word[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<"bank" | "new">("bank");

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const quickStart = async (kind: string) => {
    setLoading(kind);
    try {
      const sess = await startSessionAction(kind);
      router.push(`/study/${sess.session_id}`);
    } catch (e) {
      alert(String(e));
    } finally {
      setLoading(null);
    }
  };

  const customStart = async () => {
    if (selected.size === 0) return;
    setLoading("custom");
    try {
      const sess = await startSessionWithWordsAction(Array.from(selected));
      router.push(`/study/${sess.session_id}`);
    } catch (e) {
      alert(String(e));
    } finally {
      setLoading(null);
    }
  };

  const WordRow = ({ word, isNew }: { word: VocabWord; isNew: boolean }) => {
    const checked = selected.has(word.id);
    const meanings = word.meanings ?? [];
    const gloss = Array.isArray(meanings)
      ? meanings.slice(0, 2).join(", ")
      : String(meanings);

    return (
      <label
        className={`flex items-center gap-3 py-3 px-3 cursor-pointer rounded-xl transition-colors border ${
          checked
            ? "bg-jade/10 border-jade/30"
            : "border-transparent hover:bg-surface-2 hover:border-border/60"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={() => toggle(word.id)}
          className="w-4 h-4 shrink-0 accent-jade rounded"
        />
        <span className="hanzi text-lg font-semibold text-ink">{word.simplified}</span>
        <span className="text-sm text-muted">
          {hasMultipleReadings(word.readings) ? formatReadingsPinyin(word.readings) : word.pinyin}
        </span>
        <span className="text-xs text-faint truncate flex-1 hidden sm:block">{gloss}</span>
        <div className="flex gap-1.5 shrink-0">
          {isNew && <Badge variant="ochre">new</Badge>}
          {"box" in word && !isNew && (
            <Badge variant="muted">box {(word as VocabWord).box}</Badge>
          )}
          {"mastered" in word && (word as VocabWord).mastered && (
            <Badge variant="jade">mastered</Badge>
          )}
        </div>
      </label>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        rubric="练习"
        eyebrow="Practice"
        title="Study Builder"
        actions={
          selected.size > 0 ? (
            <Button
              variant="primary"
              onClick={customStart}
              loading={loading === "custom"}
              disabled={loading !== null}
            >
              Start with {selected.size} word{selected.size !== 1 ? "s" : ""}
            </Button>
          ) : undefined
        }
      />

      {/* selection progress cue */}
      <div className="rounded-xl border border-border/70 bg-surface px-4 py-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-faint">
            Session Loadout
          </p>
          <p className="text-xs text-muted">
            {selected.size > 0
              ? `${selected.size} selected`
              : "Select words or use quick start"}
          </p>
        </div>
        <ProgressBar value={Math.min(selected.size, 12)} max={12} color="jade" height="xs" />
      </div>

      {/* Quick start folio */}
      <div className="flex rounded-2xl border border-border shadow-sm bg-surface overflow-hidden">
        <div className="w-10 flex-shrink-0 border-r border-border bg-surface-2/50 flex flex-col items-center py-6">
          <span className="hanzi v-rl text-seal/25 text-2xl font-bold select-none leading-none">
            快
          </span>
          <span className="v-rl text-faint text-[10px] font-mono mt-auto tracking-widest">
            QUICK
          </span>
        </div>
        <div className="flex-1 min-w-0 p-5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-faint mb-4">
            Quick start
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { kind: "review", label: "Review due", desc: "Words waiting for reinforcement" },
              { kind: "new_drop", label: "New words", desc: "Add fresh vocabulary to your cycle" },
              { kind: "mixed", label: "Mixed", desc: "Blend review and new in one run" },
            ].map(({ kind, label, desc }) => (
              <button
                key={kind}
                onClick={() => quickStart(kind)}
                disabled={loading !== null}
                className={`group text-left px-4 py-4 rounded-xl border transition-colors disabled:opacity-40 ${
                  kind === "mixed"
                    ? "bg-jade/10 border-jade/30 hover:bg-jade/20"
                    : "border-border/80 hover:bg-surface-2"
                }`}
              >
                <p className={`text-sm font-semibold mb-1 ${kind === "mixed" ? "text-jade" : "text-ink"}`}>
                  {loading === kind ? "Preparing..." : label}
                </p>
                <p className="text-xs text-muted leading-relaxed">{desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom selection folio */}
      <div className="flex rounded-2xl border border-border shadow-sm bg-surface overflow-hidden">
        <div className="w-10 flex-shrink-0 border-r border-border bg-surface-2/50 flex flex-col items-center py-6">
          <span className="hanzi v-rl text-seal/25 text-2xl font-bold select-none leading-none">
            选
          </span>
          <span className="v-rl text-faint text-[10px] font-mono mt-auto tracking-widest">
            CUSTOM
          </span>
        </div>
        <div className="flex-1 min-w-0 p-5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-faint mb-4">
            Build custom set
          </p>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-surface-2 rounded-xl mb-4">
            {(["bank", "new"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-surface text-ink shadow-sm"
                    : "text-muted hover:text-ink"
                }`}
              >
                {tab === "bank" ? `My bank (${bank.length})` : `New words (${addableWords.length})`}
              </button>
            ))}
          </div>

          {/* Word list */}
          <div className="max-h-80 overflow-y-auto -mx-1 px-1 space-y-1">
            {activeTab === "bank" ? (
              bank.length > 0 ? (
                bank.map((w) => <WordRow key={w.id} word={w} isNew={false} />)
              ) : (
                <p className="text-sm text-muted py-7 text-center">
                  Your bank is empty. Add words from Vocabulary first.
                </p>
              )
            ) : addableWords.length > 0 ? (
              addableWords.map((w) => <WordRow key={w.id} word={w} isNew={true} />)
            ) : (
              <p className="text-sm text-muted py-7 text-center">
                No new words available at your current level.
              </p>
            )}
          </div>

          {/* Start button */}
          <div className="mt-4 pt-4 border-t border-border/70">
            <Button
              variant="primary"
              className="w-full"
              onClick={customStart}
              disabled={selected.size === 0 || loading !== null}
              loading={loading === "custom"}
            >
              {selected.size > 0
                ? `Start with ${selected.size} word${selected.size !== 1 ? "s" : ""}`
                : "Select words above to start"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
