import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type Column<T> = {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  className?: string;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  currentPage: number;
  totalPages: number;
  buildPageHref: (page: number) => string;
  emptyMessage?: string;
  /** Agar berilsa — butun qator bosiladigan bo'ladi (detail sahifaga link). */
  rowHref?: (row: T) => string;
};

export function DataTable<T>({
  columns,
  data,
  currentPage,
  totalPages,
  buildPageHref,
  emptyMessage = "Ma'lumot yo'q",
  rowHref,
}: Props<T>) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, i) => {
                const href = rowHref?.(row);
                return (
                  <TableRow key={i} className={href ? "relative cursor-pointer hover:bg-muted/40" : undefined}>
                    {columns.map((col, ci) => (
                      <TableCell key={col.key} className={col.className}>
                        {ci === 0 && href && (
                          <Link href={href} aria-label="Ko'rish" className="absolute inset-0" />
                        )}
                        {col.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {currentPage} / {totalPages} sahifa
          </p>
          <div className="flex items-center gap-2">
            {currentPage > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildPageHref(currentPage - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                  Oldingi
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4" />
                Oldingi
              </Button>
            )}
            {currentPage < totalPages ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildPageHref(currentPage + 1)}>
                  Keyingi
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Keyingi
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
