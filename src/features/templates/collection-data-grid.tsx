"use client";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import type { TemplateSpecCollection } from "@/shared/api/services";

/**
 * Editable seed-data grid for one collection. Columns come from the collection's
 * (read-only) fields; rows are the default documents that will be inserted into
 * bots created from this template.
 */
export function CollectionDataGrid({
  collection,
  onChange,
}: {
  collection: TemplateSpecCollection;
  onChange: (data: Record<string, unknown>[]) => void;
}) {
  const cols = collection.fields.map((f) => f.name);
  const data = collection.data ?? [];

  function setCell(rowIdx: number, key: string, value: string) {
    onChange(data.map((row, i) => (i === rowIdx ? { ...row, [key]: value } : row)));
  }
  function addRow() {
    onChange([...data, Object.fromEntries(cols.map((c) => [c, ""]))]);
  }
  function removeRow(rowIdx: number) {
    onChange(data.filter((_, i) => i !== rowIdx));
  }

  return (
    <div className="rounded-md border">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{collection.label || collection.name}</span>
          <Badge variant="secondary" className="text-xs">
            {data.length} qator
          </Badge>
        </div>
        <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={addRow}>
          <Plus className="h-3 w-3" />
          Qator qo&apos;shish
        </Button>
      </div>

      {cols.length === 0 ? (
        <p className="px-3 py-3 text-xs text-muted-foreground">
          Bu kolleksiyada maydonlar yo&apos;q.
        </p>
      ) : data.length === 0 ? (
        <p className="px-3 py-3 text-xs text-muted-foreground">
          Ma&apos;lumot yo&apos;q. &quot;Qator qo&apos;shish&quot; bilan default qator kiriting.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                {collection.fields.map((f) => (
                  <th key={f.name} className="px-2 py-1.5 text-left font-medium">
                    {f.label || f.name}
                    {f.required && <span className="ml-0.5 text-destructive">*</span>}
                  </th>
                ))}
                <th className="w-10 px-2 py-1.5" />
              </tr>
            </thead>
            <tbody>
              {data.map((row, ri) => (
                <tr key={ri} className="border-b last:border-0">
                  {cols.map((c) => (
                    <td key={c} className="px-1.5 py-1">
                      <Input
                        value={row[c] == null ? "" : String(row[c])}
                        onChange={(e) => setCell(ri, c, e.target.value)}
                        className="h-8 text-xs"
                      />
                    </td>
                  ))}
                  <td className="px-1.5 py-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeRow(ri)}
                      title="Qatorni o'chirish"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
