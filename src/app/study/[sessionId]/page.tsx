import { getUserContext } from "@/lib/user";
import { loadSession } from "@/lib/services";
import StudySessionClient from "./StudySessionClient";
import { notFound } from "next/navigation";

// LLM (lesson card generation + grading) can take up to 60s on Vercel Hobby
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export default async function StudySessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const { supabase, userId } = await getUserContext();

  let session;
  try {
    session = await loadSession(supabase, userId, parseInt(sessionId, 10));
  } catch {
    notFound();
  }

  return <StudySessionClient session={session} />;
}
