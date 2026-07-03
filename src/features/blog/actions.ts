"use server";
import { revalidatePath } from "next/cache";
import { AdminAPI, type BlogPostInput } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";

type Result = { ok: boolean; message?: string; id?: string };

function buildBody(input: BlogPostInput): BlogPostInput {
  return {
    title: input.title.trim(),
    excerpt: input.excerpt?.trim() || "",
    content: input.content,
    is_published: input.is_published ?? false,
  };
}

export async function createBlogPostAction(input: BlogPostInput): Promise<Result> {
  if (!input.title.trim()) return { ok: false, message: "Sarlavhani kiriting" };
  if (!input.content.trim()) return { ok: false, message: "Matnni kiriting" };
  try {
    const post = await AdminAPI.createBlogPost(buildBody(input));
    revalidatePath("/blog");
    return { ok: true, id: post.id };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function updateBlogPostAction(id: string, input: BlogPostInput): Promise<Result> {
  if (!input.title.trim()) return { ok: false, message: "Sarlavhani kiriting" };
  if (!input.content.trim()) return { ok: false, message: "Matnni kiriting" };
  try {
    await AdminAPI.updateBlogPost(id, buildBody(input));
    revalidatePath("/blog");
    revalidatePath(`/blog/${id}`);
    return { ok: true, id };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function deleteBlogPostAction(id: string): Promise<Result> {
  try {
    await AdminAPI.deleteBlogPost(id);
    revalidatePath("/blog");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}
