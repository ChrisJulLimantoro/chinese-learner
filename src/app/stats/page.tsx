import { getUserContext } from "@/lib/user";
import { getStats } from "@/lib/services";
import StatsClient from "./StatsClient";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const { supabase, userId } = await getUserContext();

  let stats = null;
  try {
    stats = await getStats(supabase, userId);
  } catch {
    stats = null;
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <StatsClient stats={stats} />
    </main>
  );
}
