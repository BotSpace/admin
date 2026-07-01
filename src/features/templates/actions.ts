"use server";
import { revalidatePath } from "next/cache";
import {
  AdminAPI,
  type AdminTemplateDetail,
  type CreateTemplateBody,
  type TemplateSubmission,
} from "@/shared/api/services";
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
  body: Partial<
    Pick<
      AdminTemplateDetail,
      "name" | "short_description" | "description" | "original_price" | "discount" | "discount_type" | "is_verify" | "demo_url" | "spec"
    >
  >,
  image?: File
) {
  try {
    await AdminAPI.updateTemplate(id, body, image);
    revalidatePath(`/templates/${id}`);
    revalidatePath("/templates");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function resyncTemplateAction(id: number) {
  try {
    await AdminAPI.resyncTemplate(id);
    revalidatePath(`/templates/${id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function createTemplateAction(body: CreateTemplateBody, image?: File) {
  try {
    const created = await AdminAPI.createTemplate(body, image);
    revalidatePath("/templates");
    return { ok: true as const, id: created.id };
  } catch (e) {
    return { ok: false as const, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function previewTemplateSpecAction(projectId: number) {
  try {
    const data = await AdminAPI.previewTemplateSpec(projectId);
    return { ok: true as const, data };
  } catch (e) {
    return { ok: false as const, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function searchProjectsAction(search: string) {
  try {
    const page = await AdminAPI.projects({ search: search || undefined, page: 1 });
    return { ok: true as const, data: page.results };
  } catch (e) {
    return { ok: false as const, message: isApiError(e) ? e.message : "Xatolik yuz berdi", data: [] };
  }
}

export async function templateVersionsAction(id: number) {
  try {
    const data = await AdminAPI.templateVersions(id);
    return { ok: true as const, data };
  } catch (e) {
    return { ok: false as const, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function templateVersionAction(id: number, version: number) {
  try {
    const data = await AdminAPI.templateVersion(id, version);
    return { ok: true as const, data };
  } catch (e) {
    return { ok: false as const, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function rollbackTemplateAction(id: number, body: { version: number; note?: string }) {
  try {
    await AdminAPI.rollbackTemplate(id, body);
    revalidatePath(`/templates/${id}`);
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
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
