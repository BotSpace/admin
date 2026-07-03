import { Suspense } from "react";
import { AdminAPI, type CredentialType } from "@/shared/api/services";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { CredentialTypesSourceTabs } from "@/features/credential-types/credential-types-source-tabs";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function sourceBadge(source: CredentialType["source"]) {
  if (source === "code")
    return <Badge variant="secondary">Kod</Badge>;
  if (source === "admin")
    return <Badge variant="default">Admin</Badge>;
  // module:<slug>
  const slug = source.replace("module:", "");
  return (
    <Badge variant="outline" className="font-mono text-xs">
      {slug}
    </Badge>
  );
}

function modeBadge(mode: CredentialType["mode"]) {
  const MAP: Record<CredentialType["mode"], string> = {
    bearer: "Bearer",
    apikey: "API Key",
    basic: "Basic",
    header: "Header",
    oauth2: "OAuth2",
    none: "Boshqa",
  };
  return (
    <span className="text-xs text-muted-foreground font-mono">{MAP[mode] ?? mode}</span>
  );
}

function getSourceTab(source: CredentialType["source"]): "code" | "admin" | "module" {
  if (source === "code") return "code";
  if (source === "admin") return "admin";
  return "module";
}

export default async function CredentialTypesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const sourceFilter = typeof sp.source === "string" ? sp.source : undefined;

  let types: CredentialType[] | null = null;
  try {
    types = await AdminAPI.credentialTypes();
  } catch {
    types = null;
  }

  // Client-side filter by source tab
  const filtered = types
    ? types.filter((t) => {
        if (!sourceFilter || sourceFilter === "all") return true;
        if (sourceFilter === "module") return getSourceTab(t.source) === "module";
        return t.source === sourceFilter;
      })
    : [];

  const counts = types
    ? {
        all: types.length,
        code: types.filter((t) => t.source === "code").length,
        admin: types.filter((t) => t.source === "admin").length,
        module: types.filter((t) => getSourceTab(t.source) === "module").length,
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Credential turlari</h1>
          <p className="text-muted-foreground text-sm">
            Barcha credential type&apos;lar ro&apos;yxati — kod ichida (registry.go) qat&apos;iy
            belgilangan, shuning uchun faqat ko&apos;rish uchun: yaratish/tahrirlash/o&apos;chirish
            bu backendda mavjud emas.
          </p>
        </div>
      </div>

      {/* Source tabs */}
      <Suspense>
        <div className="flex items-center gap-3">
          <CredentialTypesSourceTabs defaultSource={sourceFilter ?? "all"} />
          {counts && (
            <span className="text-sm text-muted-foreground">
              {sourceFilter && sourceFilter !== "all"
                ? filtered.length
                : counts.all}{" "}
              ta tur
            </span>
          )}
        </div>
      </Suspense>

      {/* Error state */}
      {types === null && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Ma&apos;lumotlarni yuklashda xatolik yuz berdi.
        </div>
      )}

      {/* Empty state */}
      {types !== null && filtered.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          {sourceFilter && sourceFilter !== "all"
            ? "Bu filtr bo'yicha tur topilmadi."
            : "Hech qanday credential turi yo'q."}
        </div>
      )}

      {/* Table */}
      {types !== null && filtered.length > 0 && (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomi</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Maydonlar</TableHead>
                <TableHead>Manba</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.key}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {t.color && (
                        <span
                          className="inline-block h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: t.color }}
                        />
                      )}
                      <span className="font-medium">{t.label}</span>
                      {t.icon && (
                        <span className="text-muted-foreground text-xs">({t.icon})</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {t.key}
                  </TableCell>
                  <TableCell>{modeBadge(t.mode)}</TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {t.fields.length > 0
                        ? `${t.fields.length} ta`
                        : <span className="text-muted-foreground text-xs">—</span>}
                    </span>
                  </TableCell>
                  <TableCell>{sourceBadge(t.source)}</TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">faqat ko&apos;rish</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
