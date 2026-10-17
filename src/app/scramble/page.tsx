import { getUserContext } from "@/lib/user";
import ScrambleClient from "./ScrambleClient";

export const dynamic = "force-dynamic";

export default async function ScramblePage() {
  await getUserContext();
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <ScrambleClient />
    </main>
  );
}
