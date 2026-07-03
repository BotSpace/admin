import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminAPI, AdminProjectDetail } from "@/shared/api/services";
import { Badge } from "@/shared/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import { DeleteProjectButton } from "@/features/projects/delete-project-button";
import { BotOrdersCard } from "@/features/bot-orders/bot-orders-card";
import { format } from "date-fns";
import { ChevronLeft, Database } from "lucide-react";

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return format(new Date(value), "dd.MM.yyyy HH:mm");
  } catch {
    return value;
  }
}

function ReleaseStatusBadge({ status }: { status: string }) {
  const map: Record<string, "success" | "warn" | "destructive" | "secondary"> = {
    active: "success",
    running: "success",
    stopped: "destructive",
    error: "destructive",
    pending: "warn",
    building: "warn",
  };
  return <Badge variant={map[status] ?? "secondary"}>{status}</Badge>;
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let project: AdminProjectDetail;
  try {
    project = await AdminAPI.project(id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/projects"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Loyihalar
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground text-sm font-mono">
            {project.username ? `@${project.username}` : `#${project.id}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Badge variant={project.is_template ? "secondary" : "outline"}>
            {project.is_template ? "Shablon" : "Oddiy"}
          </Badge>
          <Button asChild variant="outline" size="sm">
            <Link href={`/projects/${project.id}/cms`} className="gap-2">
              <Database className="h-4 w-4" />
              Collection&apos;lar
            </Link>
          </Button>
          <DeleteProjectButton id={project.id} name={project.name} />
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Umumiy</TabsTrigger>
          <TabsTrigger value="releases">Relizlar ({project.releases_count})</TabsTrigger>
          <TabsTrigger value="payments">To&apos;lovlar</TabsTrigger>
        </TabsList>

        {/* ── Umumiy: asosiy + texnik ── */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Asosiy ma&apos;lumotlar</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
                <dt className="text-muted-foreground">ID</dt>
                <dd className="font-mono col-span-2">#{project.id}</dd>

                <dt className="text-muted-foreground">Nomi</dt>
                <dd className="col-span-2 font-medium">{project.name}</dd>

                <dt className="text-muted-foreground">Username</dt>
                <dd className="col-span-2">{project.username ? `@${project.username}` : "—"}</dd>

                <dt className="text-muted-foreground">Tavsif</dt>
                <dd className="col-span-2">{project.description || "—"}</dd>

                <dt className="text-muted-foreground">Turi</dt>
                <dd className="col-span-2">
                  <Badge variant={project.is_template ? "secondary" : "outline"}>
                    {project.is_template ? "Shablon" : "Oddiy"}
                  </Badge>
                </dd>

                <dt className="text-muted-foreground">Egasi (telefon)</dt>
                <dd className="col-span-2">
                  <Link href={`/users/${project.owner.id}`} className="text-primary hover:underline">
                    {project.owner.phone || project.owner.email || `#${project.owner.id}`}
                  </Link>
                </dd>

                <dt className="text-muted-foreground">Egasi (email)</dt>
                <dd className="col-span-2">{project.owner.email || "—"}</dd>

                <dt className="text-muted-foreground">Yaratilgan</dt>
                <dd className="col-span-2">{formatDate(project.created_at)}</dd>

                <dt className="text-muted-foreground">Yangilangan</dt>
                <dd className="col-span-2">{formatDate(project.updated_at)}</dd>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Texnik ma&apos;lumotlar</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
                <dt className="text-muted-foreground">Release webhook</dt>
                <dd className="col-span-2 font-mono text-xs break-all">
                  {project.release_webhook_uuid || "—"}
                </dd>

                <dt className="text-muted-foreground">Debug webhook</dt>
                <dd className="col-span-2 font-mono text-xs break-all">
                  {project.debug_webhook_uuid || "—"}
                </dd>

                <dt className="text-muted-foreground">Mongo ma&apos;lumotlar ombori</dt>
                <dd className="col-span-2 font-mono text-xs break-all">
                  {project.mongo_database || "—"}
                </dd>

                <dt className="text-muted-foreground">Joriy node soni</dt>
                <dd className="col-span-2 font-medium">{project.current_node_count ?? "—"}</dd>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Relizlar ── */}
        <TabsContent value="releases">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Relizlar{" "}
                <span className="ml-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-normal">
                  {project.releases_count}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {project.releases.length === 0 ? (
                <p className="px-6 py-4 text-sm text-muted-foreground">Reliz yo&apos;q</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Versiya</TableHead>
                      <TableHead>Holat</TableHead>
                      <TableHead>Service ID</TableHead>
                      <TableHead>Node soni</TableHead>
                      <TableHead>Sana</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.releases.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-sm font-medium">{r.version}</TableCell>
                        <TableCell>
                          <ReleaseStatusBadge status={r.status} />
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {r.service_id || "—"}
                        </TableCell>
                        <TableCell className="text-sm">{r.node_count ?? "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(r.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── To'lovlar (botdan tushgan) ── */}
        <TabsContent value="payments">
          <BotOrdersCard project={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
