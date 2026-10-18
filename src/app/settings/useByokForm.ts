import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeByokKeyAction, saveByokKeyAction } from "@/app/actions/byok";

export type ByokMessage = { kind: "idle" } | { kind: "saved" } | { kind: "error"; text: string };

export function useByokForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<ByokMessage>({ kind: "idle" });
  const [key, setKey] = useState("");
  const save = () => startTransition(async () => {
    const result = await saveByokKeyAction(key);
    setMessage(result.ok ? { kind: "saved" } : { kind: "error", text: result.error });
    if (result.ok) { setKey(""); router.refresh(); }
  });
  const remove = () => startTransition(async () => {
    await removeByokKeyAction();
    setMessage({ kind: "idle" });
    router.refresh();
  });
  return { key, setKey, message, isPending, save, remove };
}
