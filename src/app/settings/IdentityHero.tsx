import type { Profile } from "@/lib/types";
import { Badge } from "@/components/ui";

const HSK_CN = ["", "一", "二", "三", "四", "五", "六"];

function MeChop() {
  return (
    <div className="animate-seal-stamp relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl bg-seal shadow-md flex items-center justify-center">
      <span className="absolute inset-1.5 rounded-xl border border-white/25" aria-hidden />
      <span className="hanzi text-5xl sm:text-6xl font-bold text-white select-none">我</span>
    </div>
  );
}

function HeroStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-paper px-4 py-3 min-w-[6.5rem]">
      <p className="text-[10px] font-mono uppercase tracking-widest text-faint">{label}</p>
      <p className={`font-display text-2xl mt-1 ${tone}`}>{value}</p>
    </div>
  );
}

function IdentityText({ profile, isAdmin }: { profile: Profile; isAdmin: boolean }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-faint mb-1">Account</p>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink leading-tight">Me</h1>
      <p className="text-sm text-muted mt-1 truncate">{profile.email ?? "Signed in"}</p>
      {isAdmin && <Badge variant="jade" className="mt-2">Admin — unlimited</Badge>}
    </div>
  );
}

export default function IdentityHero({ profile, isAdmin }: { profile: Profile; isAdmin: boolean }) {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-sm p-5 sm:p-7 mb-6">
      <span className="hanzi absolute -right-4 -bottom-10 text-[10rem] leading-none font-bold text-seal/[0.06] select-none pointer-events-none" aria-hidden>
        学
      </span>
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
        <MeChop />
        <IdentityText profile={profile} isAdmin={isAdmin} />
        <div className="flex gap-3">
          <HeroStat label="Level" value={`HSK ${HSK_CN[profile.current_hsk_level]}`} tone="text-ink" />
          <HeroStat label="Streak" value={`${profile.study_streak_days}d`} tone="text-jade" />
        </div>
      </div>
    </header>
  );
}
