"use server";
import { revalidatePath } from "next/cache";
import { AdminAPI } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";

export async function verifyTemplateAction(id: number, is_verify: boolean, note?: string) {
  try {
    await AdminAPI.verifyTemplate(id, { is_verify, note });
    revalidatePath("/templates");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function approveSubmissionAction(id: number, note?: string) {
  try {
    await AdminAPI.approveSubmission(id, { note });
    revalidatePath("/templates/submissions");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function rejectSubmissionAction(id: number, note?: string) {
  try {
    await AdminAPI.rejectSubmission(id, { note });
    revalidatePath("/templates/submissions");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}
