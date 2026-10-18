"use client";

import { Button } from "@/components/ui";
import type { ByokCardState } from "@/lib/byokService";
import LedgerCard, { LedgerHeading } from "./LedgerCard";
import ByokGuide from "./ByokGuide";
import ByokStatus from "./ByokStatus";
import ByokRemoveButton from "./ByokRemoveButton";
import { useByokForm } from "./useByokForm";
import type { ByokMessage } from "./useByokForm";

const NOTE = "Your key is encrypted on our server and never shown again. We always use our own free model, so it costs you nothing.";

function Feedback({ message }: { message: ByokMessage }) {
  if (message.kind === "saved") return <p className="text-sm text-jade">Key saved.</p>;
  if (message.kind === "error") return <p className="text-sm text-seal">{message.text}</p>;
  return null;
}

function KeyForm({ state }: { state: ByokCardState }) {
  const { key, setKey, message, isPending, save, remove } = useByokForm();
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input type="password" autoComplete="off" value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk-or-…" aria-label="OpenRouter API key" className="flex-1 min-w-0 rounded-xl border border-border bg-paper px-4 py-2.5 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-seal" />
        <Button variant="primary" onClick={save} disabled={isPending || !key.trim()} loading={isPending}>Save</Button>
      </div>
      <Feedback message={message} />
      {state.connected && <ByokRemoveButton onRemove={remove} disabled={isPending} />}
    </div>
  );
}

function Body({ state }: { state: ByokCardState }) {
  if (!state.enabled) return <p className="text-sm text-muted">BYOK not configured on this server</p>;
  return (
    <div className="space-y-4">
      <ByokStatus state={state} />
      <KeyForm state={state} />
      <ByokGuide />
      <p className="text-xs text-faint leading-relaxed">{NOTE}</p>
    </div>
  );
}

export default function ByokCard({ state }: { state: ByokCardState }) {
  return (
    <LedgerCard hanzi="钥" label="AI KEY">
      <LedgerHeading>Your OpenRouter key</LedgerHeading>
      <div className="p-5"><Body state={state} /></div>
    </LedgerCard>
  );
}
