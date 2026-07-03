"use server";
import { revalidatePath } from "next/cache";
import { AdminAPI, type Plan } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";

export async function createPlanAction(body: Omit<Plan, "id">) {
  try {
    await AdminAPI.createPlan(body);
    revalidatePath("/plans");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function updatePlanAction(id: string, body: Partial<Omit<Plan, "id">>) {
  try {
    await AdminAPI.updatePlan(id, body);
    revalidatePath("/plans");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function deletePlanAction(id: string) {
  try {
    await AdminAPI.deletePlan(id);
    revalidatePath("/plans");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}
