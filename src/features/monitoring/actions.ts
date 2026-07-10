"use server";

import { AdminAPI, type MonitoringHistory } from "@/shared/api/services";

// Fetches a project's monitoring time-series for a range. Used by the project
// detail's Monitoring tab to swap ranges without a full page navigation.
export async function fetchMonitoringHistoryAction(
  projectId: string,
  range: string,
): Promise<MonitoringHistory | null> {
  try {
    return await AdminAPI.monitoringHistory(projectId, range);
  } catch {
    return null;
  }
}
