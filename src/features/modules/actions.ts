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

export async function registerModuleYamlAction(body: { yaml?: string; yaml_url?: string }) {
  try {
    const res = await AdminAPI.registerModuleYaml(body);
    revalidatePath("/modules");
    if (res.module?.slug) revalidatePath(`/modules/${res.module.slug}`);
    return { ok: true, mode: res.mode, slug: res.module?.slug };
  } catch (e) {
    if (isApiError(e)) {
      // detail field backenddan keladi — uni to'g'ridan qaytaramiz
      return { ok: false, message: e.message };
    }
    return { ok: false, message: "Xatolik yuz berdi" };
  }
}

export async function registerModuleGithubAction(body: { repo_url: string }) {
  try {
    const res = await AdminAPI.registerModuleGithub(body);
    revalidatePath("/modules");
    if (res.module?.slug) revalidatePath(`/modules/${res.module.slug}`);
    return { ok: true, mode: res.mode, slug: res.module?.slug, build_job: res.build_job, warning: res.warning };
  } catch (e) {
    if (isApiError(e)) {
      return { ok: false, message: e.message };
    }
    return { ok: false, message: "Xatolik yuz berdi" };
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

export async function setModuleActiveAction(slug: string, active: boolean) {
  try {
    await AdminAPI.updateModule(slug, { active });
    revalidatePath("/modules");
    revalidatePath(`/modules/${slug}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function setModuleDefaultAction(slug: string, is_default: boolean) {
  try {
    await AdminAPI.updateModule(slug, { is_default });
    revalidatePath("/modules");
    revalidatePath(`/modules/${slug}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}
