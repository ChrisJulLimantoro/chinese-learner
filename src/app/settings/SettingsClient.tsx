"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateHskLevelAction } from "@/app/actions/profile";
import type { Profile } from "@/lib/types";
import { Card, Button, Badge, PageHeader } from "@/components/ui";
import { FREE_MAX_VOCAB_WORDS, FREE_MAX_SESSIONS } from "@/lib/config";

const HSK_LABELS: Record<number, string> = {
  1: "HSK 1 — Beginner (~150 words)",
  2: "HSK 2 — Elementary (~300 words)",
  3: "HSK 3 — Intermediate (~600 words)",
  4: "HSK 4 — Upper-intermediate (~1,200 words)",
  5: "HSK 5 — Advanced (~2,500 words)",
  6: "HSK 6 — Proficiency (~5,000 words)",
};

interface Props {
  profile: Profile;
  wordCount: number;
  sessionCount: number;
}

export default function SettingsClient({ profile, wordCount, sessionCount }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedLevel, setSelectedLevel] = useState(profile.current_hsk_level);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const wordCap = profile.max_vocab_words;
  const sessionCap = profile.max_sessions;
  const isUnlimited = profile.role === "admin";

  const handleSaveLevel = () => {
    if (selectedLevel === profile.current_hsk_level) return;
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        await updateHskLevelAction(selectedLevel);
        setSuccess(true);
        router.refresh();
      } catch (e) {
        setError(String(e));
      }
    });
  };

  return (
    <div className="max-w-2xl">
      <PageHeader eyebrow="Account" title="Settings" />

      {/* Plan / limits panel */}
      <Card variant="paper" padding="md" className="mb-6">
        <h2 className="font-semibold text-ink mb-4">Plan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-faint">Words</p>
            <p className="font-display text-2xl font-semibold text-ink">
              {wordCount}
              <span className="text-base font-normal text-muted ml-1">
                / {isUnlimited || wordCap === null ? "∞" : wordCap}
              </span>
            </p>
            {!isUnlimited && wordCap !== null && (
              <p className="text-xs text-faint">
                {Math.max(0, wordCap - wordCount)} remaining
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-faint">Sessions</p>
            <p className="font-display text-2xl font-semibold text-ink">
              {sessionCount}
              <span className="text-base font-normal text-muted ml-1">
                / {isUnlimited || sessionCap === null ? "∞" : sessionCap}
              </span>
            </p>
            {!isUnlimited && sessionCap !== null && (
              <p className="text-xs text-faint">
                {Math.max(0, sessionCap - sessionCount)} remaining
              </p>
            )}
          </div>
        </div>
        {!isUnlimited && (
          <p className="text-xs text-faint mt-4 leading-relaxed border-t border-border pt-3">
            Free tier: {FREE_MAX_VOCAB_WORDS} words and {FREE_MAX_SESSIONS} study sessions (lifetime).
            Contact an admin to raise your limits.
          </p>
        )}
        {isUnlimited && (
          <div className="mt-3">
            <Badge variant="jade">Admin — unlimited</Badge>
          </div>
        )}
      </Card>

      {/* HSK level selector */}
      <Card variant="paper" padding="md">
        <h2 className="font-semibold text-ink mb-1">HSK Level</h2>
        <p className="text-sm text-muted mb-4">
          Current: <strong>{HSK_LABELS[profile.current_hsk_level]}</strong>
        </p>

        <div className="p-3 rounded-xl bg-ochre/10 border border-ochre/20 text-ochre text-sm mb-4">
          <strong>Note:</strong> Changing your HSK level will reset your study streak to zero.
          Your vocabulary and SRS progress are kept.
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-seal/10 border border-seal/20 text-seal text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-jade/10 border border-jade/20 text-jade text-sm">
            HSK level updated successfully.
          </div>
        )}

        <fieldset className="flex flex-col gap-2 mb-5">
          <legend className="sr-only">Select HSK level</legend>
          {Object.entries(HSK_LABELS).map(([lvl, label]) => {
            const level = parseInt(lvl, 10);
            return (
              <label
                key={level}
                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-surface-2 cursor-pointer has-[:checked]:border-seal has-[:checked]:bg-seal/5 transition-colors"
              >
                <input
                  type="radio"
                  name="hsk_level"
                  value={String(level)}
                  checked={selectedLevel === level}
                  onChange={() => setSelectedLevel(level)}
                  className="accent-seal"
                />
                <span className="text-sm text-ink">{label}</span>
              </label>
            );
          })}
        </fieldset>

        <Button
          variant="primary"
          onClick={handleSaveLevel}
          disabled={isPending || selectedLevel === profile.current_hsk_level}
          loading={isPending}
        >
          Save HSK level
        </Button>
      </Card>
    </div>
  );
}
