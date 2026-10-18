import type { ByokCardState } from "@/lib/byokService";

function quotaText(quota: NonNullable<ByokCardState["quota"]>): string {
  return `Today: ${quota.remaining} / ${quota.limit} free requests left`;
}

export default function ByokStatus({ state }: { state: ByokCardState }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-ink">
        {state.connected ? `Connected: ${state.hint}` : "Using shared quota"}
      </p>
      {state.quota && <p className="text-xs text-muted">{quotaText(state.quota)}</p>}
    </div>
  );
}
