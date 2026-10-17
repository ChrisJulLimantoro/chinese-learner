"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui";

const MANDARIN = "zh-CN";

function subscribeNever(): () => void {
  return () => {};
}

function speechSupported(): boolean {
  return "speechSynthesis" in window;
}

function neverSupportedOnServer(): boolean {
  return false;
}

function speakMandarin(text: string): void {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = MANDARIN;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export default function SpeakButton({ text, className = "" }: { text: string; className?: string }) {
  const supported = useSyncExternalStore(subscribeNever, speechSupported, neverSupportedOnServer);
  if (!supported) return null;
  return (
    <Button variant="ghost" size="sm" className={className} onClick={() => speakMandarin(text)} aria-label={`Listen to ${text}`}>
      Listen
    </Button>
  );
}
