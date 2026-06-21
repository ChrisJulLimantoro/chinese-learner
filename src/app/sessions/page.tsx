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

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <SessionsClient sessions={sessions} />
    </main>
  );
}
