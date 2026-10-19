"use client";

import { useSyncExternalStore } from "react";
import { NORMAL_RATE, SLOW_RATE, speakMandarin, speechSupported } from "./speech";
import { SlowSealIcon, SpeakerIcon } from "./SpeechIcons";

const SEGMENT = "group relative inline-flex items-center gap-1 h-8 px-2.5 text-sm text-ink hover:bg-surface-2 transition-[background-color,transform] duration-150 active:scale-95 motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-seal focus-visible:ring-inset";
const TOOLTIP = "pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] font-medium text-paper opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100";

function subscribeNever(): () => void {
  return () => {};
}

function neverSupportedOnServer(): boolean {
  return false;
}

type SegmentProps = { tooltip: string; ariaLabel: string; className: string; onClick: () => void; children: React.ReactNode };

function Segment({ tooltip, ariaLabel, className, onClick, children }: SegmentProps) {
  return (
    <button type="button" className={`${SEGMENT} ${className}`} onClick={onClick} aria-label={ariaLabel}>
      {children}
      <span role="tooltip" className={TOOLTIP}>{tooltip}</span>
    </button>
  );
}

type SpeakButtonProps = { text: string; label?: string; className?: string };

export default function SpeakButton({ text, label, className = "" }: SpeakButtonProps) {
  const supported = useSyncExternalStore(subscribeNever, speechSupported, neverSupportedOnServer);
  if (!supported) return null;
  const subject = label ?? text;
  return (
    <span className={`inline-flex items-stretch rounded-full border border-border divide-x divide-border ${className}`}>
      <Segment tooltip="Normal speed" ariaLabel={`Listen to ${subject}`} className="rounded-l-full" onClick={() => speakMandarin(text, NORMAL_RATE)}>
        <SpeakerIcon />{label && <span>{label}</span>}
      </Segment>
      <Segment tooltip="Slower · 慢 màn" ariaLabel={`Listen slowly to ${subject}`} className="rounded-r-full" onClick={() => speakMandarin(text, SLOW_RATE)}>
        <SlowSealIcon />
      </Segment>
    </span>
  );
}
