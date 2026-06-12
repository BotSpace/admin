import Link from "next/link";
import { ArrowLeft, Database } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { CmsAPI } from "@/shared/api/cms";
import { SchemaBuilder } from "@/features/cms/components/schema-builder";

export default async function ProjectCmsCreatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collections = await CmsAPI.listCollections(id).catch(() => []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Database className="h-5 w-5" />
            Yangi collection
          </h1>
          <p className="text-muted-foreground text-sm">Sxema va maydonlarni belgilang</p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/projects/${id}/cms`} className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Ro&apos;yxatga
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <SchemaBuilder projectId={id} collections={collections} />
        </CardContent>
      </Card>
    </div>
  );
}
