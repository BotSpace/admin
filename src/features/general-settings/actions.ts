"use server";
import { revalidatePath } from "next/cache";
import { AdminAPI, type SettingGroup } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";

export type SettingsResult =
  | { ok: true; data: SettingGroup[] }
  | { ok: false; message: string };

export type SetSettingResult =
  | { ok: true }
  | { ok: false; message: string };

export async function getSettingsAction(): Promise<SettingsResult> {
  try {
    const data = await AdminAPI.getSettings();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Sozlamalarni yuklashda xatolik" };
  }
}

export async function setSettingAction(
  settings_key: string,
  option_key: string,
  value: string[]
): Promise<SetSettingResult> {
  try {
    await AdminAPI.setSetting(settings_key, option_key, value);
    revalidatePath("/settings/general");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Saqlashda xatolik yuz berdi" };
  }
}
