"use server";
import { revalidatePath } from "next/cache";
import { AdminAPI } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";

type Result = { ok: boolean; message?: string };

export async function replyTicketAction(
  id: string,
  _prev: Result | undefined,
  formData: FormData,
): Promise<Result> {
  const message = String(formData.get("message") ?? "").trim();
  const close = formData.get("close") === "on";
  const file = formData.get("attachment");
  if (!message) return { ok: false, message: "Xabarni kiriting" };

  const out = new FormData();
  out.append("message", message);
  if (close) out.append("close", "true");
  if (file instanceof File && file.size > 0) out.append("attachment", file, file.name);

  try {
    await AdminAPI.replyTicket(id, out);
    revalidatePath(`/tickets/${id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function closeTicketAction(id: string): Promise<Result> {
  try {
    await AdminAPI.closeTicket(id);
    revalidatePath(`/tickets/${id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}
