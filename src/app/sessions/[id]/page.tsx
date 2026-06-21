import { getUserContext } from "@/lib/user";
import { loadSession } from "@/lib/services";
import SessionReviewClient from "./SessionReviewClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, userId } = await getUserContext();

  let session;
  try {
    session = await loadSession(supabase, userId, parseInt(id, 10));
  } catch {
    notFound();
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <SessionReviewClient session={session} />
    </main>
  );
}
