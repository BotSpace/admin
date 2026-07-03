/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { AdminAPI } from "@/shared/api/services";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { TicketReplyForm } from "@/features/tickets/ticket-reply-form";

const STATUS: Record<string, { label: string; variant: "success" | "destructive" | "warn" | "secondary" }> = {
  open: { label: "Ochiq", variant: "warn" },
  pending: { label: "Javob berilgan", variant: "secondary" },
  closed: { label: "Yopiq", variant: "secondary" },
};

const isImage = (url: string) => /\.(jpe?g|png|webp|gif)$/i.test(url);

export default async function AdminTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let ticket;
  try {
    ticket = await AdminAPI.ticket(id);
  } catch {
    notFound();
  }

  const meta = STATUS[ticket.status] ?? STATUS.open;
  const messages = ticket.messages ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href="/tickets"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Ticketlar
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{ticket.subject}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {/* Backend doesn't join requester identity onto tickets yet */}
              {ticket.user_phone ?? (ticket.user ? `#${ticket.user}` : null)}
              {ticket.user_phone || ticket.user ? " · " : ""}
              {format(new Date(ticket.created_at), "dd.MM.yyyy HH:mm")}
            </p>
          </div>
          <Badge variant={meta.variant}>{meta.label}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Xabar yo&apos;q</p>
          ) : (
            messages.map((m) => {
              const isAdmin = m.sender === "admin";
              return (
                <div key={m.id} className={cn("flex", isAdmin ? "justify-end" : "justify-start")}>
                  <div className="max-w-[80%] space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {isAdmin ? "Siz (support)" : "Foydalanuvchi"}
                    </span>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        isAdmin ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{m.message}</p>
                      {m.attachment && (
                        <a
                          href={m.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 block"
                        >
                          {isImage(m.attachment) ? (
                            <img src={m.attachment} alt="" className="max-h-40 rounded-lg" />
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs underline">
                              <Paperclip className="h-3.5 w-3.5" /> Fayl
                            </span>
                          )}
                        </a>
                      )}
                    </div>
                    <span className="block text-[10px] text-muted-foreground">{m.created_at}</span>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <TicketReplyForm id={ticket.id} />
        </CardContent>
      </Card>
    </div>
  );
}
