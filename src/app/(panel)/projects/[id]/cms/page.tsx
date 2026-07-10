import Link from "next/link";
import { ChevronLeft, Database, Plus } from "lucide-react";
import { CmsAPI } from "@/shared/api/cms";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";

export default async function ProjectCmsListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collections = await CmsAPI.listCollections(id).catch(() => []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link
          href={`/projects/${id}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Loyiha
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Database className="h-5 w-5" />
            Collection&apos;lar
          </h1>
          <p className="text-muted-foreground text-sm">Loyiha ma&apos;lumotlar bazasi (CMS)</p>
        </div>
        <Button asChild>
          <Link href={`/projects/${id}/cms/new`} className="gap-2">
            <Plus className="h-4 w-4" />
            Yangi collection
          </Link>
        </Button>
      </div>

      {collections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Database className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Hozircha collection yo&apos;q</p>
            <Button asChild size="sm">
              <Link href={`/projects/${id}/cms/new`} className="gap-2">
                <Plus className="h-4 w-4" />
                Yangi collection
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <Link key={c.id} href={`/projects/${id}/cms/${c.slug}/data`} className="block h-full">
              <Card className="flex h-full flex-col overflow-hidden transition hover:border-primary/40">
                <CardContent className="flex flex-1 flex-col space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold">{c.label || c.name}</h3>
                        {c.system && <Badge variant="secondary">tizim</Badge>}
                      </div>
                      <code className="text-xs text-muted-foreground">{c.name}</code>
                    </div>
                  </div>
                  {c.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                  )}
                  <div className="mt-auto pt-2">
                    <div className="text-xs text-muted-foreground">
                      {c.fields_count ?? c.fields?.length ?? 0} maydon · v{c.schema_version}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
