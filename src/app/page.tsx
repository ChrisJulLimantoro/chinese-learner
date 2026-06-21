import { getOptionalUser } from "@/lib/user";
import { createClient } from "@/lib/supabase/server";
import { listSessions, dueReviews, getInProgressSession } from "@/lib/services";
import HomeClient from "./HomeClient";
import LandingClient from "./LandingClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getOptionalUser();

  if (!user?.sub) {
    return <LandingClient />;
  }

  const supabase = await createClient();
  const userId = user.sub;

  const [inProgress, dueData, sessions] = await Promise.allSettled([
    getInProgressSession(supabase, userId),
    dueReviews(supabase, userId),
    listSessions(supabase, userId, 10),
  ]);

  return (
    <HomeClient
      inProgress={inProgress.status === "fulfilled" ? inProgress.value : null}
      dueData={dueData.status === "fulfilled" ? dueData.value : { count: 0, words: [] }}
      sessions={sessions.status === "fulfilled" ? sessions.value : []}
    />
  );
}
