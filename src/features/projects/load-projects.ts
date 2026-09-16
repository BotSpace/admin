import type { AdminAPI, AdminProjectUsage } from "@/shared/api/services";
import type { ProjectListFilters } from "@/shared/api/project-list-query";

type API = Pick<typeof AdminAPI, "projects" | "monitoring">;
export type ProjectFilters = ProjectListFilters & {
  ordering?: string;
  page?: string;
};

export function isMonitoringOrdering(ordering?: string): boolean {
  return /^(cpu|ram|disk|net|users|activity)_(asc|desc)$/.test(ordering ?? "");
}

export function pageNumber(value?: string): number {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

// SQL name/date ordering differs from monitoring's default creation ordering.
// Only enrich requested IDs; this lookup must never determine list rows or totals.
export async function loadUsage(api: API, ids: string[], filters: ProjectListFilters = {}) {
  const missing = new Set(ids);
  const usage = new Map<string, AdminProjectUsage>();
  for (let page = 1; missing.size; page++) {
    const result = await api.monitoring({ ...filters, page, page_size: 100 });
    for (const row of result.results) {
      if (missing.delete(row.id)) usage.set(row.id, row);
    }
    if (page >= result.total_pages || !result.results.length) break;
  }
  return usage;
}

export async function loadProjects(api: API, filters: ProjectFilters) {
  const page = pageNumber(filters.page);
  if (isMonitoringOrdering(filters.ordering)) {
    // Rows, ranking, total and pagination must come from the same backend response.
    const result = await api.monitoring({ ...filters, page });
    return { ...result, usage: new Map(result.results.map((row) => [row.id, row])) };
  }

  const { ordering, page: requestedPage, ...usageFilters } = filters;
  const result = await api.projects({ ...usageFilters, ordering, page: pageNumber(requestedPage) });
  const usage = await loadUsage(api, result.results.map((row) => row.id), usageFilters)
    .catch(() => new Map<string, AdminProjectUsage>());
  return { ...result, usage };
}
