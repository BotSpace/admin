import "server-only";
import { api } from "./server";

// ── CMS types (ported from dashboard) ───────────────────────────────────────

export type CmsFieldKind =
  | "text"
  | "longtext"
  | "int"
  | "float"
  | "bool"
  | "datetime"
  | "date"
  | "email"
  | "url"
  | "phone"
  | "enum"
  | "json"
  | "array"
  | "relation"
  | "file"
  | "image"
  | "audio"
  | "video"
  | "geo";

export type CmsIndexKind =
  | "none"
  | "asc"
  | "desc"
  | "text"
  | "hashed"
  | "unique"
  | "ttl";

export type CmsCascadeMode = "cascade" | "restrict" | "set_null";

export type CmsField = {
  id?: number;
  name: string;
  label?: string;
  kind: CmsFieldKind;
  required: boolean;
  default?: unknown;
  validators?: Record<string, unknown>;
  relation_collection?: number | null;
  cascade?: CmsCascadeMode;
  index: CmsIndexKind;
  order?: number;
};

export type CmsCollection = {
  id: number;
  project: number;
  name: string;
  label?: string;
  description?: string;
  primary_field?: string;
  system: boolean;
  schema_version: number;
  fields_count?: number;
  fields?: CmsField[];
  can_delete?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CmsDocument = Record<string, unknown> & {
  _id?: string;
  _created_at?: string;
  _updated_at?: string;
  _version?: number;
  _deleted_at?: string | null;
  // Server-resolved relation labels, keyed by field name (string or list of strings).
  _rel?: Record<string, string | string[]>;
};

export type CmsDocumentListResponse = {
  results: CmsDocument[];
  total: number;
  limit: number;
  skip: number;
};

// Cursor-paginated page (relation picker infinite-scroll). next_cursor is the
// last _id of a full page, or null when there are no more documents.
export type CmsDocumentCursorResponse = {
  results: CmsDocument[];
  limit: number;
  next_cursor: string | null;
};

export type CmsAuditEntry = {
  id: number;
  action: string;
  actor_id: number | null;
  document_id: string;
  before: CmsDocument | null;
  after: CmsDocument | null;
  meta: Record<string, unknown>;
  created_at: string;
};

// ── Envelope helpers (CMS endpoints may return raw or { data } envelopes) ───

function unwrapList<T>(d: unknown): T[] {
  if (Array.isArray(d)) return d as T[];
  if (!d || typeof d !== "object") return [];
  const e = d as { data?: { results?: T[] } | T[]; results?: T[] };
  if (Array.isArray((e.data as { results?: T[] })?.results)) {
    return (e.data as { results: T[] }).results;
  }
  if (Array.isArray(e.data)) return e.data as T[];
  if (Array.isArray(e.results)) return e.results;
  return [];
}

function unwrapItem<T>(d: unknown): T {
  if (!d || typeof d !== "object") return d as T;
  const e = d as { data?: T };
  if (
    e.data !== undefined &&
    (typeof e.data === "object" || typeof e.data === "number" || typeof e.data === "string")
  ) {
    return e.data as T;
  }
  return d as T;
}

// ── URL helper ──────────────────────────────────────────────────────────────

function cms(projectId: string | number, ...parts: (string | number)[]): string {
  const tail = parts.map((p) => encodeURIComponent(p)).join("/");
  // Path MUST start with "/api/v1" — applyApiPrefix (client.ts) only rewrites
  // that segment to NEXT_PUBLIC_API_PREFIX (prod "/api/v2" -> gateway -> Go
  // "/api/v1"). "/api/cms/..." bypassed the rewrite and 404'd in every env.
  return `/api/v1/cms/projects/${projectId}/collections${tail ? "/" + tail : ""}`;
}

// Admin (read-only) CMS base. The owner-scoped /cms endpoints above only return
// the caller's own projects; these /admin/cms endpoints (admin/superuser role,
// backend cms/routes.go) resolve the project's real owner, so an admin can
// browse ANY user's collections and documents. Reads only — writes stay on cms().
function adminCms(projectId: string | number, ...parts: (string | number)[]): string {
  const tail = parts.map((p) => encodeURIComponent(p)).join("/");
  return `/api/v1/admin/cms/projects/${projectId}/collections${tail ? "/" + tail : ""}`;
}

// ── CmsAPI (mirrors dashboard CmsAPI, uses the admin's authed `api`) ─────────

export const CmsAPI = {
  listCollections: async (projectId: string | number): Promise<CmsCollection[]> => {
    const d = await api<unknown>(adminCms(projectId) + "/");
    return Array.isArray(d) ? (d as CmsCollection[]) : unwrapList<CmsCollection>(d);
  },
  getCollection: (projectId: string | number, name: string): Promise<CmsCollection> =>
    api<CmsCollection>(adminCms(projectId, name) + "/").then(unwrapItem<CmsCollection>),
  createCollection: (
    projectId: string | number,
    body: {
      name: string;
      label?: string;
      description?: string;
      primary_field?: string;
      fields?: CmsField[];
    }
  ): Promise<CmsCollection> =>
    api<CmsCollection>(cms(projectId) + "/", { method: "POST", json: body }).then(
      unwrapItem<CmsCollection>
    ),
  updateCollection: (
    projectId: string | number,
    name: string,
    patch: { label?: string; description?: string; primary_field?: string }
  ): Promise<CmsCollection> =>
    api<CmsCollection>(cms(projectId, name) + "/", { method: "PATCH", json: patch }).then(
      unwrapItem<CmsCollection>
    ),
  deleteCollection: (projectId: string | number, name: string): Promise<void> =>
    api<void>(cms(projectId, name) + "/", { method: "DELETE" }),

  addField: (projectId: string | number, name: string, field: CmsField): Promise<CmsField> =>
    api<CmsField>(cms(projectId, name, "fields") + "/", { method: "POST", json: field }).then(
      unwrapItem<CmsField>
    ),
  updateField: (
    projectId: string | number,
    name: string,
    fieldName: string,
    patch: Partial<CmsField>
  ): Promise<CmsField> =>
    api<CmsField>(cms(projectId, name, "fields", fieldName) + "/", {
      method: "PATCH",
      json: patch,
    }).then(unwrapItem<CmsField>),
  removeField: (projectId: string | number, name: string, fieldName: string): Promise<void> =>
    api<void>(cms(projectId, name, "fields", fieldName) + "/", { method: "DELETE" }),

  // Documents
  listDocuments: (
    projectId: string | number,
    name: string,
    params: {
      filter?: Record<string, unknown>;
      sort?: string;
      limit?: number;
      skip?: number;
    } = {}
  ): Promise<CmsDocumentListResponse> => {
    const query: Record<string, string | number | undefined> = {
      limit: params.limit ?? 50,
      skip: params.skip ?? 0,
    };
    if (params.filter && Object.keys(params.filter).length > 0) {
      query.filter = JSON.stringify(params.filter);
    }
    if (params.sort) query.sort = params.sort;
    return api<CmsDocumentListResponse>(adminCms(projectId, name, "documents") + "/", { query });
  },
  // Cursor pagination for relation pickers: pass the previous page's
  // next_cursor to fetch the next batch; optional search hits primary_field.
  listDocumentsCursor: (
    projectId: string | number,
    name: string,
    params: { cursor?: string | null; search?: string; limit?: number } = {}
  ): Promise<CmsDocumentCursorResponse> => {
    // paginate=cursor is the always-present flag (empty cursor is dropped by the
    // query builder, so it can't signal cursor mode on the first page).
    const query: Record<string, string | number | undefined> = {
      paginate: "cursor",
      limit: params.limit ?? 30,
    };
    if (params.cursor) query.cursor = params.cursor;
    if (params.search) query.search = params.search;
    return api<CmsDocumentCursorResponse>(adminCms(projectId, name, "documents") + "/", { query });
  },
  getDocument: (
    projectId: string | number,
    name: string,
    id: string
  ): Promise<CmsDocument> => api<CmsDocument>(adminCms(projectId, name, "documents", id) + "/"),
  insertDocument: (
    projectId: string | number,
    name: string,
    document: Record<string, unknown>
  ): Promise<CmsDocument> =>
    api<CmsDocument>(cms(projectId, name, "documents") + "/", {
      method: "POST",
      json: document,
    }),
  bulkInsert: (
    projectId: string | number,
    name: string,
    documents: Record<string, unknown>[]
  ): Promise<{ inserted_ids: string[]; count: number }> =>
    api(cms(projectId, name, "documents", "bulk") + "/", {
      method: "POST",
      json: { documents },
    }),
  updateDocument: (
    projectId: string | number,
    name: string,
    id: string,
    patch: Record<string, unknown>
  ): Promise<CmsDocument> =>
    api<CmsDocument>(cms(projectId, name, "documents", id) + "/", {
      method: "PATCH",
      json: patch,
    }),
  deleteDocument: (projectId: string | number, name: string, id: string): Promise<void> =>
    api<void>(cms(projectId, name, "documents", id) + "/", { method: "DELETE" }),
  restoreDocument: (
    projectId: string | number,
    name: string,
    id: string
  ): Promise<unknown> =>
    api(cms(projectId, name, "documents", id, "restore") + "/", { method: "POST" }),
};
