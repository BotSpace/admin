# Admin bot analytics

Contract source: `../backend-golang/docs/bot-monitoring-analytics.md`.

- `/projects`: user count, active users (24h/7d), activity (24h), last activity;
  ascending/descending users and activity sorting via `/api/v1/admin/monitoring`.
  Activity means recorded inbound + outbound events, not last activity time.
- `/projects/[id]`: `/api/v1/admin/projects/{id}/statistics`, independent of
  resource monitoring availability.
- `/`: `/api/v1/admin/stats/bots`, top 20 by `activity_desc` or `users_desc`.
  Totals cover all non-deleted projects. User totals count bot-user memberships,
  not globally distinct people. Counts reflect retained conversation history.

## Pagination and filters

Both projects and monitoring forward `owner` (UUID, not `owner_id`), `search`,
`is_template`, `has_release`, `created_after`, and `created_before` to the backend.
Boolean filters retain explicit `true`/`false` values. Dates are sent unchanged
as `YYYY-MM-DD`; both bounds include the specified UTC calendar day. The backend
applies filters with AND before global sorting, counting, and pagination.

Every resource/users/activity-sorted page makes exactly one filtered monitoring
request. Rows, usage, total count, page size, and page count all come from that
response. The admin does not scan or reconstruct live rankings across requests.
Sort/filter changes reset the page; pagination links retain filters, including owner.

Name/date-sorted lists use the projects endpoint. Their optional usage lookup
uses the same filters and monitoring's default creation ordering, joining only
by project ID across pages as necessary. It never replaces the SQL rows or
pagination metadata. Detail snapshots also match by ID within owner/name filters.

## Availability and units

- Analytics failures show unavailable, not zero. Analytics-sort failures do not
  fall back to a misleading SQL/zero ranking. SQL lists remain usable when their
  optional monitoring lookup fails.
- CPU/RAM require both successful Prometheus queries and
  `resource_metrics_available`. Pool CPU/RSS belongs to each child process;
  never divide or duplicate shared worker usage.
- Monitoring list CPU arrives in **millicores** and is converted to cores at
  the adapter. History is already in cores.
- Pool networking has no per-bot attribution. The list has no separate network
  availability flag, so an ambiguous zero is shown as unavailable (including a
  genuinely idle legacy pod). Positive legacy values can still be displayed.
  History displays real dedicated-pod samples, including measured zeros, and
  leaves missing series empty. Network history uses **bits/second**.
- Disk history remains project-scoped and does not depend on Prometheus.
- Activity timestamps are shown in UTC.

## Validation

```sh
npm ci
npm test                 # Node >=22.6 with TypeScript stripping
npm run lint
npm run typecheck
NODE_OPTIONS=--no-experimental-webstorage npm run build
```

Run build and standalone typecheck sequentially: build regenerates `.next/types`.
The dependency-free regression suite covers backend query forwarding (including
owner, false booleans, inclusive UTC dates and offset), single-request filtered
ranking/pagination, ID joins beyond the first page, failure isolation, resource
availability, CPU units, null history series, and zero/absent formatting.

Authenticated browser smoke checks against a running backend remain necessary:
combine each sort direction with owner/search/type/release/date filters, visit page 2,
change a filter, and navigate back. Check an idle bot, an active pool bot, missing
analytics, missing CPU/RAM samples, and both dashboard ranking modes.
