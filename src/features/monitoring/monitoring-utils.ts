/**
 * Humanize helperlari — monitoring uchun.
 */

export function formatCount(value: number | null | undefined): string {
  return value == null ? "—" : new Intl.NumberFormat("en-US").format(value);
}

export function formatActivity(value: string | null | undefined): string {
  if (!value) return "Faollik yo'q";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toISOString().slice(0, 16).replace("T", " ");
}

/** Baytlarni odam o'qiy oladigan formatga (B / KB / MB / GB / TB). */
export function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return "—";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const idx = Math.min(i, units.length - 1);
  const value = bytes / Math.pow(1024, idx);
  return `${value < 10 ? value.toFixed(2) : value < 100 ? value.toFixed(1) : Math.round(value)} ${units[idx]}`;
}

/**
 * vCPU ulushini odam o'qiy oladigan formatga.
 * 1.0 → "1.00 vCPU"
 * 0.5 → "500m"
 * 0.001 → "1m"
 */
export function formatCpu(cores: number | null | undefined): string {
  if (cores === null || cores === undefined) return "—";
  if (cores >= 1) return `${cores.toFixed(2)} vCPU`;
  const millicores = Math.round(cores * 1000);
  return `${millicores}m`;
}

/** Bit per second → odam o'qiy oladigan format. */
export function formatBps(bps: number | null | undefined): string {
  if (bps === null || bps === undefined) return "—";
  if (bps === 0) return "0 bps";
  const units = ["bps", "Kbps", "Mbps", "Gbps"];
  const i = Math.floor(Math.log(bps) / Math.log(1000));
  const idx = Math.min(i, units.length - 1);
  const value = bps / Math.pow(1000, idx);
  return `${value < 10 ? value.toFixed(2) : value < 100 ? value.toFixed(1) : Math.round(value)} ${units[idx]}`;
}

/** Unix timestamp (sekundlarda) → vaqt stringi (HH:mm yoki dd/MM HH:mm). */
export function formatTimestamp(ts: number, showDate = false): string {
  const d = new Date(ts * 1000);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  if (!showDate) return `${hh}:${mm}`;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month} ${hh}:${mm}`;
}
