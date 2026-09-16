import type { AdminProjectUsage, MonitoringHistorySeries } from "@/shared/api/services";

export function attributedResources(
  row: { resource_metrics_available: boolean; cpu_cores: number; memory_bytes: number; net_bytes: number },
  prometheusAvailable: boolean,
): Pick<AdminProjectUsage, "resource_metrics_available" | "cpu_cores" | "memory_bytes" | "net_bytes"> {
  const available = prometheusAvailable === true && row.resource_metrics_available === true;
  return {
    resource_metrics_available: available,
    // Monitoring list CPU is millicores; snapshots/charts in the UI use cores.
    cpu_cores: available ? row.cpu_cores / 1000 : null,
    memory_bytes: available ? row.memory_bytes : null,
    // No network availability flag: zero can mean a pool with no network samples.
    net_bytes: prometheusAvailable && row.net_bytes > 0 ? row.net_bytes : null,
  };
}

export function attributedHistory(raw: {
  prometheus_available: boolean;
  resource_metrics_available: boolean;
  series: { [K in keyof MonitoringHistorySeries]: MonitoringHistorySeries[K] | null };
}): MonitoringHistorySeries {
  const available = raw.prometheus_available && raw.resource_metrics_available;
  return {
    cpu_cores: available ? raw.series.cpu_cores ?? [] : [],
    memory_bytes: available ? raw.series.memory_bytes ?? [] : [],
    net_rx_bps: raw.prometheus_available ? raw.series.net_rx_bps ?? [] : [],
    net_tx_bps: raw.prometheus_available ? raw.series.net_tx_bps ?? [] : [],
    disk_bytes: raw.series.disk_bytes ?? [],
  };
}
