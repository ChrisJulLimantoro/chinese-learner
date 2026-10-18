import type { Profile } from "@/lib/types";
import { SUPER_ADMIN_EMAIL } from "@/lib/config";
import IdentityHero from "./IdentityHero";
import PlanLedger from "./PlanLedger";
import HskLevelPicker from "./HskLevelPicker";
import AccountLinks from "./AccountLinks";

function canAccessAdmin(profile: Profile): boolean {
  return profile.role === "admin" || profile.email === SUPER_ADMIN_EMAIL;
}

function usageCap(isUnlimited: boolean, cap: number | null): number | null {
  return isUnlimited ? null : cap;
}

interface Props {
  profile: Profile;
  wordCount: number;
  sessionCount: number;
}

export default function SettingsClient({ profile, wordCount, sessionCount }: Props) {
  const isUnlimited = profile.role === "admin";
  const usages = [
    { label: "Words", used: wordCount, cap: usageCap(isUnlimited, profile.max_vocab_words) },
    { label: "Sessions", used: sessionCount, cap: usageCap(isUnlimited, profile.max_sessions) },
  ];

  return (
    <div className="animate-fade-up">
      <IdentityHero profile={profile} isAdmin={isUnlimited} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-6">
          <HskLevelPicker currentLevel={profile.current_hsk_level} />
          <PlanLedger usages={usages} isUnlimited={isUnlimited} />
        </div>
        <div className="lg:col-span-5">
          <AccountLinks isAdmin={canAccessAdmin(profile)} />
        </div>
      </div>
    </div>
  );
}
