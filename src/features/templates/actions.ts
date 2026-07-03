"use server";
import { revalidatePath } from "next/cache";
import {
  AdminAPI,
  type CreateTemplateBody,
  type UpdateTemplateBody,
  type TemplateSubmission,
} from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";

export async function verifyTemplateAction(id: string, is_verify: boolean, note?: string) {
  try {
    await AdminAPI.verifyTemplate(id, { is_verify, note });
    revalidatePath("/templates");
    revalidatePath(`/templates/${id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function updateTemplateAction(id: string, body: UpdateTemplateBody) {
  try {
    await AdminAPI.updateTemplate(id, body);
    revalidatePath(`/templates/${id}`);
    revalidatePath("/templates");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function resyncTemplateAction(id: string) {
  try {
    await AdminAPI.resyncTemplate(id);
    revalidatePath(`/templates/${id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function createTemplateAction(body: CreateTemplateBody) {
  try {
    const created = await AdminAPI.createTemplate(body);
    revalidatePath("/templates");
    return { ok: true as const, id: created.id };
  } catch (e) {
    return { ok: false as const, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function previewTemplateSpecAction(projectId: string) {
  try {
    const data = await AdminAPI.previewTemplateSpec(projectId);
    return { ok: true as const, data };
  } catch (e) {
    return { ok: false as const, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function deleteTemplateAction(id: string) {
  try {
    await AdminAPI.deleteTemplate(id);
    revalidatePath("/templates");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function credentialTypesAction() {
  try {
    const data = await AdminAPI.credentialTypes();
    return { ok: true as const, data };
  } catch (e) {
    return { ok: false as const, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function modulesCatalogAction() {
  try {
    const data = await AdminAPI.modulesCatalog();
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

export async function templateVersionsAction(id: string) {
  try {
    const data = await AdminAPI.templateVersions(id);
    return { ok: true as const, data };
  } catch (e) {
    return { ok: false as const, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function templateVersionAction(id: string, version: number) {
  try {
    const data = await AdminAPI.templateVersion(id, version);
    return { ok: true as const, data };
  } catch (e) {
    return { ok: false as const, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function rollbackTemplateAction(id: string, body: { version: number; note?: string }) {
  try {
    await AdminAPI.rollbackTemplate(id, body);
    revalidatePath(`/templates/${id}`);
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function updateSubmissionAction(
  id: string,
  body: Partial<Pick<TemplateSubmission, "name" | "description" | "status" | "note"> & { categories?: string[]; features?: string[] }>
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

export async function approveSubmissionAction(id: string, note?: string) {
  try {
    await AdminAPI.approveSubmission(id, { note });
    revalidatePath("/templates/submissions");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function rejectSubmissionAction(id: string, note?: string) {
  try {
    await AdminAPI.rejectSubmission(id, { note });
    revalidatePath("/templates/submissions");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}
