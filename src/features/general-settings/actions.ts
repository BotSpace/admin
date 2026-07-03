"use server";
import { revalidatePath } from "next/cache";
import { AdminAPI, type GeneralSettings } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";

export type GeneralSettingsResult =
  | { ok: true; data: GeneralSettings }
  | { ok: false; message: string };

export async function getGeneralSettingsAction(): Promise<GeneralSettingsResult> {
  try {
    const data = await AdminAPI.generalSettings();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Sozlamalarni yuklashda xatolik" };
  }
}

export async function updateGeneralSettingsAction(body: GeneralSettings): Promise<GeneralSettingsResult> {
  try {
    const data = await AdminAPI.updateGeneralSettings(body);
    revalidatePath("/settings/general");
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Saqlashda xatolik yuz berdi" };
  }
}
