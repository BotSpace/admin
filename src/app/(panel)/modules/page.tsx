import { AdminAPI } from "@/shared/api/services";
import { Badge } from "@/shared/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { RefreshManifestButton } from "@/features/modules/refresh-manifest-button";

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

export default async function ModulesPage() {
  let modules;
  try {
    modules = await AdminAPI.modules();
  } catch {
    modules = null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Modullar</h1>
        <p className="text-muted-foreground text-sm">
          Tashqi modullar katalogi. &quot;Yangilash&quot; modul pod&apos;idan manifestni (node, o&apos;lcham, field, docs) qayta oladi.
        </p>
      </div>

      {modules === null ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Ma&apos;lumotlarni yuklashda xatolik
        </div>
      ) : modules.length === 0 ? (
        <div className="rounded-lg border p-12 text-center text-muted-foreground">
          Modullar mavjud emas.
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
                <TableHead className="w-32"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{m.slug}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {m.nodes?.length ? (
                        m.nodes.map((n) => (
                          <Badge key={n.type} variant={n.trigger ? "default" : "secondary"} className="font-mono text-[10px]">
                            {n.title}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={m.active ? "success" : "secondary"}>
                      {m.active ? "Faol" : "Nofaol"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(m.manifest_fetched_at)}
                  </TableCell>
                  <TableCell>
                    <RefreshManifestButton slug={m.slug} />
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
