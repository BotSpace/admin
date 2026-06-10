import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BlogForm } from "@/features/blog/blog-form";

export default function NewBlogPostPage() {
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
        <h1 className="text-2xl font-bold">Yangi post</h1>
      </div>
      <BlogForm />
    </div>
  );
}
