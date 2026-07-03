"use server";
import { revalidatePath } from "next/cache";
import { AdminAPI } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";

export async function approveKycAction(id: string, note?: string) {
  try {
    await AdminAPI.approveKyc(id, { note });
    revalidatePath("/kyc");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function rejectKycAction(id: string, rejection_reason: string) {
  try {
    await AdminAPI.rejectKyc(id, { rejection_reason });
    revalidatePath("/kyc");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}
