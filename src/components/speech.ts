const MANDARIN = "zh-CN";

export const NORMAL_RATE = 1;
export const SLOW_RATE = 0.6;

function normalizedLang(voice: SpeechSynthesisVoice): string {
  return voice.lang.replace("_", "-").toLowerCase();
}

function mandarinVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => normalizedLang(v) === "zh-cn") ?? voices.find((v) => normalizedLang(v).startsWith("zh"));
}

export function speakMandarin(text: string, rate: number): void {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = MANDARIN;
  utterance.rate = rate;
  utterance.voice = mandarinVoice() ?? null;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function speechSupported(): boolean {
  return "speechSynthesis" in window;
}
