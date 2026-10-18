"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

export default function ByokRemoveButton({ onRemove, disabled }: { onRemove: () => void; disabled: boolean }) {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) return <Button variant="outline" onClick={() => setConfirming(true)} disabled={disabled}>Remove</Button>;
  return (
    <span className="flex items-center gap-2">
      <span className="text-sm text-muted">Remove your key?</span>
      <Button variant="seal" size="sm" onClick={onRemove} disabled={disabled}>Yes, remove</Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>Cancel</Button>
    </span>
  );
}
