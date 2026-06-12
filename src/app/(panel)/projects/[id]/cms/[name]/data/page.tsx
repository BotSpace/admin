import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Database, Settings2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { CmsAPI } from "@/shared/api/cms";
import { DataGrid } from "@/features/cms/components/data-grid";

export default async function ProjectCmsDataPage({
  params,
}: {
  params: Promise<{ id: string; name: string }>;
}) {
  const { id, name } = await params;

  const collection = await CmsAPI.getCollection(id, name).catch(() => null);
  if (!collection) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/projects/${id}/cms`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Collection&apos;lar
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Database className="h-5 w-5" />
            {collection.label || collection.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            <code className="font-mono">{collection.name}</code>
            {" · "}v{collection.schema_version}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/projects/${id}/cms/${name}`} className="gap-2">
            <Settings2 className="h-4 w-4" />
            Sxema
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataGrid
            projectId={id}
            collectionName={collection.name}
            fields={collection.fields ?? []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
