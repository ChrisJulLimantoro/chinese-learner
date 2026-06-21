"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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

function hskBadgeVariant(level: number): "jade" | "ochre" | "seal" | "muted" {
  if (level <= 2) return "jade";
  if (level <= 4) return "ochre";
  return "seal";
}

const HSK_FILTER_LABELS: Record<number | "all", string> = {
  all: "All",
  1: "HSK 1",
  2: "HSK 2",
  3: "HSK 3",
  4: "HSK 4",
  5: "HSK 5",
  6: "HSK 6",
};

export default function VocabularyClient({ vocab }: { vocab: VocabWord[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [hskFilter, setHskFilter] = useState<number | "all">("all");

  // Determine which HSK levels are present
  const presentLevels = Array.from(new Set(vocab.map((w) => w.hsk_level))).sort(
    (a, b) => a - b
  );

  const filtered = vocab.filter((w) => {
    const matchesLevel = hskFilter === "all" || w.hsk_level === hskFilter;
    const matchesQuery =
      w.simplified.includes(query) ||
      w.pinyin.toLowerCase().includes(query.toLowerCase()) ||
      (w.meanings ?? []).some((m) => m.toLowerCase().includes(query.toLowerCase()));
    return matchesLevel && matchesQuery;
  });

  // A stable key derived from the active filters — changing it remounts the
  // InfiniteList child, which naturally resets its internal visible count.
  const listKey = `${hskFilter}::${query}`;

  const handleAddWords = async (count: number) => {
    setAdding(true);
    setAddError(null);
    try {
      await addWordsToBankAction(count);
      router.refresh();
    } catch (e) {
      setAddError(String(e instanceof Error ? e.message : e));
    } finally {
      setAdding(false);
    }
  };

  const masteredCount = vocab.filter((w) => w.mastered).length;
  const dueCount = vocab.filter((w) => w.due).length;

  // Group by HSK level when showing all (no text search active)
  const showGrouped = hskFilter === "all" && !query;

  // Build per-level groups when grouped view is active
  const levelGroups: { level: number; words: VocabWord[] }[] = showGrouped
    ? presentLevels.map((lvl) => ({
        level: lvl,
        words: filtered.filter((w) => w.hsk_level === lvl),
      }))
    : [];



  return (
    <div>
      <PageHeader
        rubric="词库"
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

      {addError && (
        <div className="mb-4 p-3 rounded-xl bg-seal/10 border border-seal/20 text-seal text-sm">
          {addError}
        </div>
      )}

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

      {/* Sticky search + HSK filter */}
      <div className="sticky top-0 z-10 bg-paper/90 backdrop-blur-sm -mx-4 px-4 py-3 mb-4 border-b border-border/50 flex flex-col gap-2">
        <input
          type="text"
          placeholder="Search by hanzi, pinyin, or meaning…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-seal focus:border-transparent transition-colors placeholder:text-faint"
        />
        {/* HSK level filter row */}
        {presentLevels.length > 1 && (
          <div className="flex gap-1.5 flex-wrap">
            {(["all", ...presentLevels] as (number | "all")[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setHskFilter(lvl)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  hskFilter === lvl
                    ? "bg-seal text-paper"
                    : "bg-surface-2 text-muted hover:bg-border hover:text-ink"
                }`}
              >
                {HSK_FILTER_LABELS[lvl]}
              </button>
            ))}
          </div>
        )}
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
      ) : filtered.length === 0 && (query || hskFilter !== "all") ? (
        <p className="text-center text-muted text-sm py-10">
          No words match your filter
          {query ? <> &ldquo;{query}&rdquo;</> : null}.
        </p>
      ) : showGrouped ? (
        /* Grouped by HSK level */
        <div className="flex flex-col gap-6">
          {levelGroups
            .filter((g) => g.words.length > 0)
            .map(({ level, words: groupWords }) => (
              <div key={level}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={hskBadgeVariant(level)}>HSK {level}</Badge>
                  <span className="text-xs text-faint">{groupWords.length} word{groupWords.length !== 1 ? "s" : ""}</span>
                </div>
                <Card variant="paper" padding="none">
                  <InfiniteList
                    key={`${listKey}::${level}`}
                    words={groupWords}
                    onNavigate={(id) => router.push(`/vocabulary/${id}`)}
                  />
                </Card>
              </div>
            ))}
        </div>
      ) : (
        /* Flat filtered list */
        <Card variant="paper" padding="none">
          <InfiniteList
            key={listKey}
            words={filtered}
            onNavigate={(id) => router.push(`/vocabulary/${id}`)}
          />
        </Card>
      )}
    </div>
  );
}

// InfiniteList — manages its own visible-count state; remount via key to reset.
function InfiniteList({
  words,
  onNavigate,
}: {
  words: VocabWord[];
  onNavigate: (id: number) => void;
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

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

  useEffect(setupObserver, [setupObserver, words.length]);

  return (
    <>
      <div className="divide-y divide-border">
        {words.slice(0, visible).map((w) => (
          <WordRow key={w.id} w={w} onNavigate={onNavigate} />
        ))}
      </div>
      {visible < words.length && (
        <div ref={sentinelRef} className="py-4 text-center text-xs text-faint">
          Loading more…
        </div>
      )}
    </>
  );
}

function WordRow({
  w,
  onNavigate,
}: {
  w: VocabWord;
  onNavigate: (id: number) => void;
}) {
  return (
    <button
      onClick={() => onNavigate(w.id)}
      className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-surface-2 transition-colors text-left group min-h-[52px]"
    >
      <span className="hanzi text-2xl font-bold text-ink shrink-0 w-10">
        {w.simplified}
      </span>
      <span className="text-sm text-muted shrink-0 w-24">{w.pinyin}</span>
      <span className="text-sm text-faint truncate flex-1 hidden sm:block">
        {(w.meanings ?? []).slice(0, 2).join(", ")}
      </span>
      <div className="shrink-0 ml-auto flex items-center gap-1.5">
        <Badge variant={hskBadgeVariant(w.hsk_level)}>HSK {w.hsk_level}</Badge>
        <Badge variant={wordBadgeVariant(w)}>{wordBadgeLabel(w)}</Badge>
      </div>
      <span className="text-faint text-xs group-hover:text-muted transition-colors" aria-hidden>→</span>
    </button>
  );
}
