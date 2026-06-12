import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FilePlus2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { CmsAPI } from "@/shared/api/cms";
import { DocumentForm } from "@/features/cms/components/document-form";

export default async function ProjectCmsNewDocPage({
  params,
}: {
  params: Promise<{ id: string; name: string }>;
}) {
  const { id, name } = await params;

  const collection = await CmsAPI.getCollection(id, name).catch(() => null);
  if (!collection) notFound();

  const collections = await CmsAPI.listCollections(id).catch(() => []);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <FilePlus2 className="h-5 w-5" />
            Yangi hujjat
          </h1>
          <p className="text-muted-foreground text-sm">
            <code className="font-mono">{collection.name}</code>
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/projects/${id}/cms/${name}/data`} className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Hujjatlarga
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DocumentForm
            projectId={id}
            collectionName={collection.name}
            fields={collection.fields ?? []}
            collections={collections}
          />
        </CardContent>
      </Card>
    </div>
  );
}
