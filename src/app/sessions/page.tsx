import { getUserContext } from "@/lib/user";
import { listSessions } from "@/lib/services";
import SessionsClient from "./SessionsClient";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const { supabase, userId } = await getUserContext();

  let sessions: Awaited<ReturnType<typeof listSessions>> = [];
  try {
    sessions = await listSessions(supabase, userId, 50);
  } catch {
    sessions = [];
  }

  return <SessionsClient sessions={sessions} />;
}
