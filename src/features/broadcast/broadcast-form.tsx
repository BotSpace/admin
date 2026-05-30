"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Send, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { type AdminProject, type BroadcastMessage } from "@/shared/api/services";
import { sendBroadcastAction, listBroadcastsAction } from "./actions";

type Props = {
  projects: AdminProject[];
};

function statusBadge(status: string) {
  if (status === "done" || status === "completed")
    return <Badge variant="success">{status}</Badge>;
  if (status === "failed" || status === "error")
    return <Badge variant="destructive">{status}</Badge>;
  if (status === "pending" || status === "sending")
    return <Badge variant="warn">{status}</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export function BroadcastForm({ projects }: Props) {
  const [projectId, setProjectId] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [sending, startSend] = useTransition();
  const [loadingList, startList] = useTransition();
  const [messages, setMessages] = useState<BroadcastMessage[]>([]);
  const [listLoaded, setListLoaded] = useState(false);

  function handleSend() {
    if (!projectId) {
      toast.error("Loyihani tanlang");
      return;
    }
    if (!caption.trim()) {
      toast.error("Xabar matnini kiriting");
      return;
    }

    startSend(async () => {
      const res = await sendBroadcastAction(Number(projectId), caption.trim());
      if (res.ok) {
        toast.success("Broadcast yuborildi", {
          description: `Jami: ${res.data.total} ta foydalanuvchi`,
        });
        setCaption("");
        // refresh list
        startList(async () => {
          const lr = await listBroadcastsAction(Number(projectId));
          if (lr.ok) setMessages(lr.data);
        });
      } else {
        toast.error(res.message);
      }
    });
  }

  function handleLoadList() {
    if (!projectId) {
      toast.error("Loyihani tanlang");
      return;
    }
    startList(async () => {
      const res = await listBroadcastsAction(Number(projectId));
      if (res.ok) {
        setMessages(res.data);
        setListLoaded(true);
      } else {
        toast.error(res.message);
      }
    });
  }

  function handleProjectChange(val: string) {
    setProjectId(val);
    setMessages([]);
    setListLoaded(false);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Send form */}
      <Card>
        <CardHeader>
          <CardTitle>Broadcast xabar yuborish</CardTitle>
          <CardDescription>
            Tanlangan loyiha foydalanuvchilariga Telegram xabar yuborish
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Loyiha (bot)</Label>
            <Select value={projectId} onValueChange={handleProjectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Loyihani tanlang..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    <span className="font-medium">{p.name}</span>
                    {p.username && (
                      <span className="ml-2 text-muted-foreground text-xs">
                        @{p.username}
                      </span>
                    )}
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      #{p.id}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Xabar matni (caption)</Label>
            <Textarea
              placeholder="Xabar matnini kiriting..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              HTML teglari ishlaydi: &lt;b&gt;, &lt;i&gt;, &lt;a&gt;
            </p>
          </div>

          <Button onClick={handleSend} disabled={sending} className="w-full sm:w-auto">
            <Send className="h-4 w-4" />
            {sending ? "Yuborilmoqda..." : "Yuborish"}
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-base">Broadcast tarixi</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Tanlangan loyiha bo&apos;yicha oxirgi broadcast&apos;lar
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadList}
            disabled={loadingList || !projectId}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingList ? "animate-spin" : ""}`} />
            Yangilash
          </Button>
        </CardHeader>
        <CardContent>
          {!listLoaded && !loadingList ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Tarixni ko&apos;rish uchun loyiha tanlang va &quot;Yangilash&quot; tugmasini bosing
            </p>
          ) : loadingList ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Yuklanmoqda...
            </p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Bu loyiha uchun broadcast&apos;lar topilmadi
            </p>
          ) : (
            <div className="divide-y">
              {messages.map((msg) => (
                <div key={msg.id} className="py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono text-muted-foreground mb-1">
                      #{msg.id}
                    </p>
                    <p className="text-sm line-clamp-2 break-words">{msg.caption}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    {statusBadge(msg.status)}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="text-emerald-600">
                        {msg.done}/{msg.total}
                      </span>
                      {msg.fail > 0 && (
                        <span className="text-destructive">{msg.fail} xato</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
