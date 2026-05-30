"use server";
import { revalidatePath } from "next/cache";
import { AdminAPI } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";

export async function banUserAction(id: number, is_active: boolean, note?: string) {
  try {
    await AdminAPI.banUser(id, { is_active, note });
    revalidatePath(`/users/${id}`);
    revalidatePath("/users");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function adjustBalanceAction(
  id: number,
  field: "balance" | "template_balance",
  value: string,
  note?: string
) {
  try {
    await AdminAPI.adjustBalance(id, { field, value, note });
    revalidatePath(`/users/${id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}
