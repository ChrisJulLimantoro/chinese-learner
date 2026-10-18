"use server";

import { revalidatePath } from "next/cache";
import { getUserContext } from "@/lib/user";
import { removeUserKey, saveUserKey } from "@/lib/byokService";
import type { SaveKeyResult } from "@/lib/byokService";

export async function saveByokKeyAction(key: string): Promise<SaveKeyResult> {
  const { userId } = await getUserContext();
  const result = await saveUserKey(userId, key.trim());
  if (result.ok) revalidatePath("/settings");
  return result;
}

export async function removeByokKeyAction(): Promise<void> {
  const { userId } = await getUserContext();
  await removeUserKey(userId);
  revalidatePath("/settings");
}
