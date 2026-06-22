"use server";
import { revalidatePath } from "next/cache";
import { AdminAPI, type CredentialTypeInput, type CredentialTypePatch } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";

export async function createCredentialTypeAction(body: CredentialTypeInput) {
  try {
    await AdminAPI.createCredentialType(body);
    revalidatePath("/credential-types");
    return { ok: true };
  } catch (e) {
    if (isApiError(e)) {
      // 400 da detail/key xatolar bo'lishi mumkin
      const details = e.details as Record<string, unknown> | null;
      if (details && typeof details === "object") {
        const keyErr = (details as Record<string, unknown>).key;
        if (Array.isArray(keyErr)) return { ok: false, message: String(keyErr[0]) };
        const detail = (details as Record<string, unknown>).detail;
        if (typeof detail === "string") return { ok: false, message: detail };
      }
      return { ok: false, message: e.message };
    }
    return { ok: false, message: "Xatolik yuz berdi" };
  }
}

export async function updateCredentialTypeAction(key: string, body: CredentialTypePatch) {
  try {
    await AdminAPI.updateCredentialType(key, body);
    revalidatePath("/credential-types");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function deleteCredentialTypeAction(key: string) {
  try {
    await AdminAPI.deleteCredentialType(key);
    revalidatePath("/credential-types");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}
