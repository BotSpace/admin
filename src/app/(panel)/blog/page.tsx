import Link from "next/link";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { AdminAPI } from "@/shared/api/services";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DeleteBlogButton } from "@/features/blog/delete-blog-button";

type SearchParams = { page?: string };

export default async function BlogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  let result;
  try {
    result = await AdminAPI.blogPosts({ page });
  } catch {
    result = null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog</h1>
          <p className="text-muted-foreground text-sm">
            {result ? `Jami: ${result.total_items}` : "Blog postlari"}
          </p>
        </div>
        <Button asChild>
          <Link href="/blog/new">
            <Plus className="mr-1 h-4 w-4" />
            Yangi post
          </Link>
        </Button>
      </div>

      {result === null ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Ma&apos;lumotlarni yuklashda xatolik
        </div>
      ) : result.results.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
          Postlar topilmadi
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <ul className="divide-y">
            {result.results.map((post) => (
              <li key={post.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <Link href={`/blog/${post.id}`} className="min-w-0 flex-1 transition-colors hover:opacity-80">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{post.title}</span>
                    <Badge variant={post.is_published ? "success" : "secondary"}>
                      {post.is_published ? "E'lon qilingan" : "Qoralama"}
                    </Badge>
                  </div>
                  {post.excerpt && (
                    <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{post.excerpt}</p>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    /{post.slug} · Yangilangan: {format(new Date(post.updated_at), "dd.MM.yyyy HH:mm")}
                  </p>
                </Link>
                <div className="flex shrink-0 items-center gap-1">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/blog/${post.id}`}>Tahrirlash</Link>
                  </Button>
                  <DeleteBlogButton id={post.id} title={post.title} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
