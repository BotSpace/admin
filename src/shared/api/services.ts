import "server-only";
import { api, apiFetch } from "./server";
import type { ApiError } from "./client";
import { PAGINATION_SIZE } from "@/shared/lib/constants";

// ────────────────────────────────────────────────────────────────────────
// Pagination
//
// The new Go backend returns { items, total, limit, offset } on every list
// endpoint (no envelope). The admin UI (already written) reads the OLD
// Django-shaped Page<T> = { results, total_items, total_pages, current_page,
// page_size } throughout every list page. Rather than touch every page.tsx,
// AdminAPI translates the new envelope into the old shape at the edge here.
// ────────────────────────────────────────────────────────────────────────

export type Page<T> = {
  results: T[];
  total_items: number;
  total_pages: number;
  current_page: number;
  page_size: number;
};

type RawPage<T> = { items: T[]; total: number; limit: number; offset: number };

function toPage<T>(raw: RawPage<T>): Page<T> {
  const page_size = raw.limit > 0 ? raw.limit : PAGINATION_SIZE;
  const current_page = Math.floor(raw.offset / page_size) + 1;
  const total_pages = Math.max(1, Math.ceil(raw.total / page_size));
  return { results: raw.items, total_items: raw.total, total_pages, current_page, page_size };
}

/** 1-based `page` (old convention) → `{limit, offset}` (new backend convention). */
function toOffset(page?: number, limit: number = PAGINATION_SIZE): { limit: number; offset: number } {
  const p = page && page > 0 ? page : 1;
  return { limit, offset: (p - 1) * limit };
}

/** Marks an AdminAPI method backed by an endpoint the new Go backend does not
 * (yet) expose. Throws an ApiError-shaped rejection so every call site's
 * existing try/catch renders its normal empty/error state instead of
 * crashing — see report for the full list of missing endpoints. */
function unavailable(feature: string): never {
  const err: ApiError = {
    status: 501,
    message: `${feature} — yangi backendda hali mavjud emas`,
  };
  throw err;
}

// ── Stats ──────────────────────────────────────────────────────────────────

// Mirrors administration.DashboardStatsResponse.
export type DashboardStats = {
  users: { total: number; active: number; new_today: number; new_7d: number; new_30d: number };
  projects: { total: number; with_release: number };
  templates: { total: number; pending_verify: number };
  withdrawals: { pending: number };
  revenue_30d: string;
  daily_signups: { day: string; count: number }[];
  daily_orders: { day: string; count: number }[];
};

// ── User types ─────────────────────────────────────────────────────────────

/** Mirrors user.UserResponse (both list + detail — the Go backend has one shape). */
export type AdminUser = {
  id: string;
  phone: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  balance: number;
  template_balance: string;
  is_active: boolean;
  is_kyc_verified: boolean;
  validated_at: string | null;
  created_at: string;
  updated_at: string;
  // ── Compatibility fields the new backend does NOT return ──
  // is_staff/is_superuser are derived from `role`.
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string; // alias of created_at
  tokens_used_total: number; // always 0 — not tracked per-user by this backend
};

function toAdminUser(u: {
  id: string;
  phone: string;
  email?: string;
  username?: string;
  first_name: string;
  last_name: string;
  role: string;
  balance: number;
  template_balance: string;
  is_active: boolean;
  is_kyc_verified: boolean;
  validated_at: string | null;
  created_at: string;
  updated_at: string;
}): AdminUser {
  return {
    ...u,
    email: u.email ?? "",
    username: u.username ?? "",
    is_active: u.is_active,
    is_staff: u.role === "admin",
    is_superuser: u.role === "superuser",
    date_joined: u.created_at,
    tokens_used_total: 0,
  };
}

export type AdminUserSubscription = {
  plan: string;
  plan_name: string;
  status: string;
  started_at: string | null;
  expires_at: string | null;
  token_reset_at: string | null;
  bots_count: number;
  tokens_used_input: number;
  tokens_used_output: number;
  tokens_used_total: number;
  token_limit: number;
  max_bots: number;
};

export type AdminUserProject = {
  id: string;
  name: string;
  username?: string;
  is_template: boolean;
  created_at: string;
};

export type AdminUserPurchasedTemplate = {
  id: string;
  template_id: string;
  template_name: string;
  amount: string;
  status: string;
  payment_status: string;
  created_at: string;
};

export type AdminUserAuthoredTemplate = {
  id: string;
  name: string;
  slug: string;
  is_verify: boolean;
  views: number;
  original_price: string;
  created_at: string;
};

// GET /api/v1/users/{id} returns an enriched detail projection: the flat
// UserResponse fields plus subscription/projects/template counts. NOTE:
// purchased_templates/authored_templates always ship as empty arrays server
// side (see user.AdminDetailResponse) — only the *_count fields are real;
// there is no per-row purchased/authored template listing yet.
export type AdminUserDetail = AdminUser & {
  subscription: AdminUserSubscription | null;
  projects: AdminUserProject[];
  projects_count: number;
  purchased_templates: AdminUserPurchasedTemplate[];
  purchased_count: number;
  authored_templates: AdminUserAuthoredTemplate[];
  authored_count: number;
};

function toAdminUserDetail(
  u: Parameters<typeof toAdminUser>[0] & {
    subscription: AdminUserSubscription | null;
    projects: AdminUserProject[];
    projects_count: number;
    purchased_templates: AdminUserPurchasedTemplate[];
    purchased_count: number;
    authored_templates: AdminUserAuthoredTemplate[];
    authored_count: number;
  }
): AdminUserDetail {
  return {
    ...toAdminUser(u),
    subscription: u.subscription,
    projects: u.projects ?? [],
    projects_count: u.projects_count ?? 0,
    purchased_templates: u.purchased_templates ?? [],
    purchased_count: u.purchased_count ?? 0,
    authored_templates: u.authored_templates ?? [],
    authored_count: u.authored_count ?? 0,
  };
}

// ── Project types ──────────────────────────────────────────────────────────

// Mirrors project.ProjectResponse. NOTE: GET /api/v1/projects is owner-scoped
// (no admin-wide listing exists on this backend) — see report.
export type AdminProject = {
  id: string;
  uuid?: string;
  name: string;
  description?: string;
  username?: string;
  owner_id?: string;
  owner_phone?: string;
  is_template?: boolean;
  release_webhook_uuid?: string;
  debug_webhook_uuid?: string;
  release_status?: string | null;
  created_at: string;
  updated_at?: string;
  owner?: string;
  is_active?: boolean;
  has_release?: boolean;
};

export type AdminProjectRelease = {
  id: string;
  version: string;
  status: string;
  service_id?: string;
  created_at: string;
  node_count?: number;
};

export type AdminProjectDetail = AdminProject & {
  owner: { id: string; phone: string; email?: string };
  mongo_database?: string;
  // Not returned by GET /api/v1/admin/projects/{id} (admin.AdminProjectDetailResponse
  // carries no node/flow data — see project.dto.go) — always undefined.
  current_node_count?: number;
  releases: AdminProjectRelease[];
  releases_count: number;
};

// ── Template types ─────────────────────────────────────────────────────────

// Mirrors template.AdminTemplateResponse (admin-wide listing projection —
// GET /api/v1/admin/templates). Always includes the resolved author name/
// phone (fixes the old "#undefined" author bug) and the real is_verify/
// status regardless of publish state.
export type AdminTemplate = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  author_id?: string;
  author_name?: string;
  author_phone?: string;
  status: string; // "verified" | "pending"
  is_verify: boolean;
  views: number;
  price?: string;
  original_price?: string;
  created_at: string;
  updated_at?: string;
};

export type TemplateSpecCredential = {
  key: string;
  type: string;
  label?: string;
  required: boolean;
  description?: string;
};

export type TemplateSpecModule = { slug: string; required: boolean };
export type TemplateSpecEnv = { key: string; required: boolean; label?: string; description?: string };

export type TemplateSpecCollectionField = {
  name: string;
  label?: string;
  kind: string;
  required?: boolean;
  default?: unknown;
  order?: number;
};

export type TemplateSpecCollection = {
  name: string;
  label?: string;
  description?: string;
  primary_field?: string;
  system?: boolean;
  fields: TemplateSpecCollectionField[];
  data: Record<string, unknown>[];
};

export type TemplateSpec = {
  flow?: unknown;
  collections?: TemplateSpecCollection[];
  credentials?: TemplateSpecCredential[];
  modules?: TemplateSpecModule[];
  envs?: TemplateSpecEnv[];
};

export type CredentialTypeInfo = { key: string; label?: string; source?: string };
export type ModuleCatalogItem = { slug: string; name?: string; description?: string };

// Mirrors template.AdminTemplateDetailResponse (GET /api/v1/admin/templates/{id}).
// NOTE: this backend has no spec/version/node-count/orders/resync surface for
// admin-created templates (those were speculative fields from an earlier UI
// iteration) — required_envs is the raw json.RawMessage array from the DB.
export type AdminTemplateDetail = AdminTemplate & {
  video?: string;
  project_id?: string;
  short_description?: string;
  description?: string;
  discount?: string;
  discount_type?: string;
  likes_count?: number;
  demo_url?: string;
  categories: { id: string; name: string }[];
  features: { id: string; name: string }[];
  required_envs?: unknown;
};

export type TemplateCategory = { id: string; name: string };

// Mirrors template.CreateAdminTemplateRequest — a direct admin create that
// bypasses the author submission/review flow. No image/video file upload:
// both are plain URL strings the admin must already have hosted somewhere.
export type CreateTemplateBody = {
  name: string;
  slug?: string;
  author_id?: string;
  project_id?: string;
  image?: string;
  video?: string;
  short_description?: string;
  description?: string;
  original_price?: string;
  discount?: string;
  discount_type?: "percent" | "amount";
  demo_url?: string;
  is_verify?: boolean;
  category_ids?: string[];
};

// Mirrors template.UpdateAdminTemplateRequest. Slug/author/project are
// immutable after creation (no fields for them here).
export type UpdateTemplateBody = Partial<{
  name: string;
  image: string;
  video: string;
  short_description: string;
  description: string;
  original_price: string;
  discount: string;
  discount_type: "percent" | "amount";
  demo_url: string;
  is_verify: boolean;
  category_ids: string[];
}>;

export type TemplateSpecPreview = {
  credentials: TemplateSpecCredential[];
  modules: TemplateSpecModule[];
  envs: TemplateSpecEnv[];
  collections: TemplateSpecCollection[];
};

export type TemplateVersion = {
  version: number;
  note?: string | null;
  created_by_phone?: string | null;
  created_at: string;
  is_current: boolean;
};

export type TemplateVersionDetail = { version: number; note?: string | null; spec: TemplateSpec; created_at: string };

// Mirrors template.SubmissionResponse.
export type TemplateSubmission = {
  id: string;
  template: string;
  project_id?: string;
  name?: string;
  user_phone?: string;
  project_name?: string;
  template_name?: string;
  submitted_by?: string;
  submitted_by_phone?: string;
  short_description?: string;
  description?: string;
  original_price?: string;
  categories?: { id: string; name: string }[];
  features?: { id: string; name: string }[];
  required_envs?: { key: string; description?: string }[];
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  note?: string;
  created_at: string;
  updated_at?: string;
};

// ── Withdrawal types ───────────────────────────────────────────────────────

// Template-author earnings withdrawal — mirrors template.WithdrawalResponse
// (GET/PATCH /api/v1/template/withdrawals/admin). The admin listing does NOT
// join the requesting user's id/phone — see report.
export type Withdrawal = {
  id: string;
  user?: string;
  user_phone?: string;
  amount: string;
  card_number?: string;
  card_owner?: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  note?: string;
  created_at: string;
};

// Bot earnings withdrawal — mirrors payment.WithdrawalResponse
// (GET/PATCH /api/v1/admin/payment/withdrawals). Same user-join gap as above.
export type BotWithdrawal = {
  id: string;
  user?: string;
  user_phone?: string;
  project: string | null;
  project_name?: string | null;
  amount: string;
  card_number: string;
  card_owner: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string | null;
  created_at: string;
};

// ── KYC verification types ─────────────────────────────────────────────────

// Mirrors kyc.AdminVerificationResponse.
export type KycVerification = {
  id: string;
  user: string;
  user_phone?: string;
  full_name: string;
  passport_image: string;
  selfie_image: string;
  residence_reference: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string | null;
  created_at: string;
};

// ── Support ticket types ─────────────────────────────────────────────────────

// Mirrors ticket.TicketMessageResponse / TicketResponse.
export type AdminTicketMessage = {
  id: string;
  sender: "user" | "admin";
  message: string;
  attachment?: string | null;
  attachment_url?: string;
  created_at: string;
};

export type AdminTicket = {
  id: string;
  user?: string;
  user_phone?: string;
  subject: string;
  status: "open" | "pending" | "closed";
  created_at: string;
  updated_at?: string;
  messages?: AdminTicketMessage[];
  last_message?: { sender: string; message: string } | null;
};

// ── Blog types ───────────────────────────────────────────────────────────────

// Mirrors blog.AdminBlogPostResponse — full admin CRUD exists on this backend.
export type AdminBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  is_published: boolean;
  author: string | null;
  author_name: string | null;
  reading_time: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BlogPostInput = { title: string; excerpt?: string; content: string; is_published?: boolean };

// ── Transaction types (NOT available admin-wide — see report) ──────────────

export type Transaction = {
  id: string;
  user?: string;
  user_id?: string;
  user_phone?: string;
  amount: string;
  status?: boolean;
  idempotency_key?: string;
  created_at: string;
  updated_at?: string;
  type?: string;
  description?: string;
};

export type AdminTransaction = Transaction;

// Mirrors payment.OrderResponse (bot payment order).
export type AdminBotOrder = {
  id: string;
  project: string;
  project_name: string | null;
  owner: string;
  owner_phone: string | null;
  payer_chat_id: number | null;
  payer_first_name: string | null;
  payer_last_name: string | null;
  payer_username: string | null;
  payer_name: string | null;
  amount: string;
  commission: string;
  net_amount: string;
  provider: string;
  status: string;
  comment: string | null;
  paid_at: string | null;
  is_debug: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminTransactionDetail = Transaction;

// ── Plan types ─────────────────────────────────────────────────────────────

// Mirrors plan.PlanResponse. GET /api/v1/plans is public/read-only — the new
// backend has no admin create/update/delete for plans. See report.
export type Plan = {
  id: string;
  name: string;
  name_display?: string;
  price: string;
  max_bots: number;
  max_tokens?: number;
  max_input_tokens?: number;
  max_output_tokens?: number;
  description?: string;
  is_top: boolean;
  is_active: boolean;
  order?: number;
  features?: Record<string, unknown> | string[];
};

// ── Broadcast / Message types ──────────────────────────────────────────────

// Mirrors message.MessageResponse (GET/POST /api/v1/messages, project-scoped
// to the caller's own projects).
export type BroadcastMessage = {
  id: string;
  project_id?: string;
  caption: string;
  message_type: string;
  button_type?: string;
  status: string;
  total: number;
  done: number;
  fail: number;
};

export type SendBroadcastBody = { project: string; caption: string };

// ── Audit log types ────────────────────────────────────────────────────────

// Mirrors administration.AuditLogResponse — note the flatter shape: one
// "target" string (no separate target_type/target_id), "metadata" instead of
// payload_before/payload_after, no "ip_address"/"note" fields.
export type AuditLog = {
  id: string;
  actor: string | null;
  actor_phone?: string;
  action: string;
  target?: string;
  target_type?: string;
  target_id?: string;
  metadata?: unknown;
  payload_before?: unknown;
  payload_after?: unknown;
  ip?: string;
  ip_address?: string;
  note?: string;
  created_at: string;
};

// ── Platform config / general settings (legacy generic shape — NOT
// available on this backend; see report) ────────────────────────────────

export type PlatformConfig = { key: string; value: string; label: string; group: string; is_public: boolean };
export type SettingOption = { key: string; value: string[] };
export type SettingGroup = { key: string; description: string; is_public: boolean; options: SettingOption[] };

// ── Real admin settings store (GET/PUT /api/v1/admin/settings/{general,ai}) ─

export type GeneralSettings = {
  site_name: string;
  support_email: string;
  support_phone: string;
  default_language: string;
  maintenance_mode: boolean;
  commission_percent: number;
};

export type AiAgentSettings = {
  provider: string;
  model: string;
  api_key: string;
  max_tokens: number;
  temperature: number;
  system_prompt_override: string;
};

// ── Me ─────────────────────────────────────────────────────────────────────

export type MeResponse = {
  id: string;
  phone: string;
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  is_staff: boolean;
  is_superuser: boolean;
};

export type { ModuleStatus } from "./module-status";

export type AdminModuleNode = { type: string; title: string; category: string; trigger: boolean };

// Mirrors plugin.ModuleResponse.
export type AdminModule = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  image: string;
  github_url: string;
  port: number;
  active: boolean;
  is_default: boolean;
  manifest_fetched_at: string | null;
  manifest_cache?: unknown;
  created_at: string;
  nodes: AdminModuleNode[];
  docs: string;
};

export type AdminModuleInput = {
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  github_url?: string;
  image?: string;
  port?: number;
  auth_token?: string;
  active?: boolean;
  is_default?: boolean;
};

// ── Monitoring (NOT available — see report) ─────────────────────────────────

export type AdminProjectUsage = {
  id: string;
  name: string;
  username: string | null;
  owner_id: string;
  owner_phone: string | null;
  owner_name: string | null;
  release_status: string | null;
  cpu_cores: number | null;
  memory_bytes: number | null;
  disk_bytes: number;
  net_bytes: number;
  is_template: boolean;
  created_at: string;
};

export type MonitoringPage = Page<AdminProjectUsage> & { prometheus_available: boolean };

export type MonitoringHistorySeries = {
  cpu_cores: [number, number][];
  memory_bytes: [number, number][];
  net_rx_bps: [number, number][];
  net_tx_bps: [number, number][];
  disk_bytes: [number, number][];
};

export type MonitoringHistory = {
  range: string;
  step: string;
  prometheus_available: boolean;
  series: MonitoringHistorySeries;
};

// ── Credential type types ───────────────────────────────────────────────────

export type CredentialFieldOption = { value: string; label: string };

export type CredentialField = {
  name: string;
  label: string;
  type: "text" | "password" | "number" | "textarea" | "select" | "url" | "switch";
  secret?: boolean;
  required?: boolean;
  default?: string | number | boolean;
  options?: CredentialFieldOption[];
};

// Mirrors credential.TypeResponse (GET /api/v1/credentials/types). NOTE: the
// new backend only exposes read on this list — no admin create/update/delete
// route exists (see report), unlike the old `editable` field's promise.
export type CredentialType = {
  key: string;
  label: string;
  icon?: string;
  color?: string;
  mode: "bearer" | "apikey" | "basic" | "header" | "oauth2" | "none";
  fields: CredentialField[];
  source: "code" | "admin" | `module:${string}`;
  editable: boolean;
};

export type CredentialTypeInput = {
  key: string;
  label: string;
  icon?: string;
  color?: string;
  mode: CredentialType["mode"];
  fields: CredentialField[];
};

export type CredentialTypePatch = Partial<Omit<CredentialTypeInput, "key">>;

// ── AdminAPI namespace ─────────────────────────────────────────────────────

export const AdminAPI = {
  // Auth
  async me(): Promise<MeResponse> {
    const u = await api<{
      id: string;
      phone: string;
      email?: string;
      username?: string;
      first_name?: string;
      last_name?: string;
      role: string;
    }>("/api/v1/users/me");
    return {
      ...u,
      is_staff: u.role === "admin",
      is_superuser: u.role === "superuser",
    };
  },

  // Stats
  async stats(): Promise<DashboardStats> {
    return api<DashboardStats>("/api/v1/admin/stats/dashboard");
  },

  // Users
  async users(params?: {
    search?: string;
    role?: string;
    is_active?: string;
    is_staff?: string;
    plan?: string;
    joined_after?: string;
    joined_before?: string;
    balance_min?: string;
    balance_max?: string;
    ordering?: string;
    page?: number;
  }): Promise<Page<AdminUser>> {
    // Only `search` + pagination are supported server-side; the rest of the
    // old filter set (role/is_active/plan/date range/balance range/ordering)
    // has no backend support yet and is silently ignored — see report.
    const { limit, offset } = toOffset(params?.page);
    const raw = await api<RawPage<Parameters<typeof toAdminUser>[0]>>("/api/v1/users", {
      query: { search: params?.search, limit, offset },
    });
    return toPage({ ...raw, items: raw.items.map(toAdminUser) });
  },

  async user(id: string): Promise<AdminUserDetail> {
    const raw = await api<Parameters<typeof toAdminUserDetail>[0]>(`/api/v1/users/${id}`);
    return toAdminUserDetail(raw);
  },

  // body.is_active is the *desired* new state (the UI passes !user.is_active
  // to toggle) — routed to the real /ban or /unban endpoint accordingly.
  // Neither endpoint accepts a body, so `note` is not supported and dropped.
  async banUser(id: string, body: { is_active: boolean; note?: string }): Promise<AdminUserDetail> {
    const path = body.is_active
      ? `/api/v1/admin/users/${id}/unban`
      : `/api/v1/admin/users/${id}/ban`;
    await api(path, { method: "POST" });
    return AdminAPI.user(id);
  },

  // Signed delta (positive credits, negative debits) against the main
  // balance only — the backend has no adjust-endpoint for template_balance.
  async adjustBalance(id: string, body: { delta: number; reason?: string }): Promise<AdminUserDetail> {
    await api(`/api/v1/admin/users/${id}/balance`, {
      method: "POST",
      json: { delta: body.delta, reason: body.reason },
    });
    return AdminAPI.user(id);
  },

  async setUserRole(id: string, role: "user" | "admin" | "superuser"): Promise<AdminUserDetail> {
    // The role endpoint returns the plain UserResponse (no subscription/
    // projects enrichment) — refetch the enriched detail afterwards so the
    // return shape matches AdminAPI.user().
    await api<Parameters<typeof toAdminUser>[0]>(`/api/v1/users/${id}/role`, {
      method: "PATCH",
      json: { role },
    });
    return AdminAPI.user(id);
  },

  // Projects — admin-wide (all owners). Only `search` + pagination are
  // supported server-side (project.AdminList); owner/is_template/has_release/
  // date-range/ordering filters from the old UI have no backend support yet
  // and are silently ignored.
  async projects(params?: {
    search?: string;
    owner?: string;
    is_template?: string;
    has_release?: string;
    created_after?: string;
    created_before?: string;
    ordering?: string;
    page?: number;
  }): Promise<Page<AdminProject>> {
    const { limit, offset } = toOffset(params?.page);
    const raw = await api<RawPage<AdminProject>>("/api/v1/admin/projects", {
      query: {
        search: params?.search,
        is_template: params?.is_template,
        has_release: params?.has_release,
        created_after: params?.created_after,
        created_before: params?.created_before,
        ordering: params?.ordering,
        limit,
        offset,
      },
    });
    return toPage(raw);
  },

  async project(id: string): Promise<AdminProjectDetail> {
    return api<AdminProjectDetail>(`/api/v1/admin/projects/${id}`);
  },

  async deleteProject(id: string): Promise<void> {
    await api<void>(`/api/v1/projects/${id}`, { method: "DELETE" });
  },

  // Templates — full admin CRUD via /admin/templates (template.AdminList/
  // AdminGet/AdminCreate/AdminUpdate/AdminDelete/AdminVerify/AdminReject).
  // Only `search` + `is_verify` + pagination are supported server-side;
  // category/author/price range/date range/ordering from the old UI have no
  // backend support yet and are silently ignored.
  async templates(params?: {
    search?: string;
    is_verify?: string;
    category?: string;
    author?: string;
    price_min?: string;
    price_max?: string;
    created_after?: string;
    created_before?: string;
    ordering?: string;
    page?: number;
  }): Promise<Page<AdminTemplate>> {
    const { limit, offset } = toOffset(params?.page);
    const raw = await api<RawPage<AdminTemplate>>("/api/v1/admin/templates", {
      query: { search: params?.search, is_verify: params?.is_verify, limit, offset },
    });
    return toPage(raw);
  },

  async template(id: string): Promise<AdminTemplateDetail> {
    return api<AdminTemplateDetail>(`/api/v1/admin/templates/${id}`);
  },

  async verifyTemplate(id: string, body: { is_verify: boolean; note?: string }): Promise<void> {
    // note is not supported by this backend (endpoints accept no body) — dropped.
    const path = body.is_verify
      ? `/api/v1/admin/templates/${id}/verify`
      : `/api/v1/admin/templates/${id}/reject`;
    await api(path, { method: "PATCH", json: {} });
  },

  async updateTemplate(id: string, body: UpdateTemplateBody): Promise<AdminTemplateDetail> {
    await api(`/api/v1/admin/templates/${id}`, { method: "PATCH", json: body });
    return AdminAPI.template(id);
  },

  async resyncTemplate(_id: string): Promise<AdminTemplateDetail> {
    return unavailable("Shablonni qayta sinxronlash");
  },

  async templateCategories(): Promise<TemplateCategory[]> {
    return apiFetch<TemplateCategory[]>("/api/v1/template/category");
  },

  async modulesCatalog(): Promise<ModuleCatalogItem[]> {
    const raw = await apiFetch<RawPage<ModuleCatalogItem>>("/api/v1/modules", { query: { active: "true" } });
    return raw.items ?? [];
  },

  async createTemplate(body: CreateTemplateBody): Promise<AdminTemplateDetail> {
    const created = await api<{ id: string }>("/api/v1/admin/templates", {
      method: "POST",
      json: {
        name: body.name,
        slug: body.slug || undefined,
        author_id: body.author_id || undefined,
        project_id: body.project_id || undefined,
        image: body.image || undefined,
        video: body.video || undefined,
        short_description: body.short_description || undefined,
        description: body.description || undefined,
        original_price: body.original_price || undefined,
        discount: body.discount || undefined,
        discount_type: body.discount_type || undefined,
        demo_url: body.demo_url || undefined,
        is_verify: body.is_verify ?? false,
        category_ids: body.category_ids?.length ? body.category_ids : undefined,
      },
    });
    return AdminAPI.template(created.id);
  },

  async previewTemplateSpec(_project: string): Promise<TemplateSpecPreview> {
    return unavailable("Shablon spec preview");
  },

  async deleteTemplate(id: string): Promise<void> {
    await api<void>(`/api/v1/admin/templates/${id}`, { method: "DELETE" });
  },

  async templateVersions(_id: string): Promise<TemplateVersion[]> {
    return unavailable("Shablon versiyalari");
  },

  async templateVersion(_id: string, _version: number): Promise<TemplateVersionDetail> {
    return unavailable("Shablon versiyasi");
  },

  async rollbackTemplate(_id: string, _body: { version: number; note?: string }): Promise<AdminTemplateDetail> {
    return unavailable("Shablonni versiyaga qaytarish");
  },

  // Template submissions (review queue) — list/approve/reject are admin-only
  // and work; get-by-id/update reuse the self-service endpoint which is
  // ownership-scoped to the submitter, so an admin viewing/editing another
  // user's submission may 403 — see report.
  async submissions(params?: {
    status?: string;
    search?: string;
    price_min?: string;
    price_max?: string;
    created_after?: string;
    created_before?: string;
    ordering?: string;
    page?: number;
  }): Promise<Page<TemplateSubmission>> {
    const { limit, offset } = toOffset(params?.page);
    const raw = await api<RawPage<TemplateSubmission>>("/api/v1/template/submissions/admin", {
      query: { status: params?.status, limit, offset },
    });
    return toPage(raw);
  },

  async approveSubmission(id: string, body?: { note?: string }): Promise<TemplateSubmission> {
    return api<TemplateSubmission>(`/api/v1/template/submissions/${id}/approve`, {
      method: "PATCH",
      json: body ?? {},
    });
  },

  async rejectSubmission(id: string, body?: { note?: string }): Promise<TemplateSubmission> {
    return api<TemplateSubmission>(`/api/v1/template/submissions/${id}/reject`, {
      method: "PATCH",
      json: body ?? {},
    });
  },

  async submission(id: string): Promise<TemplateSubmission> {
    return api<TemplateSubmission>(`/api/v1/template/submissions/${id}`);
  },

  async updateSubmission(
    id: string,
    body: Partial<Pick<TemplateSubmission, "name" | "description" | "status" | "note">> & {
      categories?: string[];
      features?: string[];
    }
  ): Promise<TemplateSubmission> {
    return api<TemplateSubmission>(`/api/v1/template/submissions/${id}`, { method: "PATCH", json: body });
  },

  // Template-author earnings withdrawals.
  async withdrawals(params?: { status?: string; page?: number }): Promise<Page<Withdrawal>> {
    const { limit, offset } = toOffset(params?.page);
    const raw = await api<RawPage<Withdrawal>>("/api/v1/template/withdrawals/admin", {
      query: { status: params?.status, limit, offset },
    });
    return toPage(raw);
  },

  async approveWithdrawal(id: string, body?: { note?: string }): Promise<Withdrawal> {
    return api<Withdrawal>(`/api/v1/template/withdrawals/${id}/approve`, { method: "PATCH", json: body ?? {} });
  },

  async rejectWithdrawal(id: string, body: { rejection_reason: string }): Promise<Withdrawal> {
    return api<Withdrawal>(`/api/v1/template/withdrawals/${id}/reject`, { method: "PATCH", json: body });
  },

  // Transactions — admin-wide (all users). Only pagination is supported
  // server-side (payment.AdminListTransactions takes no filter params at
  // all); the old filter set (search/user/status/amount range/date range/
  // ordering) has no backend support yet and is silently ignored.
  async transactions(params?: {
    search?: string;
    user?: string;
    status?: string;
    amount_min?: string;
    amount_max?: string;
    created_after?: string;
    created_before?: string;
    ordering?: string;
    page?: number;
  }): Promise<Page<AdminTransaction>> {
    const { limit, offset } = toOffset(params?.page);
    const raw = await api<RawPage<Transaction>>("/api/v1/admin/payment/transactions", {
      query: { limit, offset },
    });
    return toPage(raw);
  },

  // No GET-by-id route exists for admin transactions (payment.Handler has no
  // admin detail endpoint) — fetch a page large enough to cover the backend's
  // max page size (100) and find it client-side. Works at this data scale;
  // would need a real backend route to scale further.
  async transaction(id: string): Promise<AdminTransactionDetail> {
    const raw = await api<RawPage<Transaction>>("/api/v1/admin/payment/transactions", {
      query: { limit: 100, offset: 0 },
    });
    const found = raw.items.find((t) => t.id === id);
    if (!found) return unavailable("Tranzaksiya topilmadi");
    return found;
  },

  // Bot payment orders — admin-wide. Only `status` is supported server-side
  // (payment.AdminListOrders); project/owner scoping (used by BotOrdersCard)
  // is applied client-side after fetching a page large enough to cover the
  // backend's max page size (100).
  async botOrders(params?: {
    project?: string;
    owner?: string;
    status?: string;
    search?: string;
    ordering?: string;
    page?: number;
  }): Promise<Page<AdminBotOrder>> {
    const raw = await api<RawPage<Omit<AdminBotOrder, "project"> & { project_id: string }>>(
      "/api/v1/admin/payment/orders",
      { query: { status: params?.status, limit: 100, offset: 0 } }
    );
    let items = raw.items.map((o) => ({ ...o, project: o.project_id }));
    if (params?.project) items = items.filter((o) => o.project === params.project);
    if (params?.owner) items = items.filter((o) => o.owner === params.owner);
    return toPage({ items, total: items.length, limit: raw.limit, offset: 0 });
  },

  // Plans — read via the public /plans endpoint.
  async plans(): Promise<Plan[]> {
    const raw = await api<Plan[]>("/api/v1/plans");
    // The new backend tracks a single `max_tokens` budget (no separate
    // input/output split) — mirror it into both legacy fields so the
    // existing UI's "input + output" total still reads correctly.
    return raw.map((p) => ({
      ...p,
      max_input_tokens: p.max_tokens ?? 0,
      max_output_tokens: 0,
    }));
  },

  // Admin create/update/delete — /admin/plans (plan.AdminCreate/AdminUpdate/
  // AdminDelete). The backend has one `max_tokens` budget field (no input/
  // output split) and `sort_order` (not `order`) — translated here so the
  // existing plan form (which still edits input/output/order) keeps working.
  async createPlan(body: Omit<Plan, "id">): Promise<Plan> {
    const raw = await api<Plan>("/api/v1/admin/plans", {
      method: "POST",
      json: {
        name: body.name,
        price: body.price,
        description: body.description,
        is_top: body.is_top,
        is_active: body.is_active,
        sort_order: body.order ?? 0,
        max_bots: body.max_bots,
        max_tokens: (body.max_input_tokens ?? 0) + (body.max_output_tokens ?? 0),
      },
    });
    return { ...raw, max_input_tokens: raw.max_tokens ?? 0, max_output_tokens: 0 };
  },

  async updatePlan(id: string, body: Partial<Omit<Plan, "id">>): Promise<Plan> {
    const json: Record<string, unknown> = {};
    if (body.name !== undefined) json.name = body.name;
    if (body.price !== undefined) json.price = body.price;
    if (body.description !== undefined) json.description = body.description;
    if (body.is_top !== undefined) json.is_top = body.is_top;
    if (body.is_active !== undefined) json.is_active = body.is_active;
    if (body.order !== undefined) json.sort_order = body.order;
    if (body.max_bots !== undefined) json.max_bots = body.max_bots;
    if (body.max_input_tokens !== undefined || body.max_output_tokens !== undefined) {
      json.max_tokens = (body.max_input_tokens ?? 0) + (body.max_output_tokens ?? 0);
    }
    const raw = await api<Plan>(`/api/v1/admin/plans/${id}`, { method: "PATCH", json });
    return { ...raw, max_input_tokens: raw.max_tokens ?? 0, max_output_tokens: 0 };
  },

  async deletePlan(id: string): Promise<void> {
    await api<void>(`/api/v1/admin/plans/${id}`, { method: "DELETE" });
  },

  // Tickets
  async tickets(params?: { status?: string; page?: number }): Promise<Page<AdminTicket>> {
    const { limit, offset } = toOffset(params?.page);
    const raw = await api<RawPage<AdminTicket>>("/api/v1/admin/tickets", {
      query: { status: params?.status, limit, offset },
    });
    return toPage(raw);
  },

  async ticket(id: string): Promise<AdminTicket> {
    return api<AdminTicket>(`/api/v1/admin/tickets/${id}`);
  },

  async replyTicket(id: string, body: FormData): Promise<AdminTicket> {
    // Old endpoint was POST /tickets/{id}/reply; the new admin route is
    // /respond and only accepts JSON (message, attachment_url) — no file
    // upload support. We translate the FormData the UI already builds.
    const message = String(body.get("message") ?? "");
    const attachment_url = body.get("attachment_url");
    return api<AdminTicket>(`/api/v1/admin/tickets/${id}/respond`, {
      method: "POST",
      json: { message, attachment_url: typeof attachment_url === "string" ? attachment_url : undefined },
    });
  },

  async closeTicket(id: string): Promise<AdminTicket> {
    return api<AdminTicket>(`/api/v1/admin/tickets/${id}/close`, { method: "POST", json: {} });
  },

  // Broadcast / Messages
  async sendBroadcast(body: SendBroadcastBody): Promise<BroadcastMessage> {
    return api<BroadcastMessage>("/api/v1/messages", {
      method: "POST",
      json: { project_id: body.project, caption: body.caption, message_type: "text", button_type: "reply" },
    });
  },

  async broadcastList(projectId: string): Promise<BroadcastMessage[]> {
    const raw = await api<RawPage<BroadcastMessage>>("/api/v1/messages", { query: { project_id: projectId } });
    return raw.items ?? [];
  },

  // Platform config — legacy generic key/value settings surface. NOT
  // available: the new backend only exposes two well-known config keys
  // ("general", "ai") via /admin/settings/{key} — see generalSettings() /
  // aiAgentSettings() below, which the settings pages now use instead.
  async configs(): Promise<PlatformConfig[]> {
    return unavailable("Platforma sozlamalari (config)");
  },

  async updateConfig(_key: string, _value: string): Promise<PlatformConfig> {
    return unavailable("Platforma sozlamasini yangilash");
  },

  // Audit log
  async auditLog(params?: {
    action?: string;
    target_type?: string;
    target_id?: string;
    actor?: string;
    page?: number;
  }): Promise<Page<AuditLog>> {
    const { limit, offset } = toOffset(params?.page);
    const raw = await api<RawPage<AuditLog>>("/api/v1/admin/audit-log", {
      query: { action: params?.action, target: params?.target_type, actor_id: params?.actor, limit, offset },
    });
    return toPage(raw);
  },

  // General settings — legacy generic-group shape. NOT available (no
  // key/group/option settings surface on this backend) — see
  // generalSettings() below for the real (flat) equivalent.
  async getSettings(): Promise<SettingGroup[]> {
    return unavailable("Umumiy sozlamalar");
  },

  async setSetting(_settings_key: string, _option_key: string, _value: string[]): Promise<void> {
    return unavailable("Sozlamani saqlash");
  },

  // Real platform config store: two well-known keys, "general" and "ai" (see
  // config.KeyGeneral / config.KeyAI). GET returns {key, value, updated_at};
  // PUT replaces `value` wholesale with the raw JSON body.
  async generalSettings(): Promise<GeneralSettings> {
    const raw = await api<{ key: string; value: GeneralSettings; updated_at?: string }>(
      "/api/v1/admin/settings/general"
    );
    return raw.value;
  },

  async updateGeneralSettings(body: GeneralSettings): Promise<GeneralSettings> {
    const raw = await api<{ key: string; value: GeneralSettings; updated_at?: string }>(
      "/api/v1/admin/settings/general",
      { method: "PUT", json: body }
    );
    return raw.value;
  },

  async aiAgentSettings(): Promise<AiAgentSettings> {
    const raw = await api<{ key: string; value: AiAgentSettings; updated_at?: string }>("/api/v1/admin/settings/ai");
    return raw.value;
  },

  async updateAiAgentSettings(body: AiAgentSettings): Promise<AiAgentSettings> {
    const raw = await api<{ key: string; value: AiAgentSettings; updated_at?: string }>(
      "/api/v1/admin/settings/ai",
      { method: "PUT", json: body }
    );
    return raw.value;
  },

  // Bot earnings withdrawals (payment module).
  async botWithdrawals(params?: { status?: string; page?: number }): Promise<Page<BotWithdrawal>> {
    const { limit, offset } = toOffset(params?.page);
    const raw = await api<RawPage<BotWithdrawal>>("/api/v1/admin/payment/withdrawals", {
      query: { status: params?.status, limit, offset },
    });
    return toPage(raw);
  },

  async botWithdrawal(id: string): Promise<BotWithdrawal> {
    return api<BotWithdrawal>(`/api/v1/admin/payment/withdrawals/${id}`);
  },

  async approveBotWithdrawal(id: string, body?: { note?: string }): Promise<BotWithdrawal> {
    return api<BotWithdrawal>(`/api/v1/admin/payment/withdrawals/${id}/approve`, {
      method: "PATCH",
      json: body ?? {},
    });
  },

  async rejectBotWithdrawal(id: string, body: { rejection_reason: string }): Promise<BotWithdrawal> {
    return api<BotWithdrawal>(`/api/v1/admin/payment/withdrawals/${id}/reject`, { method: "PATCH", json: body });
  },

  // KYC verifications
  async kycVerifications(params?: { status?: string; page?: number }): Promise<Page<KycVerification>> {
    const { limit, offset } = toOffset(params?.page);
    const raw = await api<RawPage<KycVerification>>("/api/v1/kyc-verifications", {
      query: { status: params?.status, limit, offset },
    });
    return toPage(raw);
  },

  async kycVerification(id: string): Promise<KycVerification> {
    return api<KycVerification>(`/api/v1/kyc-verifications/${id}`);
  },

  async approveKyc(id: string, body?: { note?: string }): Promise<KycVerification> {
    return api<KycVerification>(`/api/v1/kyc-verifications/${id}/approve`, { method: "PATCH", json: body ?? {} });
  },

  async rejectKyc(id: string, body: { rejection_reason: string }): Promise<KycVerification> {
    return api<KycVerification>(`/api/v1/kyc-verifications/${id}/reject`, { method: "PATCH", json: body });
  },

  // Blog — full admin CRUD.
  async blogPosts(params?: { is_published?: string; page?: number }): Promise<Page<AdminBlogPost>> {
    const { limit, offset } = toOffset(params?.page);
    const raw = await api<RawPage<AdminBlogPost>>("/api/v1/admin/blog", {
      query: { is_published: params?.is_published, limit, offset },
    });
    return toPage(raw);
  },

  async blogPost(id: string): Promise<AdminBlogPost> {
    return api<AdminBlogPost>(`/api/v1/admin/blog/${id}`);
  },

  async createBlogPost(body: BlogPostInput): Promise<AdminBlogPost> {
    return api<AdminBlogPost>("/api/v1/admin/blog", { method: "POST", json: body });
  },

  async updateBlogPost(id: string, body: Partial<BlogPostInput>): Promise<AdminBlogPost> {
    return api<AdminBlogPost>(`/api/v1/admin/blog/${id}`, { method: "PATCH", json: body });
  },

  async deleteBlogPost(id: string): Promise<void> {
    await api<void>(`/api/v1/admin/blog/${id}`, { method: "DELETE" });
  },

  // Module catalog (plugin module) — full admin CRUD.
  async modules(params?: { search?: string; active?: string }): Promise<AdminModule[]> {
    const raw = await api<RawPage<AdminModule>>("/api/v1/modules", {
      query: { search: params?.search, active: params?.active },
    });
    return raw.items ?? [];
  },

  async module(slug: string): Promise<AdminModule> {
    return api<AdminModule>(`/api/v1/modules/${slug}`);
  },

  async createModule(body: AdminModuleInput): Promise<AdminModule> {
    return api<AdminModule>("/api/v1/modules", { method: "POST", json: body });
  },

  async updateModule(slug: string, body: Partial<AdminModuleInput>): Promise<AdminModule> {
    return api<AdminModule>(`/api/v1/modules/${slug}`, { method: "PATCH", json: body });
  },

  async deleteModule(slug: string): Promise<void> {
    await api<void>(`/api/v1/modules/${slug}`, { method: "DELETE" });
  },

  // Not available — no /modules/{slug}/status route on this backend.
  async moduleStatus(_slug: string): Promise<import("./module-status").ModuleStatus> {
    return unavailable("Modul real-time holati");
  },

  async refreshModuleManifest(slug: string): Promise<void> {
    await api<unknown>(`/api/v1/modules/${slug}/refresh-manifest`, { method: "POST" });
  },

  // Not available — no /modules/register-yaml route on this backend.
  async registerModuleYaml(_body: {
    yaml?: string;
    yaml_url?: string;
  }): Promise<{ ok: boolean; mode: "github" | "endpoint"; module: AdminModule; build_job?: unknown; manifest?: unknown }> {
    return unavailable("Moduleni YAML orqali ro'yxatdan o'tkazish");
  },

  // Not available — no /modules/register-github route on this backend.
  async registerModuleGithub(_body: {
    repo_url: string;
  }): Promise<{ ok: boolean; mode: "github" | "endpoint"; module: AdminModule; build_job?: string; warning?: string }> {
    return unavailable("Moduleni GitHub orqali ro'yxatdan o'tkazish");
  },

  // Monitoring — admin-wide per-project resource snapshot. Only `search` +
  // pagination are supported server-side (project.AdminMonitoring); owner/
  // is_template/has_release/ordering from the old UI are silently ignored.
  // prometheus_available is always false — this backend has no live metrics
  // scraper wired in (see project.dto.go toMonitoringListResponse).
  async monitoring(params?: {
    search?: string;
    owner?: string;
    is_template?: string;
    has_release?: string;
    ordering?: string;
    page?: number;
    page_size?: number;
  }): Promise<MonitoringPage> {
    const { limit, offset } = toOffset(params?.page, params?.page_size ?? PAGINATION_SIZE);
    const raw = await api<
      RawPage<{
        id: string;
        name: string;
        username?: string;
        owner_id: string;
        owner_phone?: string;
        release_status: string | null;
        cpu_cores: number;
        memory_bytes: number;
        disk_bytes: number;
        net_bytes?: number;
        is_template?: boolean;
        created_at: string;
      }> & { prometheus_available: boolean }
    >("/api/v1/admin/monitoring", {
      query: { search: params?.search, ordering: params?.ordering, limit, offset },
    });
    return {
      ...toPage(raw),
      results: raw.items.map((r) => ({
        id: r.id,
        name: r.name,
        username: r.username ?? null,
        owner_id: r.owner_id,
        owner_phone: r.owner_phone ?? null,
        owner_name: null,
        release_status: r.release_status,
        cpu_cores: r.cpu_cores,
        memory_bytes: r.memory_bytes,
        disk_bytes: r.disk_bytes,
        net_bytes: r.net_bytes ?? 0,
        is_template: r.is_template ?? false,
        created_at: r.created_at,
      })),
      prometheus_available: raw.prometheus_available,
    };
  },

  async monitoringHistory(id: string, range?: string): Promise<MonitoringHistory> {
    const raw = await api<{
      series: MonitoringHistorySeries;
      prometheus_available: boolean;
    }>(`/api/v1/admin/monitoring/${id}/history`, {
      query: { range },
    });
    return {
      range: range ?? "24h",
      step: "",
      prometheus_available: raw.prometheus_available,
      series: raw.series,
    };
  },

  // Credential types — read-only registry (code-defined, not a DB table);
  // no admin create/update/delete route exists. GET /admin/credential-types
  // is the admin-panel-specific alias of this same registry listing.
  async credentialTypes(params?: { source?: string }): Promise<CredentialType[]> {
    return api<CredentialType[]>("/api/v1/admin/credential-types", {
      query: params as Record<string, string | undefined>,
    });
  },

  async createCredentialType(_body: CredentialTypeInput): Promise<CredentialType> {
    return unavailable("Credential turini yaratish");
  },

  async updateCredentialType(_key: string, _body: CredentialTypePatch): Promise<CredentialType> {
    return unavailable("Credential turini tahrirlash");
  },

  async deleteCredentialType(_key: string): Promise<void> {
    return unavailable("Credential turini o'chirish");
  },
};
