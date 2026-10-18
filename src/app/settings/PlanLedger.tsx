import { ProgressBar } from "@/components/ui";
import { FREE_MAX_VOCAB_WORDS, FREE_MAX_SESSIONS } from "@/lib/config";
import LedgerCard, { LedgerHeading } from "./LedgerCard";

interface Usage {
  label: string;
  used: number;
  cap: number | null;
}

function capLabel(cap: number | null): string {
  return cap === null ? "∞" : String(cap);
}

function UsageMeter({ label, used, cap }: Usage) {
  return (
    <div className="rounded-xl border border-border/70 bg-paper px-4 py-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-faint">{label}</p>
      <p className="font-display text-3xl text-ink mt-1">
        {used}
        <span className="text-base text-muted ml-1">/ {capLabel(cap)}</span>
      </p>
      {cap !== null && <UsageRemaining used={used} cap={cap} />}
    </div>
  );
}

function UsageRemaining({ used, cap }: { used: number; cap: number }) {
  const color = used >= cap ? "seal" : "jade";
  return (
    <>
      <ProgressBar value={used} max={cap} color={color} height="xs" className="mt-3" />
      <p className="text-xs text-faint mt-1.5">{Math.max(0, cap - used)} remaining</p>
    </>
  );
}

function FreeTierNote() {
  return (
    <p className="text-xs text-faint leading-relaxed mt-4">
      Free tier: {FREE_MAX_VOCAB_WORDS} words and {FREE_MAX_SESSIONS} study sessions (lifetime).
      Contact an admin to raise your limits.
    </p>
  );
}

export default function PlanLedger({ usages, isUnlimited }: { usages: Usage[]; isUnlimited: boolean }) {
  return (
    <LedgerCard hanzi="额" label="PLAN">
      <LedgerHeading>Plan & usage</LedgerHeading>
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {usages.map((u) => <UsageMeter key={u.label} {...u} />)}
        </div>
        {!isUnlimited && <FreeTierNote />}
      </div>
    </LedgerCard>
  );
}
