import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminAPI } from "@/shared/api/services";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { RefreshManifestButton } from "@/features/modules/refresh-manifest-button";
import { ModuleFormDialog } from "@/features/modules/module-form-dialog";
import { DeleteModuleButton } from "@/features/modules/delete-module-button";
import { ModuleStatusBadge } from "@/features/modules/module-status-badge";
import { ToggleModuleActiveButton } from "@/features/modules/toggle-module-active-button";
import { MarkdownPreview } from "@/features/blog/markdown-preview";
import { ChevronLeft, ExternalLink, Github } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ModuleDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let mod;
  try {
    mod = await AdminAPI.module(slug);
  } catch {
    notFound();
  }

  // manifest_cache._source.mode dan mode olish
  const manifestCache = mod.manifest_cache as
    | { _source?: { mode?: string; endpoint?: string } }
    | null
    | undefined;
  const sourceMode = manifestCache?._source?.mode;
  const sourceEndpoint = manifestCache?._source?.endpoint;
  const sourceModeLabel =
    sourceMode === "github"
      ? "GitHub build"
      : sourceMode === "endpoint"
      ? `Self-hosted${sourceEndpoint ? `: ${sourceEndpoint}` : ""}`
      : null;

  // SSR holati (initial render uchun)
  let initialStatus = null;
  try {
    initialStatus = await AdminAPI.moduleStatus(slug);
  } catch {
    // polling orqali keyinchalik yuklanadi
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/modules">
            <Button variant="ghost" size="icon" className="h-8 w-8 mt-0.5">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {mod.icon && <span className="text-2xl">{mod.icon}</span>}
              <h1 className="text-2xl font-bold">{mod.name}</h1>
              <Badge variant={mod.active ? "success" : "secondary"}>
                {mod.active ? "Faol" : "Nofaol"}
              </Badge>
              {mod.active && <ModuleStatusBadge slug={mod.slug} size="md" />}
              {sourceModeLabel && (
                <Badge variant="outline" className="font-mono text-xs">
                  {sourceModeLabel}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm font-mono mt-0.5">{mod.slug}</p>
            {mod.description && (
              <p className="text-sm text-muted-foreground mt-1">{mod.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ToggleModuleActiveButton slug={mod.slug} active={mod.active} variant="labeled" />
          <RefreshManifestButton slug={mod.slug} />
          <ModuleFormDialog isUpdate />
          <DeleteModuleButton slug={mod.slug} name={mod.name} redirectAfter />
        </div>
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {/* Jonli holat kartochkasi */}
        <div className="rounded-lg border bg-card p-4 space-y-2 sm:col-span-2 lg:col-span-2">
          <p className="text-xs text-muted-foreground">Holat</p>
          <div className="flex items-center gap-2 flex-wrap">
            <ModuleStatusBadge slug={mod.slug} size="md" />
          </div>
          {/* Pod / endpoint qo'shimcha ma'lumot */}
          {initialStatus && (
            <div className="text-xs text-muted-foreground space-y-0.5 pt-1">
              {initialStatus.mode === "github" ? (
                <>
                  {initialStatus.pod && (
                    <p>
                      Pod:{" "}
                      <span className="font-medium">
                        {initialStatus.pod === "running"
                          ? "ishlamoqda"
                          : initialStatus.pod === "init"
                          ? "ishga tushmoqda"
                          : "toʻxtagan"}
                      </span>
                    </p>
                  )}
                  {initialStatus.build && initialStatus.build.status !== "none" && (
                    <p>
                      Build:{" "}
                      <span className="font-medium">
                        {initialStatus.build.status === "succeeded"
                          ? "muvaffaqiyatli"
                          : initialStatus.build.status === "failed"
                          ? "xato"
                          : initialStatus.build.status === "running"
                          ? "jarayonda"
                          : initialStatus.build.status}
                      </span>
                      {initialStatus.build.at && (
                        <span className="ml-1 opacity-70">
                          ({formatDate(initialStatus.build.at)})
                        </span>
                      )}
                    </p>
                  )}
                </>
              ) : (
                <>
                  {initialStatus.endpoint && (
                    <p className="font-mono truncate">{initialStatus.endpoint}</p>
                  )}
                  <p>
                    Javob bermoqda:{" "}
                    <span className={initialStatus.reachable ? "text-emerald-600" : "text-destructive"}>
                      {initialStatus.reachable ? "ha" : "yoʼq"}
                    </span>
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Port</p>
          <p className="font-mono font-medium">{mod.port || "—"}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Node&apos;lar soni</p>
          <p className="font-medium">{mod.nodes?.length ?? 0} ta</p>
        </div>
        <div className="rounded-lg border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Manifest olingan</p>
          <p className="text-sm">{formatDate(mod.manifest_fetched_at)}</p>
        </div>
      </div>

      {/* Yaratilgan / yangilangan */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Yaratilgan</p>
          <p className="text-sm">{formatDate(mod.created_at)}</p>
        </div>
      </div>

      {/* Links */}
      {(mod.github_url || mod.image) && (
        <div className="flex flex-wrap gap-3">
          {mod.github_url && (
            <a
              href={mod.github_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              GitHub
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {mod.image && (
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground font-mono">
              {mod.image}
            </span>
          )}
        </div>
      )}

      {/* Nodes table */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Node&apos;lar</h2>
        {!mod.nodes?.length ? (
          <div className="rounded-lg border p-8 text-center text-muted-foreground text-sm">
            Node&apos;lar hali yuklanmagan. &quot;Yangilash&quot; tugmasini bosing.
          </div>
        ) : (
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Nomi</TableHead>
                  <TableHead>Kategoriya</TableHead>
                  <TableHead>Trigger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mod.nodes.map((n) => (
                  <TableRow key={n.type}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {n.type}
                    </TableCell>
                    <TableCell className="font-medium">{n.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{n.category || "—"}</Badge>
                    </TableCell>
                    <TableCell>
                      {n.trigger ? (
                        <Badge variant="default">Trigger</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Docs */}
      {mod.docs && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Hujjatlar (docs)</h2>
          <div className="rounded-lg border bg-card p-5">
            <MarkdownPreview content={mod.docs} />
          </div>
        </div>
      )}
    </div>
  );
}
