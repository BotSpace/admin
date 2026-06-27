import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminAPI, AdminUserDetail } from "@/shared/api/services";
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
import { UserActions } from "@/features/users/user-actions";
import { BotOrdersCard } from "@/features/bot-orders/bot-orders-card";
import { format } from "date-fns";
import { ChevronLeft } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return format(new Date(value), "dd.MM.yyyy HH:mm");
  } catch {
    return value;
  }
}

function SubscriptionStatusBadge({ status }: { status: string }) {
  const map: Record<string, "success" | "warn" | "destructive" | "secondary"> = {
    active: "success",
    expired: "destructive",
    cancelled: "destructive",
    pending: "warn",
  };
  return <Badge variant={map[status] ?? "secondary"}>{status}</Badge>;
}

function TokenProgress({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const color =
    pct >= 90 ? "bg-destructive" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{used.toLocaleString("uz-UZ")} / {total.toLocaleString("uz-UZ")} token</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let user: AdminUserDetail;
  try {
    user = await AdminAPI.user(Number(id));
  } catch {
    notFound();
  }

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "—";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/users"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Foydalanuvchilar
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{fullName}</h1>
          <p className="text-muted-foreground text-sm">{user.phone || user.email || `#${user.id}`}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Badge variant={user.is_active ? "success" : "destructive"}>
            {user.is_active ? "Faol" : "Bloklangan"}
          </Badge>
          {user.is_staff && <Badge variant="warn">Staff</Badge>}
          {user.is_superuser && <Badge variant="default">Superuser</Badge>}
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Umumiy</TabsTrigger>
          <TabsTrigger value="projects">Loyihalar ({user.projects_count})</TabsTrigger>
          <TabsTrigger value="payments">To&apos;lovlar</TabsTrigger>
          <TabsTrigger value="templates">Shablonlar</TabsTrigger>
        </TabsList>

        {/* ── Umumiy: profil + balanslar + tarif ── */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Profil</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
                <dt className="text-muted-foreground">ID</dt>
                <dd className="font-mono col-span-1">#{user.id}</dd>
                <dd className="hidden sm:block" />

                <dt className="text-muted-foreground">Telefon</dt>
                <dd className="col-span-2">{user.phone || "—"}</dd>

                <dt className="text-muted-foreground">Email</dt>
                <dd className="col-span-2">{user.email || "—"}</dd>

                <dt className="text-muted-foreground">Username</dt>
                <dd className="col-span-2">{user.username || "—"}</dd>

                <dt className="text-muted-foreground">Ism</dt>
                <dd className="col-span-2">{user.first_name || "—"}</dd>

                <dt className="text-muted-foreground">Familiya</dt>
                <dd className="col-span-2">{user.last_name || "—"}</dd>

                <dt className="text-muted-foreground">Rol</dt>
                <dd className="col-span-2">
                  <Badge variant="secondary">{user.role || "user"}</Badge>
                </dd>

                <dt className="text-muted-foreground">Holat</dt>
                <dd className="col-span-2">
                  <Badge variant={user.is_active ? "success" : "destructive"}>
                    {user.is_active ? "Faol" : "Bloklangan"}
                  </Badge>
                </dd>

                <dt className="text-muted-foreground">Ro&apos;yxatdan o&apos;tgan</dt>
                <dd className="col-span-2">{formatDate(user.date_joined)}</dd>

                <dt className="text-muted-foreground">Tasdiqlangan</dt>
                <dd className="col-span-2">{formatDate(user.validated_at)}</dd>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Balanslar</CardTitle>
              <UserActions user={user} />
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <dt className="text-muted-foreground">Asosiy balans</dt>
                <dd className="font-mono font-medium">{formatCurrency(user.balance)}</dd>

                <dt className="text-muted-foreground">Shablon balansi</dt>
                <dd className="font-mono font-medium">{user.template_balance}</dd>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Tarif &amp; Tokenlar</CardTitle>
            </CardHeader>
            <CardContent>
              {!user.subscription ? (
                <p className="text-sm text-muted-foreground">Tarif yo&apos;q</p>
              ) : (
                <div className="space-y-4">
                  <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
                    <dt className="text-muted-foreground">Tarif</dt>
                    <dd className="col-span-2 font-medium">{user.subscription.plan}</dd>

                    <dt className="text-muted-foreground">Holat</dt>
                    <dd className="col-span-2">
                      <SubscriptionStatusBadge status={user.subscription.status} />
                    </dd>

                    <dt className="text-muted-foreground">Boshlangan</dt>
                    <dd className="col-span-2">{formatDate(user.subscription.started_at)}</dd>

                    <dt className="text-muted-foreground">Tugaydi</dt>
                    <dd className="col-span-2">{formatDate(user.subscription.expires_at)}</dd>

                    <dt className="text-muted-foreground">Token yangilanadi</dt>
                    <dd className="col-span-2">{formatDate(user.subscription.token_reset_at)}</dd>

                    <dt className="text-muted-foreground">Botlar</dt>
                    <dd className="col-span-2">
                      {user.subscription.bots_count} / {user.subscription.max_bots}
                    </dd>
                  </dl>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Token sarfi (jami)
                    </p>
                    <TokenProgress
                      used={user.subscription.tokens_used_total ?? 0}
                      total={user.subscription.token_limit ?? 0}
                    />
                  </div>

                  <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">Kirish tokenlari</dt>
                    <dd className="font-mono text-xs">
                      {(user.subscription.tokens_used_input ?? 0).toLocaleString("uz-UZ")}
                    </dd>

                    <dt className="text-muted-foreground">Chiqish tokenlari</dt>
                    <dd className="font-mono text-xs">
                      {(user.subscription.tokens_used_output ?? 0).toLocaleString("uz-UZ")}
                    </dd>
                  </dl>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Loyihalar ── */}
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Loyihalar{" "}
                <span className="ml-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-normal">
                  {user.projects_count}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {user.projects.length === 0 ? (
                <p className="px-6 py-4 text-sm text-muted-foreground">Loyiha yo&apos;q</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nomi</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Shablon</TableHead>
                      <TableHead>Yaratilgan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.projects.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium text-sm">
                          <Link href={`/projects/${p.id}`} className="hover:underline">
                            {p.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {p.username || "—"}
                        </TableCell>
                        <TableCell>
                          {p.is_template ? (
                            <Badge variant="secondary">Ha</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Yo&apos;q</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(p.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── To'lovlar (botlaridagi) ── */}
        <TabsContent value="payments">
          <BotOrdersCard owner={user.id} title="Botlaridagi to'lovlar" />
        </TabsContent>

        {/* ── Shablonlar (sotib olingan + yaratgan) ── */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Sotib olingan shablonlar{" "}
                <span className="ml-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-normal">
                  {user.purchased_count}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {user.purchased_templates.length === 0 ? (
                <p className="px-6 py-4 text-sm text-muted-foreground">
                  Sotib olingan shablon yo&apos;q
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shablon nomi</TableHead>
                      <TableHead>Miqdor</TableHead>
                      <TableHead>Holat</TableHead>
                      <TableHead>To&apos;lov holati</TableHead>
                      <TableHead>Sana</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.purchased_templates.map((pt) => (
                      <TableRow key={pt.id}>
                        <TableCell className="text-sm">{pt.template_name}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {formatCurrency(Number(pt.amount))}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{pt.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              pt.payment_status === "paid"
                                ? "success"
                                : pt.payment_status === "pending"
                                ? "warn"
                                : "destructive"
                            }
                          >
                            {pt.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(pt.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Yaratgan shablonlari{" "}
                <span className="ml-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-normal">
                  {user.authored_count}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {user.authored_templates.length === 0 ? (
                <p className="px-6 py-4 text-sm text-muted-foreground">
                  Yaratgan shablon yo&apos;q
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nomi</TableHead>
                      <TableHead>Tasdiqlangan</TableHead>
                      <TableHead>Ko&apos;rishlar</TableHead>
                      <TableHead>Narxi</TableHead>
                      <TableHead>Yaratilgan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.authored_templates.map((at) => (
                      <TableRow key={at.id}>
                        <TableCell className="text-sm font-medium">{at.name}</TableCell>
                        <TableCell>
                          {at.is_verify ? (
                            <Badge variant="success">Tasdiqlangan</Badge>
                          ) : (
                            <Badge variant="warn">Kutilmoqda</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{at.views.toLocaleString("uz-UZ")}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {formatCurrency(Number(at.original_price))}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(at.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
