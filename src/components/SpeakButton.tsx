"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui";
import { NORMAL_RATE, SLOW_RATE, speakMandarin, speechSupported } from "./speech";
import { SpeakerIcon, TurtleIcon } from "./SpeechIcons";

function subscribeNever(): () => void {
  return () => {};
}

function neverSupportedOnServer(): boolean {
  return false;
}

type SpeakButtonProps = { text: string; label?: string; className?: string };

export default function SpeakButton({ text, label, className = "" }: SpeakButtonProps) {
  const supported = useSyncExternalStore(subscribeNever, speechSupported, neverSupportedOnServer);
  if (!supported) return null;
  const subject = label ?? text;
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      <Button variant="ghost" size="sm" onClick={() => speakMandarin(text, NORMAL_RATE)} aria-label={`Listen to ${subject}`} title="Listen">
        <SpeakerIcon />{label && <span className="ml-1">{label}</span>}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => speakMandarin(text, SLOW_RATE)} aria-label={`Listen slowly to ${subject}`} title="Listen slowly">
        <TurtleIcon />
      </Button>
    </span>
  );
}
