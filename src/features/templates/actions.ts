"use server";
import { revalidatePath } from "next/cache";
import { AdminAPI, type AdminTemplateDetail, type TemplateSubmission } from "@/shared/api/services";
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

export async function updateTemplateAction(
  id: number,
  body: Partial<Pick<AdminTemplateDetail, "name" | "short_description" | "description" | "original_price" | "discount" | "discount_type" | "is_verify" | "demo_url">>
) {
  try {
    await AdminAPI.updateTemplate(id, body);
    revalidatePath(`/templates/${id}`);
    revalidatePath("/templates");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function updateSubmissionAction(
  id: number,
  body: Partial<Pick<TemplateSubmission, "name" | "description" | "status" | "note"> & { categories?: number[]; features?: number[] }>
) {
  try {
    await AdminAPI.updateSubmission(id, body);
    revalidatePath(`/templates/submissions/${id}`);
    revalidatePath("/templates/submissions");
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
