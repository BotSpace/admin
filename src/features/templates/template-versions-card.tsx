import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { type TemplateVersion } from "@/shared/api/services";
import { RollbackTemplateDialog } from "./rollback-template-dialog";
import { VersionPreviewDialog } from "./version-preview-dialog";

function formatDate(value: string): string {
  try {
    return format(new Date(value), "dd.MM.yyyy HH:mm");
  } catch {
    return value;
  }
}

export function TemplateVersionsCard({
  templateId,
  currentVersion,
  versions,
}: {
  templateId: string;
  currentVersion?: number;
  versions: TemplateVersion[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold">Versiyalar</CardTitle>
        {currentVersion !== undefined && (
          <Badge variant="secondary">Joriy: v{currentVersion}</Badge>
        )}
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Versiyalar tarixi mavjud emas</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Versiya</TableHead>
                  <TableHead>Izoh</TableHead>
                  <TableHead>Muallif</TableHead>
                  <TableHead>Sana</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((v) => (
                  <TableRow key={v.version}>
                    <TableCell className="font-mono font-medium">
                      <div className="flex items-center gap-2">
                        v{v.version}
                        {v.is_current && (
                          <Badge variant="success" className="text-xs">
                            Joriy
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {v.note || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {v.created_by_phone || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(v.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <VersionPreviewDialog templateId={templateId} version={v.version} />
                        {!v.is_current && (
                          <RollbackTemplateDialog templateId={templateId} version={v.version} />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
