import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Database, Settings2, Table } from "lucide-react";
import { CmsAPI } from "@/shared/api/cms";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { FieldEditor } from "@/features/cms/components/field-editor";
import { DeleteCollectionButton } from "@/features/cms/components/delete-collection-button";

export default async function ProjectCmsSchemaPage({
  params,
}: {
  params: Promise<{ id: string; name: string }>;
}) {
  const { id, name } = await params;

  const collection = await CmsAPI.getCollection(id, name).catch(() => null);
  if (!collection) notFound();

  const collections = await CmsAPI.listCollections(id).catch(() => []);

  return (
    <div className="space-y-6 max-w-4xl">
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
            {collection.system && (
              <Badge variant="secondary" className="text-[10px]">
                tizim
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground text-sm">
            <code className="font-mono">{collection.name}</code>
            {" · "}v{collection.schema_version}
            {" · "}
            {collection.fields?.length ?? 0} maydon
            {collection.description && (
              <span className="ml-2 text-muted-foreground">{collection.description}</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/projects/${id}/cms/${name}/data`} className="gap-2">
              <Table className="h-4 w-4" />
              Hujjatlar
            </Link>
          </Button>
          {collection.can_delete !== false && !collection.system && (
            <DeleteCollectionButton
              projectId={id}
              name={collection.name}
              label={collection.label}
            />
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Settings2 className="h-4 w-4" />
            Sxema (maydonlar)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldEditor
            projectId={id}
            collectionName={collection.name}
            initialFields={collection.fields ?? []}
            collections={collections}
            primaryField={collection.primary_field}
          />
        </CardContent>
      </Card>
    </div>
  );
}
