import { getUserContext } from "@/lib/user";
import { getProfile, vocabCount, listSessions } from "@/lib/services";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { supabase, userId } = await getUserContext();

  const [profile, wordCount, sessions] = await Promise.all([
    getProfile(supabase, userId),
    vocabCount(supabase, userId),
    listSessions(supabase, userId, 1000),
  ]);

  const sessionCount = sessions.length;

  return (
    <SettingsClient
      profile={profile}
      wordCount={wordCount}
      sessionCount={sessionCount}
    />
  );
}
