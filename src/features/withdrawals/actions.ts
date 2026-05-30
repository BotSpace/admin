"use server";
import { revalidatePath } from "next/cache";
import { AdminAPI } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";

export async function approveWithdrawalAction(id: number, note?: string) {
  try {
    await AdminAPI.approveWithdrawal(id, { note });
    revalidatePath("/withdrawals");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function rejectWithdrawalAction(id: number, rejection_reason: string) {
  try {
    await AdminAPI.rejectWithdrawal(id, { rejection_reason });
    revalidatePath("/withdrawals");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}
