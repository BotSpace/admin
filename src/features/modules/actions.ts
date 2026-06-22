"use server";
import { revalidatePath } from "next/cache";
import { AdminAPI, type AdminModuleInput } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";

export async function refreshModuleManifestAction(slug: string) {
  try {
    await AdminAPI.refreshModuleManifest(slug);
    revalidatePath("/modules");
    revalidatePath(`/modules/${slug}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function createModuleAction(body: AdminModuleInput) {
  try {
    await AdminAPI.createModule(body);
    revalidatePath("/modules");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function updateModuleAction(slug: string, body: Partial<AdminModuleInput>) {
  try {
    await AdminAPI.updateModule(slug, body);
    revalidatePath("/modules");
    revalidatePath(`/modules/${slug}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function deleteModuleAction(slug: string) {
  try {
    await AdminAPI.deleteModule(slug);
    revalidatePath("/modules");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}
