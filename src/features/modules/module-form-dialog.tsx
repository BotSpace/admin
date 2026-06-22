"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Textarea } from "@/shared/components/ui/textarea";
import { registerModuleYamlAction } from "./actions";

const YAML_PLACEHOLDER = `apiVersion: botmother.module/v1
module:
  id: demo
  name: Demo Module
  icon: sparkles
source:
  github: https://github.com/BotSpace/module-demo
runtime:
  dockerfile: Dockerfile
  port: 8100`;

type Props = {
  /** edit mode uchun "module.yaml dan yangilash" ko'rinishida tugma */
  isUpdate?: boolean;
};

export function ModuleFormDialog({ isUpdate = false }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"paste" | "url">("paste");
  const [yaml, setYaml] = useState("");
  const [yamlUrl, setYamlUrl] = useState("");
  const [loading, setLoading] = useState(false);

  function reset() {
    setYaml("");
    setYamlUrl("");
    setTab("paste");
  }

  async function handle() {
    const body =
      tab === "paste"
        ? { yaml: yaml.trim() }
        : { yaml_url: yamlUrl.trim() };

    if (tab === "paste" && !body.yaml) {
      toast.error("module.yaml matnini kiriting");
      return;
    }
    if (tab === "url" && !body.yaml_url) {
      toast.error("Raw YAML URL kiriting");
      return;
    }

    setLoading(true);
    const res = await registerModuleYamlAction(body);
    setLoading(false);

    if (res.ok) {
      const modeLabel =
        res.mode === "github" ? "GitHub build" : "Self-hosted";
      toast.success(
        isUpdate
          ? `Modul yangilandi (${modeLabel})`
          : `Modul qo'shildi (${modeLabel})`
      );
      setOpen(false);
      reset();
    } else {
      toast.error(res.message ?? "Xatolik yuz berdi");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isUpdate ? (
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1.5" />
            YAML dan yangilash
          </Button>
        ) : (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Modul qo&apos;shish
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="max-w-lg"
        // Paste paytida tashqi klik yopmasin
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? "YAML dan yangilash" : "Yangi modul qo'shish"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "paste" | "url")}>
          <TabsList className="w-full">
            <TabsTrigger value="paste" className="flex-1">
              YAML paste
            </TabsTrigger>
            <TabsTrigger value="url" className="flex-1">
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="paste" className="mt-4 space-y-2">
            <Label>
              module.yaml matni{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={yaml}
              onChange={(e) => setYaml(e.target.value)}
              placeholder={YAML_PLACEHOLDER}
              className="font-mono text-xs min-h-52 resize-y"
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground">
              GitHub reposi bo&apos;lsa platforma o&apos;zi build qiladi.
              Self-hosted bo&apos;lsa{" "}
              <code className="bg-muted px-1 rounded">source.endpoint</code> ko&apos;rsating.
            </p>
          </TabsContent>

          <TabsContent value="url" className="mt-4 space-y-2">
            <Label>
              Raw module.yaml URL{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={yamlUrl}
              onChange={(e) => setYamlUrl(e.target.value)}
              placeholder="https://raw.githubusercontent.com/org/repo/main/module.yaml"
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              GitHub raw URL yoki to&apos;g&apos;ridan yuklab olinadigan YAML havolasi.
            </p>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              reset();
            }}
            disabled={loading}
          >
            Bekor qilish
          </Button>
          <Button onClick={handle} disabled={loading}>
            {loading
              ? "Yuklanmoqda..."
              : isUpdate
              ? "Yangilash"
              : "Qo'shish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
