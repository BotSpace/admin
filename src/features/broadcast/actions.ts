"use server";
import { AdminAPI, type BroadcastMessage } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";

export type SendResult =
  | { ok: true; data: BroadcastMessage }
  | { ok: false; message: string };

export type ListResult =
  | { ok: true; data: BroadcastMessage[] }
  | { ok: false; message: string };

export async function sendBroadcastAction(
  projectId: number,
  caption: string
): Promise<SendResult> {
  try {
    const data = await AdminAPI.sendBroadcast({ project: projectId, caption });
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function listBroadcastsAction(projectId: number): Promise<ListResult> {
  try {
    const data = await AdminAPI.broadcastList(projectId);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}
