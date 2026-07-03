"use server";

import { redirect } from "next/navigation";
import { apiFetch, isApiError } from "@/shared/api/client";
import { setSessionCookie, clearSessionCookie, type SessionUser } from "@/shared/auth/session";

type LoginResponse = {
  access_token: string;
  refresh_token: string;
  access_expires_at: string;
  refresh_expires_at: string;
  token_type: string;
};

type MeResponse = {
  id: string;
  phone: string;
  first_name: string;
  last_name: string;
  username?: string;
  email?: string;
  role: string;
};

export type LoginState = { error?: string } | null;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!phone || !password) {
    return { error: "Telefon va parolni kiriting" };
  }

  let tokens: LoginResponse;
  try {
    tokens = await apiFetch<LoginResponse>("/api/v1/auth/login", {
      method: "POST",
      json: { phone, password },
      skipAuth: true,
    });
  } catch (e) {
    if (isApiError(e)) return { error: e.message };
    return { error: "Login amalga oshmadi" };
  }

  let me: MeResponse;
  try {
    me = await apiFetch<MeResponse>("/api/v1/users/me", { token: tokens.access_token });
  } catch (e) {
    if (isApiError(e)) return { error: e.message };
    return { error: "Foydalanuvchi ma'lumotini olib bo'lmadi" };
  }

  if (me.role !== "admin" && me.role !== "superuser") {
    return { error: "Sizda admin huquqlari yo'q" };
  }

  const user: SessionUser = {
    id: me.id,
    phone: me.phone,
    first_name: me.first_name,
    last_name: me.last_name,
    username: me.username,
    email: me.email,
    role: me.role,
    is_staff: me.role === "admin",
    is_superuser: me.role === "superuser",
  };

  await setSessionCookie({ access: tokens.access_token, refresh: tokens.refresh_token, user });
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}
