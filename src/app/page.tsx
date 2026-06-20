import { getUserContext } from "@/lib/user";
import { listSessions, dueReviews, getInProgressSession } from "@/lib/services";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { supabase, userId } = await getUserContext();

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
