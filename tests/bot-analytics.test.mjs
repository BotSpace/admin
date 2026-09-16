import assert from "node:assert/strict";
import test from "node:test";
import { loadProjects, loadUsage, isMonitoringOrdering, pageNumber } from "../src/features/projects/load-projects.ts";
import { attributedResources, attributedHistory } from "../src/shared/api/monitoring-contract.ts";
import { formatCount, formatActivity, formatCpu } from "../src/features/monitoring/monitoring-utils.ts";
import { projectListQuery } from "../src/shared/api/project-list-query.ts";

function page(results, current = 1, pages = 1, size = 2, total = results.length) {
  return { results, current_page: current, total_pages: pages, page_size: size, total_items: total };
}
function bot(id) {
  return { id, name: id, analytics_available: true, users_total: 0, messages_24h: 0 };
}

test("recognizes all monitoring sorts and sanitizes invalid pagination", () => {
  for (const field of ["users", "activity", "cpu", "ram", "disk", "net"]) {
    for (const dir of ["asc", "desc"]) assert.equal(isMonitoringOrdering(`${field}_${dir}`), true);
  }
  for (const sort of [undefined, "name", "created_at", "activity", "users_invalid"]) assert.equal(isMonitoringOrdering(sort), false);
  for (const value of [undefined, "0", "-1", "NaN", "Infinity", "1.5", "9007199254740992"]) assert.equal(pageNumber(value), 1);
  assert.equal(pageNumber("3"), 3);
});

test("unfiltered analytics sorts delegate global ordering and pagination directly", async () => {
  for (const ordering of ["users_desc", "users_asc", "activity_desc", "activity_asc"]) {
    const result = await loadProjects({
      projects: async () => assert.fail("must not use the SQL page"),
      monitoring: async (params) => {
        assert.deepEqual(params, { search: "hello", ordering, page: 3 });
        return page([bot("rank5"), bot("rank6")], 3, 4, 2, 8);
      },
    }, { search: "hello", ordering, page: "3" });
    assert.equal(result.current_page, 3);
    assert.equal(result.total_items, 8);
    assert.deepEqual(result.results.map((r) => r.id), ["rank5", "rank6"]);
  }
});

const allFilters = {
  owner: "ddfa961e-cfe7-4d0a-812f-b57a9f673b2d",
  search: "bot",
  is_template: "false",
  has_release: "false",
  created_after: "2026-09-15",
  created_before: "2026-09-15",
};

test("shared backend query forwards every filter unchanged, owner not owner_id, and limit/offset", () => {
  for (const value of ["false", "true"]) {
    const filters = { ...allFilters, is_template: value, has_release: value };
    const query = projectListQuery({ ...filters, ordering: "users_asc", page: 3, page_size: 25 }, 20);
    assert.deepEqual(query, { ...filters, ordering: "users_asc", limit: 25, offset: 50 });
    assert.equal("owner_id" in query, false);
    assert.equal("page" in query, false);
    assert.equal("page_size" in query, false);
  }
  assert.equal(projectListQuery(undefined, 20).limit, 20);
  assert.equal(projectListQuery(undefined, 20).offset, 0);
  assert.equal(projectListQuery({ page: -1 }, 20).offset, 0);
});

test("all filtered resource and analytics sorts use one backend page and preserve its metadata", async () => {
  for (const field of ["cpu", "ram", "disk", "net", "users", "activity"]) {
    for (const direction of ["asc", "desc"]) {
      const ordering = `${field}_${direction}`;
      let calls = 0;
      const response = {
        ...page([bot("rank4"), bot("rank3")], 2, 9, 2, 17),
        analytics_available: true,
        prometheus_available: false,
      };
      const result = await loadProjects({
        projects: async () => assert.fail("rankings must not query SQL or intersect IDs"),
        monitoring: async (params) => {
          assert.equal(++calls, 1, "a second live ranking read could have moved");
          assert.deepEqual(params, { ...allFilters, ordering, page: 2 });
          assert.deepEqual(projectListQuery(params, 2), { ...allFilters, ordering, limit: 2, offset: 2 });
          return response;
        },
      }, { ...allFilters, ordering, page: "2" });
      assert.equal(calls, 1);
      const { usage, ...actual } = result;
      assert.deepEqual(actual, response);
      assert.strictEqual(result.results, response.results);
      assert.deepEqual([...usage.keys()], ["rank4", "rank3"]);
      for (const row of response.results) assert.strictEqual(usage.get(row.id), row);
    }
  }
});

test("filtered empty or out-of-range pages retain backend totals without extra requests", async () => {
  for (const response of [page([], 1, 1, 20, 0), page([], 99, 3, 20, 45)]) {
    let calls = 0;
    const result = await loadProjects({
      projects: async () => assert.fail("must not query SQL"),
      monitoring: async () => { calls++; return response; },
    }, { ...allFilters, ordering: "users_desc", page: String(response.current_page) });
    const { usage, ...actual } = result;
    assert.deepEqual(actual, response);
    assert.equal(usage.size, 0);
    assert.equal(calls, 1);
  }
});

test("SQL-sorted usage lookup forwards all filters, omits SQL ordering, and merges only by ID", async () => {
  for (const ordering of [undefined, "name", "created_at", "-created_at"]) {
    let calls = 0;
    const response = page([bot("z"), bot("a"), bot("deleted")], 2, 3, 3, 9);
    const result = await loadProjects({
      projects: async (params) => {
        assert.deepEqual(params, { ...allFilters, ordering, page: 2 });
        return response;
      },
      monitoring: async (params) => {
        calls++;
        assert.deepEqual(params, { ...allFilters, page: calls, page_size: 100 });
        assert.equal("ordering" in params, false);
        const rows = (params.page === 1 ? ["a", "b"] : ["c", "z"]).map((id) => ({ ...bot(id), users_total: id === "z" ? 42 : 7 }));
        return page(rows, params.page, 2, 100, 4);
      },
    }, { ...allFilters, ordering, page: "2" });
    const { usage, ...actual } = result;
    assert.deepEqual(actual, response);
    assert.deepEqual(result.results.map((r) => r.id), ["z", "a", "deleted"]);
    assert.equal(usage.get("z").users_total, 42);
    assert.equal(usage.get("a").users_total, 7);
    assert.equal(usage.has("deleted"), false);
    assert.equal(usage.size, 2);
    assert.equal(calls, 2);
  }
});

test("detail usage finds an ID beyond the first page of duplicate names", async () => {
  const usage = await loadUsage({
    monitoring: async (params) => {
      assert.equal(params.search, "duplicate");
      return page([bot(params.page === 1 ? "other" : "target")], params.page, 2);
    },
  }, ["target"], { search: "duplicate" });
  assert.equal(usage.get("target").id, "target");
});

test("analytics ranking failures surface, but optional metrics do not hide SQL projects", async () => {
  const api = {
    projects: async () => page([bot("a")]),
    monitoring: async () => { throw new Error("analytics unavailable"); },
  };
  await assert.rejects(loadProjects(api, { ordering: "activity_desc" }), /analytics unavailable/);
  await assert.rejects(loadProjects(api, { ordering: "users_desc", has_release: "true" }), /analytics unavailable/);
  const result = await loadProjects(api, {});
  assert.equal(result.results.length, 1);
  assert.equal(result.usage.size, 0);
});

test("unavailable CPU/RAM never become fake zeros; pool CPU uses millicores", () => {
  const row = { resource_metrics_available: false, cpu_cores: 0, memory_bytes: 0, net_bytes: 0 };
  assert.deepEqual(attributedResources(row, true), { resource_metrics_available: false, cpu_cores: null, memory_bytes: null, net_bytes: null });
  const measured = { ...row, resource_metrics_available: true, cpu_cores: 125, memory_bytes: 4096 };
  const normalized = attributedResources(measured, true);
  assert.equal(normalized.cpu_cores, 0.125);
  assert.equal(formatCpu(normalized.cpu_cores), "125m");
  assert.equal(normalized.memory_bytes, 4096);
  assert.equal(normalized.net_bytes, null);
  assert.equal(attributedResources(measured, false).cpu_cores, null);
  assert.equal(attributedResources({ ...measured, cpu_cores: 0 }, true).cpu_cores, 0);
  assert.equal(attributedResources({ ...measured, net_bytes: 200 }, true).net_bytes, 200);
});

test("history gates attributed resources, retains disk, and accepts null Go slices", () => {
  const series = { cpu_cores: [[1, 0.125]], memory_bytes: [[1, 4096]], net_rx_bps: null, net_tx_bps: null, disk_bytes: [[1, 512]] };
  const unavailable = attributedHistory({ prometheus_available: true, resource_metrics_available: false, series });
  assert.deepEqual(unavailable.cpu_cores, []);
  assert.deepEqual(unavailable.memory_bytes, []);
  assert.deepEqual(unavailable.disk_bytes, [[1, 512]]);
  assert.deepEqual(unavailable.net_rx_bps, []);
  const available = attributedHistory({ prometheus_available: true, resource_metrics_available: true, series });
  assert.deepEqual(available.cpu_cores, [[1, 0.125]]);
  const legacy = attributedHistory({ prometheus_available: true, resource_metrics_available: true, series: { ...series, net_rx_bps: [[1, 0]] } });
  assert.deepEqual(legacy.net_rx_bps, [[1, 0]]);
  assert.deepEqual(attributedHistory({ prometheus_available: false, resource_metrics_available: true, series }).cpu_cores, []);
});

test("formatters distinguish missing statistics, measured zero, and no activity", () => {
  assert.equal(formatCount(undefined), "—");
  assert.equal(formatCount(0), "0");
  assert.equal(formatCount(1234), "1,234");
  assert.equal(formatActivity(null), "Faollik yo'q");
  assert.equal(formatActivity("2026-09-15T12:30:00+02:00"), "2026-09-15 10:30");
});
