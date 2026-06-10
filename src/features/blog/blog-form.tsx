"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { type AdminBlogPost } from "@/shared/api/services";
import { MarkdownPreview } from "./markdown-preview";
import { createBlogPostAction, updateBlogPostAction } from "./actions";

type FormState = {
  title: string;
  excerpt: string;
  cover_image: string;
  content: string;
  is_published: boolean;
};

function toForm(post?: AdminBlogPost): FormState {
  return {
    title: post?.title ?? "",
    excerpt: post?.excerpt ?? "",
    cover_image: post?.cover_image ?? "",
    content: post?.content ?? "",
    is_published: post?.is_published ?? false,
  };
}

export function BlogForm({ post }: { post?: AdminBlogPost }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(toForm(post));
  const [loading, setLoading] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.title.trim()) {
      toast.error("Sarlavhani kiriting");
      return;
    }
    if (!form.content.trim()) {
      toast.error("Matnni kiriting");
      return;
    }
    setLoading(true);
    const payload = {
      title: form.title,
      excerpt: form.excerpt,
      cover_image: form.cover_image,
      content: form.content,
      is_published: form.is_published,
    };
    const res = post
      ? await updateBlogPostAction(post.id, payload)
      : await createBlogPostAction(payload);
    setLoading(false);
    if (res.ok) {
      toast.success(post ? "Post yangilandi" : "Post yaratildi");
      router.push("/blog");
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="blog-title">Sarlavha</Label>
        <Input
          id="blog-title"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Post sarlavhasi"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="blog-excerpt">Qisqa tavsif</Label>
        <Input
          id="blog-excerpt"
          value={form.excerpt}
          onChange={(e) => set("excerpt", e.target.value)}
          placeholder="Ro'yxat kartochkasida ko'rinadigan qisqa matn"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="blog-cover">Muqova rasmi (URL, ixtiyoriy)</Label>
        <Input
          id="blog-cover"
          type="url"
          value={form.cover_image}
          onChange={(e) => set("cover_image", e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-1.5">
        <Label>Matn (Markdown)</Label>
        <div className="grid gap-3 md:grid-cols-2">
          <Textarea
            value={form.content}
            onChange={(e) => set("content", e.target.value)}
            placeholder="# Sarlavha&#10;&#10;Markdown bilan yozing..."
            className="min-h-[420px] font-mono text-sm"
          />
          <div className="min-h-[420px] overflow-y-auto rounded-md border bg-muted/20 p-4">
            <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Ko&apos;rinish</p>
            <MarkdownPreview content={form.content} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="blog-published"
          checked={form.is_published}
          onCheckedChange={(v) => set("is_published", v)}
        />
        <Label htmlFor="blog-published">E&apos;lon qilingan</Label>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
        <Button variant="outline" onClick={() => router.push("/blog")} disabled={loading}>
          Bekor qilish
        </Button>
      </div>
    </div>
  );
}
