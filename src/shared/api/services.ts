import "server-only";
import { api, apiFetch } from "./server";

// ── Pagination envelope ────────────────────────────────────────────────────

export type Page<T> = {
  results: T[];
  total_items: number;
  total_pages: number;
  current_page: number;
  page_size: number;
};

type Envelope<T> = { data: T };

function unwrap<T>(raw: Envelope<T>): T {
  return raw.data;
}

// ── Stats ──────────────────────────────────────────────────────────────────

export type DashboardStats = {
  users: { total: number; active: number; new_7d: number; new_30d: number };
  projects: { total: number; with_release: number };
  templates: { total: number; pending_verify: number };
  withdrawals: { pending: number };
  revenue_30d: string;
  daily_signups: { day: string; count: number }[];
  daily_orders: { day: string; count: number }[];
};

// ── User types ─────────────────────────────────────────────────────────────

/** Lightweight shape used in the list view */
export type AdminUser = {
  id: number;
  phone: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  balance: number;
  template_balance: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
};

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
  max_input_tokens: number;
  max_output_tokens: number;
  max_bots: number;
};

export type AdminUserProject = {
  id: number;
  name: string;
  username: string;
  is_template: boolean;
  created_at: string;
};

export type AdminUserPurchasedTemplate = {
  id: number;
  template_id: number;
  template_name: string;
  amount: string;
  status: string;
  payment_status: string;
  created_at: string;
};

export type AdminUserAuthoredTemplate = {
  id: number;
  name: string;
  slug: string;
  is_verify: boolean;
  views: number;
  original_price: string;
  created_at: string;
};

/** Rich shape returned by GET /api/v1/admin/users/{id}/ */
export type AdminUserDetail = {
  id: number;
  phone: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  validated_at: string | null;
  balance: number;
  template_balance: string;
  subscription: AdminUserSubscription | null;
  projects: AdminUserProject[];
  projects_count: number;
  purchased_templates: AdminUserPurchasedTemplate[];
  purchased_count: number;
  authored_templates: AdminUserAuthoredTemplate[];
  authored_count: number;
};

// ── Project types ──────────────────────────────────────────────────────────

export type AdminProject = {
  id: number;
  name: string;
  description?: string;
  username?: string;
  owner_id?: number;
  owner_phone?: string;
  is_template?: boolean;
  release_webhook_uuid?: string;
  created_at: string;
  updated_at?: string;
  // legacy fields kept for backward compat
  owner?: number;
  is_active?: boolean;
  has_release?: boolean;
};

export type AdminProjectRelease = {
  id: number;
  version: string;
  status: string;
  service_id?: string;
  created_at: string;
  node_count?: number;
};

export type AdminProjectDetail = {
  id: number;
  name: string;
  description?: string;
  username?: string;
  is_template: boolean;
  owner: { id: number; phone: string; email?: string };
  release_webhook_uuid?: string;
  debug_webhook_uuid?: string;
  mongo_database?: string;
  current_node_count: number;
  releases: AdminProjectRelease[];
  releases_count: number;
  created_at: string;
  updated_at?: string;
};

// ── Template types ─────────────────────────────────────────────────────────

export type AdminTemplate = {
  id: number;
  name: string;
  slug?: string;
  image?: string;
  demo_url?: string;
  short_description?: string;
  original_price?: string;
  discount?: string;
  discount_type?: string;
  views?: number;
  author_id?: number;
  author_phone?: string;
  // legacy fields kept for backward compat
  description?: string;
  author?: number;
  author_username?: string;
  is_verify: boolean;
  created_at: string;
};

export type AdminTemplateDetail = {
  id: number;
  name: string;
  slug?: string;
  image?: string;
  demo_url?: string;
  short_description?: string;
  description?: string;
  original_price?: string;
  discount?: string;
  discount_type?: string;
  is_verify: boolean;
  views: number;
  likes?: number;
  author: { id: number; phone: string };
  categories: { id: number; name: string }[];
  features: { id: number; name: string }[];
  orders_total: number;
  orders_confirmed: number;
  node_count?: number;
  required_envs?: { key: string; description?: string }[];
  created_at: string;
  updated_at?: string;
};

export type TemplateCategory = {
  id: number;
  name: string;
};

export type TemplateSubmission = {
  id: number;
  template: number;
  // list fields (new contract)
  name?: string;
  user_phone?: string;
  project_name?: string;
  // legacy detail fields kept for backward compat
  template_name?: string;
  submitted_by?: number;
  submitted_by_phone?: string;
  description?: string;
  categories?: { id: number; name: string }[];
  features?: { id: number; name: string }[];
  required_envs?: { key: string; description?: string }[];
  status: "pending" | "approved" | "rejected";
  note?: string;
  created_at: string;
  updated_at?: string;
};

// ── Withdrawal types ───────────────────────────────────────────────────────

export type Withdrawal = {
  id: number;
  user: number;
  user_phone?: string;
  amount: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  note?: string;
  created_at: string;
};

// ── Bot earnings withdrawal types ──────────────────────────────────────────

export type BotWithdrawal = {
  id: number;
  user: number;
  user_phone?: string;
  project: number | null;
  project_name?: string | null;
  amount: string;
  card_number: string;
  card_owner: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string | null;
  created_at: string;
};

// ── KYC verification types ─────────────────────────────────────────────────

export type KycVerification = {
  id: number;
  user: number;
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

export type AdminTicketMessage = {
  id: number;
  sender: "user" | "admin";
  message: string;
  attachment?: string | null;
  created_at: string;
};

export type AdminTicket = {
  id: number;
  user: number;
  user_phone?: string;
  subject: string;
  status: "open" | "pending" | "closed";
  created_at: string;
  updated_at?: string;
  messages?: AdminTicketMessage[];
};

// ── Transaction types ──────────────────────────────────────────────────────

export type Transaction = {
  id: number;
  user?: number;
  user_id?: number;
  user_phone?: string;
  amount: string;
  status?: boolean;
  idempotency_key?: string;
  created_at: string;
  updated_at?: string;
  // legacy fields kept for backward compat
  type?: string;
  description?: string;
};

export type AdminTransaction = Transaction;

export type AdminTransactionDetail = {
  id: number;
  user?: number;
  user_id?: number;
  user_phone?: string;
  amount: string;
  status?: boolean;
  idempotency_key?: string;
  created_at: string;
  updated_at?: string;
};

// ── Plan types ─────────────────────────────────────────────────────────────

export type Plan = {
  id: number;
  name: string;
  price: string;
  max_bots: number;
  max_input_tokens: number;
  max_output_tokens: number;
  description?: string;
  is_top: boolean;
  is_active: boolean;
  order: number;
  features?: Record<string, unknown> | string[];
};

// ── Broadcast / Message types ──────────────────────────────────────────────

export type BroadcastMessage = {
  id: number;
  caption: string;
  message_type: string;
  status: string;
  total: number;
  done: number;
  fail: number;
};

export type SendBroadcastBody = {
  project: number;
  caption: string;
};

// ── Audit log types ────────────────────────────────────────────────────────

export type AuditLog = {
  id: number;
  actor: number;
  actor_phone?: string;
  action: string;
  target_type?: string;
  target_id?: number;
  payload_before?: unknown;
  payload_after?: unknown;
  ip_address?: string;
  note?: string;
  created_at: string;
};

// ── Platform config types ──────────────────────────────────────────────────

export type PlatformConfig = {
  key: string;
  value: string;
  label: string;
  group: string;
  is_public: boolean;
};

// ── General settings types (shared app SettingsModel / OptionsModel) ───────

export type SettingOption = {
  key: string;
  value: string[];
};

export type SettingGroup = {
  key: string;
  description: string;
  is_public: boolean;
  options: SettingOption[];
};

// ── Me ─────────────────────────────────────────────────────────────────────

export type MeResponse = {
  id: number;
  phone: string;
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_staff: boolean;
  is_superuser: boolean;
};

// ── AdminAPI namespace ─────────────────────────────────────────────────────

export const AdminAPI = {
  // Auth
  async me(): Promise<MeResponse> {
    const raw = await api<Envelope<MeResponse>>("/api/v1/auth/me/");
    return unwrap(raw);
  },

  // Stats
  async stats(): Promise<DashboardStats> {
    const raw = await api<Envelope<DashboardStats>>("/api/v1/admin/stats/dashboard/");
    return unwrap(raw);
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
    const raw = await api<Envelope<Page<AdminUser>>>("/api/v1/admin/users/", {
      query: params as Record<string, string | number | boolean | undefined | null>,
    });
    return unwrap(raw);
  },

  async user(id: number): Promise<AdminUserDetail> {
    const raw = await api<Envelope<AdminUserDetail>>(`/api/v1/admin/users/${id}/`);
    return unwrap(raw);
  },

  async banUser(
    id: number,
    body: { is_active: boolean; note?: string }
  ): Promise<AdminUserDetail> {
    const raw = await api<Envelope<AdminUserDetail>>(`/api/v1/admin/users/${id}/ban/`, {
      method: "PATCH",
      json: body,
    });
    return unwrap(raw);
  },

  async adjustBalance(
    id: number,
    body: { field: "balance" | "template_balance"; value: string; note?: string }
  ): Promise<AdminUserDetail> {
    const raw = await api<Envelope<AdminUserDetail>>(`/api/v1/admin/users/${id}/balance/`, {
      method: "PATCH",
      json: body,
    });
    return unwrap(raw);
  },

  // Projects
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
    const raw = await api<Envelope<Page<AdminProject>>>("/api/v1/admin/projects/", {
      query: params as Record<string, string | number | boolean | undefined | null>,
    });
    return unwrap(raw);
  },

  async project(id: number): Promise<AdminProjectDetail> {
    const raw = await api<Envelope<AdminProjectDetail>>(`/api/v1/admin/projects/${id}/`);
    return unwrap(raw);
  },

  async deleteProject(id: number): Promise<void> {
    await api<void>(`/api/v1/admin/projects/${id}/`, { method: "DELETE" });
  },

  // Templates
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
    const raw = await api<Envelope<Page<AdminTemplate>>>("/api/v1/admin/templates/", {
      query: params as Record<string, string | number | boolean | undefined | null>,
    });
    return unwrap(raw);
  },

  async template(id: number): Promise<AdminTemplateDetail> {
    const raw = await api<Envelope<AdminTemplateDetail>>(`/api/v1/admin/templates/${id}/`);
    return unwrap(raw);
  },

  async verifyTemplate(
    id: number,
    body: { is_verify: boolean; note?: string }
  ): Promise<AdminTemplate> {
    const raw = await api<Envelope<AdminTemplate>>(`/api/v1/admin/templates/${id}/verify/`, {
      method: "PATCH",
      json: body,
    });
    return unwrap(raw);
  },

  async updateTemplate(
    id: number,
    body: Partial<Pick<AdminTemplateDetail, "name" | "short_description" | "description" | "original_price" | "discount" | "discount_type" | "is_verify" | "demo_url">>,
    image?: File | Blob
  ): Promise<AdminTemplateDetail> {
    if (image) {
      const fd = new FormData();
      fd.append("image", image);
      for (const [k, v] of Object.entries(body)) {
        if (v !== undefined && v !== null) fd.append(k, String(v));
      }
      const raw = await api<Envelope<AdminTemplateDetail>>(`/api/v1/admin/templates/${id}/`, {
        method: "PATCH",
        body: fd,
      });
      return unwrap(raw);
    }
    const raw = await api<Envelope<AdminTemplateDetail>>(`/api/v1/admin/templates/${id}/`, {
      method: "PATCH",
      json: body,
    });
    return unwrap(raw);
  },

  async templateCategories(): Promise<TemplateCategory[]> {
    type CatEnvelope = { status: boolean; data: { results: TemplateCategory[] } | TemplateCategory[] };
    const raw = await apiFetch<CatEnvelope>("/api/v1/template/category/");
    const d = raw.data;
    if (Array.isArray(d)) return d as TemplateCategory[];
    if (d && typeof d === "object" && "results" in d) return (d as { results: TemplateCategory[] }).results;
    return [];
  },

  // Template submissions
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
    const raw = await api<Envelope<Page<TemplateSubmission>>>("/api/v1/admin/template-submissions/", {
      query: params as Record<string, string | number | boolean | undefined | null>,
    });
    return unwrap(raw);
  },

  async approveSubmission(id: number, body?: { note?: string }): Promise<TemplateSubmission> {
    const raw = await api<Envelope<TemplateSubmission>>(
      `/api/v1/admin/template-submissions/${id}/approve/`,
      { method: "PATCH", json: body ?? {} }
    );
    return unwrap(raw);
  },

  async rejectSubmission(id: number, body?: { note?: string }): Promise<TemplateSubmission> {
    const raw = await api<Envelope<TemplateSubmission>>(
      `/api/v1/admin/template-submissions/${id}/reject/`,
      { method: "PATCH", json: body ?? {} }
    );
    return unwrap(raw);
  },

  async submission(id: number): Promise<TemplateSubmission> {
    const raw = await api<Envelope<TemplateSubmission>>(`/api/v1/admin/template-submissions/${id}/`);
    return unwrap(raw);
  },

  async updateSubmission(
    id: number,
    body: Partial<Pick<TemplateSubmission, "name" | "description" | "status" | "note"> & { categories?: number[]; features?: number[] }>
  ): Promise<TemplateSubmission> {
    const raw = await api<Envelope<TemplateSubmission>>(
      `/api/v1/admin/template-submissions/${id}/`,
      { method: "PATCH", json: body }
    );
    return unwrap(raw);
  },

  // Withdrawals
  async withdrawals(params?: { status?: string; page?: number }): Promise<Page<Withdrawal>> {
    const raw = await api<Envelope<Page<Withdrawal>>>("/api/v1/admin/withdrawals/", {
      query: params as Record<string, string | number | boolean | undefined | null>,
    });
    return unwrap(raw);
  },

  async approveWithdrawal(id: number, body?: { note?: string }): Promise<Withdrawal> {
    const raw = await api<Envelope<Withdrawal>>(`/api/v1/admin/withdrawals/${id}/approve/`, {
      method: "PATCH",
      json: body ?? {},
    });
    return unwrap(raw);
  },

  async rejectWithdrawal(id: number, body: { rejection_reason: string }): Promise<Withdrawal> {
    const raw = await api<Envelope<Withdrawal>>(`/api/v1/admin/withdrawals/${id}/reject/`, {
      method: "PATCH",
      json: body,
    });
    return unwrap(raw);
  },

  // Transactions
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
    const raw = await api<Envelope<Page<AdminTransaction>>>("/api/v1/admin/transactions/", {
      query: params as Record<string, string | number | boolean | undefined | null>,
    });
    return unwrap(raw);
  },

  async transaction(id: number): Promise<AdminTransactionDetail> {
    const raw = await api<Envelope<AdminTransactionDetail>>(`/api/v1/admin/transactions/${id}/`);
    return unwrap(raw);
  },

  // Plans
  async plans(): Promise<Plan[]> {
    const raw = await api<Envelope<Plan[]>>("/api/v1/admin/plans/");
    return unwrap(raw);
  },

  async createPlan(body: Omit<Plan, "id">): Promise<Plan> {
    const raw = await api<Envelope<Plan>>("/api/v1/admin/plans/", {
      method: "POST",
      json: body,
    });
    return unwrap(raw);
  },

  async updatePlan(id: number, body: Partial<Omit<Plan, "id">>): Promise<Plan> {
    const raw = await api<Envelope<Plan>>(`/api/v1/admin/plans/${id}/`, {
      method: "PATCH",
      json: body,
    });
    return unwrap(raw);
  },

  async deletePlan(id: number): Promise<void> {
    await api<void>(`/api/v1/admin/plans/${id}/`, { method: "DELETE" });
  },

  // Tickets
  async tickets(params?: { status?: string; page?: number }): Promise<Page<AdminTicket>> {
    const raw = await api<Envelope<Page<AdminTicket>>>("/api/v1/admin/tickets/", {
      query: params as Record<string, string | number | boolean | undefined | null>,
    });
    return unwrap(raw);
  },

  async ticket(id: number): Promise<AdminTicket> {
    const raw = await api<Envelope<AdminTicket>>(`/api/v1/admin/tickets/${id}/`);
    return unwrap(raw);
  },

  async replyTicket(id: number, body: FormData): Promise<AdminTicket> {
    const raw = await api<Envelope<AdminTicket>>(`/api/v1/admin/tickets/${id}/reply/`, {
      method: "POST",
      body,
    });
    return unwrap(raw);
  },

  async closeTicket(id: number): Promise<AdminTicket> {
    const raw = await api<Envelope<AdminTicket>>(`/api/v1/admin/tickets/${id}/close/`, {
      method: "PATCH",
      json: {},
    });
    return unwrap(raw);
  },

  // Broadcast / Messages
  async sendBroadcast(body: SendBroadcastBody): Promise<BroadcastMessage> {
    return api<BroadcastMessage>("/api/message/", {
      method: "POST",
      json: { ...body, message_type: "text", button_type: "reply" },
    });
  },

  async broadcastList(projectId: number): Promise<BroadcastMessage[]> {
    type ListEnvelope = { results?: BroadcastMessage[] } | BroadcastMessage[];
    const raw = await api<ListEnvelope>("/api/message/", {
      query: { project: projectId },
    });
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object" && "results" in raw && Array.isArray(raw.results))
      return raw.results;
    return [];
  },

  // Platform config
  async configs(): Promise<PlatformConfig[]> {
    const raw = await api<Envelope<unknown>>("/api/v1/shared/config/");
    const data = unwrap(raw);
    // Normalize: the list may come back as a bare array, a paginated
    // { results: [...] } object, or a flat { key: value } dict — always
    // return PlatformConfig[] so callers can safely .find()/.map().
    if (Array.isArray(data)) return data as PlatformConfig[];
    const results = (data as { results?: unknown })?.results;
    if (Array.isArray(results)) return results as PlatformConfig[];
    if (data && typeof data === "object") {
      return Object.entries(data as Record<string, unknown>).map(
        ([key, value]) => ({ key, value, label: key, group: "", is_public: true }) as PlatformConfig,
      );
    }
    return [];
  },

  async updateConfig(key: string, value: string): Promise<PlatformConfig> {
    const raw = await api<Envelope<PlatformConfig>>(`/api/v1/shared/config/${key}/`, {
      method: "PATCH",
      json: { value },
    });
    return unwrap(raw);
  },

  // Audit log
  async auditLog(params?: {
    action?: string;
    target_type?: string;
    target_id?: number;
    actor?: number;
    page?: number;
  }): Promise<Page<AuditLog>> {
    const raw = await api<Envelope<Page<AuditLog>>>("/api/v1/admin/audit-log/", {
      query: params as Record<string, string | number | boolean | undefined | null>,
    });
    return unwrap(raw);
  },

  // General settings (shared app SettingsModel / OptionsModel)
  async getSettings(): Promise<SettingGroup[]> {
    type RawEnvelope = { status: unknown; data: SettingGroup[] | { results?: SettingGroup[] } };
    const raw = await api<RawEnvelope>("/api/v1/admin/settings/");
    const data = raw.data;
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object" && "results" in data && Array.isArray(data.results))
      return data.results;
    return [];
  },

  async setSetting(
    settings_key: string,
    option_key: string,
    value: string[]
  ): Promise<void> {
    await api<unknown>("/api/v1/admin/settings/set/", {
      method: "POST",
      json: { settings_key, option_key, value },
    });
  },

  // Bot earnings withdrawals
  async botWithdrawals(params?: { status?: string; page?: number }): Promise<Page<BotWithdrawal>> {
    const raw = await api<Envelope<Page<BotWithdrawal>>>("/api/v1/admin/bot-withdrawals/", {
      query: params as Record<string, string | number | boolean | undefined | null>,
    });
    return unwrap(raw);
  },

  async botWithdrawal(id: number): Promise<BotWithdrawal> {
    const raw = await api<Envelope<BotWithdrawal>>(`/api/v1/admin/bot-withdrawals/${id}/`);
    return unwrap(raw);
  },

  async approveBotWithdrawal(id: number, body?: { note?: string }): Promise<BotWithdrawal> {
    const raw = await api<Envelope<BotWithdrawal>>(`/api/v1/admin/bot-withdrawals/${id}/approve/`, {
      method: "PATCH",
      json: body ?? {},
    });
    return unwrap(raw);
  },

  async rejectBotWithdrawal(id: number, body: { rejection_reason: string }): Promise<BotWithdrawal> {
    const raw = await api<Envelope<BotWithdrawal>>(`/api/v1/admin/bot-withdrawals/${id}/reject/`, {
      method: "PATCH",
      json: body,
    });
    return unwrap(raw);
  },

  // KYC verifications
  async kycVerifications(params?: { status?: string; page?: number }): Promise<Page<KycVerification>> {
    const raw = await api<Envelope<Page<KycVerification>>>("/api/v1/admin/kyc-verifications/", {
      query: params as Record<string, string | number | boolean | undefined | null>,
    });
    return unwrap(raw);
  },

  async kycVerification(id: number): Promise<KycVerification> {
    const raw = await api<Envelope<KycVerification>>(`/api/v1/admin/kyc-verifications/${id}/`);
    return unwrap(raw);
  },

  async approveKyc(id: number, body?: { note?: string }): Promise<KycVerification> {
    const raw = await api<Envelope<KycVerification>>(`/api/v1/admin/kyc-verifications/${id}/approve/`, {
      method: "PATCH",
      json: body ?? {},
    });
    return unwrap(raw);
  },

  async rejectKyc(id: number, body: { rejection_reason: string }): Promise<KycVerification> {
    const raw = await api<Envelope<KycVerification>>(`/api/v1/admin/kyc-verifications/${id}/reject/`, {
      method: "PATCH",
      json: body,
    });
    return unwrap(raw);
  },
};
