import Link from "next/link";
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
import { ModulesFilter } from "@/features/modules/modules-filter";
import { ModuleFormDialog } from "@/features/modules/module-form-dialog";
import { DeleteModuleButton } from "@/features/modules/delete-module-button";
import { RefreshManifestButton } from "@/features/modules/refresh-manifest-button";
import { ModuleStatusBadge } from "@/features/modules/module-status-badge";
import { ToggleModuleActiveButton } from "@/features/modules/toggle-module-active-button";

function formatDate(iso: string | null): string {
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

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ModulesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const search = typeof sp.search === "string" ? sp.search : undefined;
  const active = typeof sp.active === "string" ? sp.active : undefined;

  let modules;
  try {
    modules = await AdminAPI.modules({ search, active });
  } catch {
    modules = null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Modullar</h1>
          <p className="text-muted-foreground text-sm">
            Tashqi modullar katalogi. &quot;Yangilash&quot; modul pod&apos;idan manifestni qayta oladi.
          </p>
        </div>
        <ModuleFormDialog />
      </div>

      <ModulesFilter defaultSearch={search} defaultActive={active} />

      {modules === null ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Ma&apos;lumotlarni yuklashda xatolik
        </div>
      ) : modules.length === 0 ? (
        <div className="rounded-lg border p-12 text-center text-muted-foreground">
          Modullar topilmadi.
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomi</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Node&apos;lar</TableHead>
                <TableHead>Holat</TableHead>
                <TableHead>Manifest olingan</TableHead>
                <TableHead className="w-36"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((m) => (
                <TableRow
                  key={m.id}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">
                    <Link href={`/modules/${m.slug}`} className="hover:underline">
                      {m.icon && (
                        <span className="mr-1.5">{m.icon}</span>
                      )}
                      {m.name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {m.slug}
                  </TableCell>
                  <TableCell>
                    {m.nodes?.length ? (
                      <span className="text-sm">{m.nodes.length} ta node</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 flex-wrap">
                      <ToggleModuleActiveButton slug={m.slug} active={m.active} />
                      <Badge variant={m.active ? "success" : "secondary"}>
                        {m.active ? "Faol" : "Nofaol"}
                      </Badge>
                      {m.active && <ModuleStatusBadge slug={m.slug} />}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(m.manifest_fetched_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <RefreshManifestButton slug={m.slug} />
                      <DeleteModuleButton slug={m.slug} name={m.name} />
                    </div>
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
