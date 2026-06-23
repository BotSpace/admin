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
import { registerModuleGithubAction, registerModuleYamlAction } from "./actions";

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
  const [tab, setTab] = useState<"paste" | "url" | "github">("paste");
  const [yaml, setYaml] = useState("");
  const [yamlUrl, setYamlUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  function reset() {
    setYaml("");
    setYamlUrl("");
    setRepoUrl("");
    setTab("paste");
  }

  async function handle() {
    if (tab === "paste") {
      if (!yaml.trim()) {
        toast.error("module.yaml matnini kiriting");
        return;
      }
      setLoading(true);
      const res = await registerModuleYamlAction({ yaml: yaml.trim() });
      setLoading(false);
      if (res.ok) {
        const modeLabel = res.mode === "github" ? "GitHub build" : "Self-hosted";
        toast.success(isUpdate ? `Modul yangilandi (${modeLabel})` : `Modul qo'shildi (${modeLabel})`);
        setOpen(false);
        reset();
      } else {
        toast.error(res.message ?? "Xatolik yuz berdi");
      }
      return;
    }

    if (tab === "url") {
      if (!yamlUrl.trim()) {
        toast.error("Raw YAML URL kiriting");
        return;
      }
      setLoading(true);
      const res = await registerModuleYamlAction({ yaml_url: yamlUrl.trim() });
      setLoading(false);
      if (res.ok) {
        const modeLabel = res.mode === "github" ? "GitHub build" : "Self-hosted";
        toast.success(isUpdate ? `Modul yangilandi (${modeLabel})` : `Modul qo'shildi (${modeLabel})`);
        setOpen(false);
        reset();
      } else {
        toast.error(res.message ?? "Xatolik yuz berdi");
      }
      return;
    }

    // tab === "github"
    const trimmed = repoUrl.trim();
    if (!trimmed) {
      toast.error("GitHub repo URL kiriting");
      return;
    }
    if (!trimmed.startsWith("https://github.com/")) {
      toast.error("URL https://github.com/ bilan boshlanishi kerak");
      return;
    }
    setLoading(true);
    const res = await registerModuleGithubAction({ repo_url: trimmed });
    setLoading(false);
    if (res.ok) {
      if (res.build_job) {
        toast.info("Modul build qilinmoqda...");
      }
      if (res.warning) {
        toast.warning(res.warning);
      }
      const modeLabel = res.mode === "github" ? "GitHub build" : "Self-hosted";
      toast.success(isUpdate ? `Modul yangilandi (${modeLabel})` : `Modul qo'shildi (${modeLabel})`);
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

        <Tabs value={tab} onValueChange={(v) => setTab(v as "paste" | "url" | "github")}>
          <TabsList className="w-full">
            <TabsTrigger value="paste" className="flex-1">
              YAML paste
            </TabsTrigger>
            <TabsTrigger value="url" className="flex-1">
              URL
            </TabsTrigger>
            <TabsTrigger value="github" className="flex-1">
              GitHub repo
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

          <TabsContent value="github" className="mt-4 space-y-2">
            <Label>
              Repo URL{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              Modul ma&apos;lumotlari (<code className="bg-muted px-1 rounded">module.yaml</code>) repo ichidan avtomatik o&apos;qiladi.
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
