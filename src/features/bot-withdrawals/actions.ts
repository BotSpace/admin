"use server";
import { revalidatePath } from "next/cache";
import { AdminAPI } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";

export async function approveBotWithdrawalAction(id: number, note?: string) {
  try {
    await AdminAPI.approveBotWithdrawal(id, { note });
    revalidatePath("/bot-withdrawals");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function rejectBotWithdrawalAction(id: number, rejection_reason: string) {
  try {
    await AdminAPI.rejectBotWithdrawal(id, { rejection_reason });
    revalidatePath("/bot-withdrawals");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}
