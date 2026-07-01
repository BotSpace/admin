import { type TemplateSpec } from "@/shared/api/services";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export function SpecSection({ spec }: { spec: TemplateSpec }) {
  const credentials = spec.credentials ?? [];
  const modules = spec.modules ?? [];
  const envs = spec.envs ?? [];
  const collections = spec.collections ?? [];

  const hasContent =
    credentials.length > 0 ||
    modules.length > 0 ||
    envs.length > 0 ||
    collections.length > 0;

  if (!hasContent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Shablon tarkibi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Tarkib mavjud emas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Shablon tarkibi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {credentials.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Kredensialar ({credentials.length})
            </p>
            <div className="divide-y rounded-md border text-sm">
              {credentials.map((c) => (
                <div key={c.key} className="flex items-start gap-3 px-3 py-2">
                  <code className="font-mono font-medium shrink-0">{c.key}</code>
                  <span className="text-muted-foreground text-xs bg-muted px-1.5 py-0.5 rounded font-mono shrink-0">
                    {c.type}
                  </span>
                  <Badge
                    variant={c.required ? "destructive" : "secondary"}
                    className="text-xs shrink-0"
                  >
                    {c.required ? "Majburiy" : "Ixtiyoriy"}
                  </Badge>
                  {c.description && (
                    <span className="text-muted-foreground text-xs ml-auto text-right">
                      {c.description}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {modules.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Modullar ({modules.length})
            </p>
            <div className="divide-y rounded-md border text-sm">
              {modules.map((m) => (
                <div key={m.slug} className="flex items-center gap-3 px-3 py-2">
                  <code className="font-mono font-medium">{m.slug}</code>
                  <Badge
                    variant={m.required ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {m.required ? "Majburiy" : "Ixtiyoriy"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {envs.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Muhit o&apos;zgaruvchilari ({envs.length})
            </p>
            <div className="divide-y rounded-md border text-sm">
              {envs.map((e) => (
                <div key={e.key} className="flex items-start gap-3 px-3 py-2">
                  <code className="font-mono font-medium shrink-0">{e.key}</code>
                  <Badge
                    variant={e.required ? "destructive" : "secondary"}
                    className="text-xs shrink-0"
                  >
                    {e.required ? "Majburiy" : "Ixtiyoriy"}
                  </Badge>
                  {e.description && (
                    <span className="text-muted-foreground text-xs ml-auto text-right">
                      {e.description}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {collections.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Kolleksiyalar ({collections.length})
            </p>
            <div className="divide-y rounded-md border text-sm">
              {collections.map((col) => (
                <div key={col.name} className="flex items-center gap-3 px-3 py-2">
                  <code className="font-mono font-medium">{col.name}</code>
                  {col.label && col.label !== col.name && (
                    <span className="text-muted-foreground">{col.label}</span>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                    {col.fields.length} maydon · {col.data.length} yozuv
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
