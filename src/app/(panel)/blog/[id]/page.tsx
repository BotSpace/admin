import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminAPI } from "@/shared/api/services";
import { BlogForm } from "@/features/blog/blog-form";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) notFound();

  let post;
  try {
    post = await AdminAPI.blogPost(id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/blog"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Blog
        </Link>
        <h1 className="text-2xl font-bold">Postni tahrirlash</h1>
      </div>
      <BlogForm post={post} />
    </div>
  );
}
