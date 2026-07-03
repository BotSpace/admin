"use server";
import { revalidatePath } from "next/cache";
import { AdminAPI, type AiAgentSettings } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";

export type AiSettingsResult =
  | { ok: true; data: AiAgentSettings }
  | { ok: false; message: string };

export async function getAiSettingsAction(): Promise<AiSettingsResult> {
  try {
    const data = await AdminAPI.aiAgentSettings();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function updateAiSettingsAction(body: AiAgentSettings): Promise<AiSettingsResult> {
  try {
    const data = await AdminAPI.updateAiAgentSettings(body);
    revalidatePath("/settings/ai");
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}
