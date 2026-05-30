import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminAPI } from "@/shared/api/services";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { UserActions } from "@/features/users/user-actions";
import { format } from "date-fns";
import { ChevronLeft } from "lucide-react";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let user;
  try {
    user = await AdminAPI.user(Number(id));
  } catch {
    notFound();
  }

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "—";

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/users"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Foydalanuvchilar
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{fullName}</h1>
          <p className="text-muted-foreground text-sm">{user.phone}</p>
        </div>
        <Badge variant={user.is_active ? "success" : "destructive"}>
          {user.is_active ? "Faol" : "Bloklangan"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Ma&apos;lumotlar</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <dt className="text-muted-foreground">ID</dt>
            <dd className="font-mono">#{user.id}</dd>

            <dt className="text-muted-foreground">Telefon</dt>
            <dd>{user.phone}</dd>

            <dt className="text-muted-foreground">Email</dt>
            <dd>{user.email || "—"}</dd>

            <dt className="text-muted-foreground">Username</dt>
            <dd>{user.username || "—"}</dd>

            <dt className="text-muted-foreground">Rol</dt>
            <dd><Badge variant="secondary">{user.role || "user"}</Badge></dd>

            <dt className="text-muted-foreground">Balans</dt>
            <dd className="font-mono">{user.balance} UZS</dd>

            <dt className="text-muted-foreground">Shablon balansi</dt>
            <dd className="font-mono">{user.template_balance}</dd>

            <dt className="text-muted-foreground">Ro&apos;yxat sanasi</dt>
            <dd>{format(new Date(user.date_joined), "dd.MM.yyyy HH:mm")}</dd>

            <dt className="text-muted-foreground">Staff</dt>
            <dd>{user.is_staff ? "Ha" : "Yo'q"}</dd>

            <dt className="text-muted-foreground">Superuser</dt>
            <dd>{user.is_superuser ? "Ha" : "Yo'q"}</dd>
          </dl>
        </CardContent>
      </Card>

      <UserActions user={user} />
    </div>
  );
}
