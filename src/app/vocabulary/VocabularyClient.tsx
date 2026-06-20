"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { addWordsToBankAction } from "../actions/vocabulary";
import type { Word } from "@/lib/types";
import { Card, Button, Badge, PageHeader } from "@/components/ui";

const PAGE_SIZE = 20;

type VocabWord = Word & {
  box: number;
  mastered: boolean;
  next_review_at: number;
  correct_count: number;
  wrong_count: number;
  due: boolean;
};

function wordBadgeVariant(w: VocabWord): "jade" | "ochre" | "muted" {
  if (w.mastered) return "jade";
  if (w.due)      return "ochre";
  return "muted";
}

function wordBadgeLabel(w: VocabWord): string {
  if (w.mastered) return "mastered";
  if (w.due)      return `due · box ${w.box}`;
  return `box ${w.box}`;
}

export default function VocabularyClient({ vocab }: { vocab: VocabWord[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtered = vocab.filter(
    (w) =>
      w.simplified.includes(query) ||
      w.pinyin.toLowerCase().includes(query.toLowerCase()) ||
      (w.meanings ?? []).some((m) => m.toLowerCase().includes(query.toLowerCase()))
  );

  // Reset visible count whenever the search filter changes.
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [query]);

  // Expand visible count when the sentinel div scrolls into view.
  const setupObserver = useCallback(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible((v) => v + PAGE_SIZE);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(setupObserver, [setupObserver, filtered.length]);

  const handleAddWords = async (count: number) => {
    setAdding(true);
    try {
      await addWordsToBankAction(count);
      router.refresh();
    } catch (e) {
      alert(String(e));
    } finally {
      setAdding(false);
    }
  };

  const masteredCount = vocab.filter((w) => w.mastered).length;
  const dueCount = vocab.filter((w) => w.due).length;

  return (
    <div>
      <PageHeader
        eyebrow="Learning"
        title="Vocabulary"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddWords(1)}
              disabled={adding}
              loading={adding}
            >
              + 1
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleAddWords(5)}
              disabled={adding}
              loading={adding}
            >
              + 5 words
            </Button>
          </div>
        }
      />

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card variant="paper" padding="sm" className="text-center">
          <p className="text-xs text-faint uppercase tracking-widest">Total</p>
          <p className="font-display text-2xl font-semibold text-ink mt-1">{vocab.length}</p>
        </Card>
        <Card variant="paper" padding="sm" className="text-center">
          <p className="text-xs text-faint uppercase tracking-widest">Mastered</p>
          <p className="font-display text-2xl font-semibold text-jade mt-1">{masteredCount}</p>
        </Card>
        <Card variant="paper" padding="sm" className="text-center">
          <p className="text-xs text-faint uppercase tracking-widest">Due</p>
          <p className="font-display text-2xl font-semibold text-ochre mt-1">{dueCount}</p>
        </Card>
      </div>

      {/* Sticky search */}
      <div className="sticky top-0 z-10 bg-paper/90 backdrop-blur-sm -mx-4 px-4 py-3 mb-4 border-b border-border/50">
        <input
          type="text"
          placeholder="Search by hanzi, pinyin, or meaning…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-seal focus:border-transparent transition-colors placeholder:text-faint"
        />
      </div>

      {/* List */}
      {vocab.length === 0 ? (
        <Card variant="paper" padding="lg" className="text-center">
          <p className="text-muted mb-5">Your vocabulary bank is empty.</p>
          <Button
            variant="primary"
            onClick={() => handleAddWords(5)}
            loading={adding}
          >
            Add 5 words to get started
          </Button>
        </Card>
      ) : filtered.length === 0 && query ? (
        <p className="text-center text-muted text-sm py-10">
          No words match &ldquo;{query}&rdquo;
        </p>
      ) : (
        <Card variant="paper" padding="none">
          <div className="divide-y divide-border">
            {filtered.slice(0, visible).map((w) => (
              <button
                key={w.id}
                onClick={() => router.push(`/vocabulary/${w.id}`)}
                className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-surface-2 transition-colors text-left group min-h-[52px]"
              >
                <span className="hanzi text-2xl font-bold text-ink shrink-0 w-10">
                  {w.simplified}
                </span>
                <span className="text-sm text-muted shrink-0 w-24">{w.pinyin}</span>
                <span className="text-sm text-faint truncate flex-1 hidden sm:block">
                  {(w.meanings ?? []).slice(0, 2).join(", ")}
                </span>
                <div className="shrink-0 ml-auto">
                  <Badge variant={wordBadgeVariant(w)}>{wordBadgeLabel(w)}</Badge>
                </div>
                <span className="text-faint text-xs group-hover:text-muted transition-colors" aria-hidden>→</span>
              </button>
            ))}
          </div>
          {/* Sentinel: triggers loading of the next page when scrolled into view */}
          {visible < filtered.length && (
            <div ref={sentinelRef} className="py-4 text-center text-xs text-faint">
              Loading more…
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
