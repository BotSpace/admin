"use server";
import { revalidatePath } from "next/cache";
import { AdminAPI, type PlatformConfig } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";

export type ConfigResult =
  | { ok: true; data: PlatformConfig }
  | { ok: false; message: string };

export type ConfigsResult =
  | { ok: true; data: PlatformConfig[] }
  | { ok: false; message: string };

export async function getConfigsAction(): Promise<ConfigsResult> {
  try {
    const data = await AdminAPI.configs();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function updateConfigAction(
  key: string,
  value: string
): Promise<ConfigResult> {
  try {
    const data = await AdminAPI.updateConfig(key, value);
    revalidatePath("/settings/ai");
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}
