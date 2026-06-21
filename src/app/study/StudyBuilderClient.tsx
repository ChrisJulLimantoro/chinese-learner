"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startSessionAction, startSessionWithWordsAction } from "../actions/session";
import type { Word } from "@/lib/types";
import { Card, Button, Badge, PageHeader } from "@/components/ui";

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
        className={`flex items-center gap-3 py-2.5 px-3 cursor-pointer rounded-xl transition-colors ${
          checked ? "bg-jade/10" : "hover:bg-surface-2"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={() => toggle(word.id)}
          className="w-4 h-4 shrink-0 accent-jade rounded"
        />
        <span className="hanzi text-lg font-semibold text-ink">{word.simplified}</span>
        <span className="text-sm text-muted">{word.pinyin}</span>
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
    <div>
      <PageHeader
        rubric="练习"
        eyebrow="Practice"
        title="Study"
        actions={
          selected.size > 0 ? (
            <Button
              variant="primary"
              onClick={customStart}
              loading={loading === "custom"}
              disabled={loading !== null}
            >
              Start · {selected.size} word{selected.size !== 1 ? "s" : ""}
            </Button>
          ) : undefined
        }
      />

      <div className="space-y-6">
        {/* Quick start */}
        <Card variant="paper" padding="md">
          <p className="text-xs font-semibold uppercase tracking-widest text-faint mb-4">
            Quick start
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { kind: "review",   label: "↻ Review due",  desc: "Words that need reinforcement" },
              { kind: "new_drop", label: "＋ New words",   desc: "Expand your vocabulary" },
              { kind: "mixed",    label: "⚡ Mixed",        desc: "New and review together" },
            ].map(({ kind, label, desc }) => (
              <button
                key={kind}
                onClick={() => quickStart(kind)}
                disabled={loading !== null}
                className={`group text-left px-4 py-3.5 rounded-xl border transition-colors disabled:opacity-40 ${
                  kind === "mixed"
                    ? "bg-jade/10 border-jade/30 hover:bg-jade/20"
                    : "border-border hover:bg-surface-2"
                }`}
              >
                <p className={`text-sm font-semibold mb-0.5 ${kind === "mixed" ? "text-jade" : "text-ink"}`}>
                  {loading === kind ? "Preparing…" : label}
                </p>
                <p className="text-xs text-muted">{desc}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Custom selection */}
        <Card variant="paper" padding="md">
          <p className="text-xs font-semibold uppercase tracking-widest text-faint mb-4">
            Custom — pick words
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
                {tab === "bank" ? `My bank (${bank.length})` : "New words"}
              </button>
            ))}
          </div>

          {/* Word list */}
          <div className="max-h-72 overflow-y-auto -mx-1 px-1 space-y-0.5">
            {activeTab === "bank" ? (
              bank.length > 0 ? (
                bank.map((w) => <WordRow key={w.id} word={w} isNew={false} />)
              ) : (
                <p className="text-sm text-muted py-6 text-center">
                  Your bank is empty — add words from the Vocabulary page.
                </p>
              )
            ) : addableWords.length > 0 ? (
              addableWords.map((w) => <WordRow key={w.id} word={w} isNew={true} />)
            ) : (
              <p className="text-sm text-muted py-6 text-center">
                No new words available at this level.
              </p>
            )}
          </div>

          {/* Start button */}
          <div className="mt-4 pt-4 border-t border-border">
            <Button
              variant="primary"
              className="w-full"
              onClick={customStart}
              disabled={selected.size === 0 || loading !== null}
              loading={loading === "custom"}
            >
              {selected.size > 0
                ? `Start · ${selected.size} word${selected.size !== 1 ? "s" : ""}`
                : "Select words above to start"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
