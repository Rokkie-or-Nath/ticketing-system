// TICKETNET - API client.
//
// The backend (api/) is an Express + TypeScript + PostgreSQL REST API that runs
// on port 3001 during development. This module is the single place the web app
// talks to it: every call sends the JWT (kept in the session store) as a Bearer
// token, and every loader maps the snake_case rows the API returns into the
// camelCase shapes the rest of the components are built around.

import type { Category, Comment, Priority, Status, Ticket, User } from "@/data/mock";
import { clearSession, getToken } from "@/lib/auth";

/** Base URL of the REST API. Override with NEXT_PUBLIC_API_BASE. */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api";

/** Origin (scheme + host + port) of the API server, for attachment URLs. */
export const API_HOST = API_BASE.replace(/\/api\/?$/, "");

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : "An unexpected error occurred.";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (
    init?.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  } catch {
    throw new ApiError("Could not reach the API server. Is it running?", 0);
  }

  if (res.status === 401) {
    clearSession();
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/login") &&
      window.location.pathname !== "/"
    ) {
      window.location.href = "/login";
    }
    throw new ApiError("Session expired. Please sign in again.", 401);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      (body as { error?: { message?: string } })?.error?.message ??
      `Request failed (HTTP ${res.status})`;
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface Attachment {
  id: string;
  ticketId: string;
  uploadedBy: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
}

export interface ActivityEntry {
  id: string;
  ticketId: string;
  actorId: string;
  actionType: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}

export interface TicketDetail {
  ticket: Ticket;
  comments: Comment[];
  attachments: Attachment[];
  activity: ActivityEntry[];
}

export interface SlaRules {
  critical: { response: number; resolution: number };
  high: { response: number; resolution: number };
  medium: { response: number; resolution: number };
  low: { response: number; resolution: number };
}

export interface SlaStatus {
  priority: Priority;
  status: Status;
  responseTargetMinutes: number;
  resolutionTargetMinutes: number;
  elapsedMinutes: number;
  responseBreached: boolean;
  resolutionBreached: boolean;
  resolutionRemainingMinutes: number | null;
}

export interface ListTicketsParams {
  status?: string;
  priority?: string;
  category?: string;
  query?: string;
  page?: number;
  limit?: number;
}

// ---- Normalizers: snake_case DB rows -> camelCase UI shapes ----

function toTicket(row: any): Ticket {
  return {
    id: row.id,
    subject: row.subject,
    description: row.description,
    category: row.category,
    priority: row.priority,
    status: row.status,
    createdBy: row.created_by,
    assignedTo: row.assigned_to,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at,
  };
}

function toComment(row: any): Comment {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    userId: row.user_id,
    message: row.message,
    isInternal: row.is_internal,
    createdAt: row.created_at,
  };
}

function toAttachment(row: any): Attachment {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    uploadedBy: row.uploaded_by,
    fileName: row.file_name,
    fileUrl: row.file_url,
    fileSize: row.file_size,
    fileType: row.file_type,
    createdAt: row.created_at,
  };
}

function toActivity(row: any): ActivityEntry {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    actorId: row.actor_id,
    actionType: row.action_type,
    oldValue: row.old_value,
    newValue: row.new_value,
    createdAt: row.created_at,
  };
}

// ---- User-name resolution -------------------------------------------------
// The backend returns user ids everywhere (it never joins names), so we keep a
// small cache. The signed-in user is seeded from the session; every other id
// falls back to a readable label.

const userCache = new Map<string, User>();

export function rememberUser(user: User): void {
  userCache.set(user.id, user);
}

export function userById(id: string): User {
  const hit = userCache.get(id);
  if (hit) return hit;
  return {
    id,
    name: `User ${id.slice(0, 6).toUpperCase()}`,
    email: "",
    role: "employee",
  };
}// ---- Auth ----------------------------------------------------------------

export async function signup(name: string, email: string, password: string) {
  return request<{ user: any; token: string }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function login(email: string, password: string) {
  return request<{ user: any; token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout() {
  return request<void>("/auth/logout", { method: "POST" });
}

export async function fetchMe() {
  return request<{ user: any }>("/auth/me");
}

// ---- Tickets -------------------------------------------------------------

export async function listTickets(params: ListTicketsParams = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.priority) qs.set("priority", params.priority);
  if (params.category) qs.set("category", params.category);
  if (params.query) qs.set("query", params.query);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const q = qs.toString();
  const res = await request<{ data: any[]; page: number; limit: number; total: number }>(
    `/tickets${q ? `?${q}` : ""}`
  );
  return { ...res, data: res.data.map(toTicket) };
}

export async function getTicketDetail(id: string): Promise<TicketDetail> {
  const res = await request<{
    ticket: any;
    comments: any[];
    attachments: any[];
    activity: any[];
  }>(`/tickets/${id}`);
  return {
    ticket: toTicket(res.ticket),
    comments: (res.comments ?? []).map(toComment),
    attachments: (res.attachments ?? []).map(toAttachment),
    activity: (res.activity ?? []).map(toActivity),
  };
}

export async function createTicket(input: {
  subject: string;
  description: string;
  category: string;
  priority: string;
}) {
  const res = await request<any>("/tickets", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return toTicket(res);
}

export async function updateTicket(
  id: string,
  input: { status?: Status; priority?: Priority; category?: Category }
) {
  const body: Record<string, string> = {};
  if (input.status) body.status = input.status;
  if (input.priority) body.priority = input.priority;
  if (input.category) body.category = input.category;
  const res = await request<any>(`/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return toTicket(res);
}

export async function assignTicketToMe(id: string) {
  const res = await request<any>(`/tickets/${id}/assign`, {
    method: "PATCH",
    body: JSON.stringify({}),
  });
  return toTicket(res);
}

export async function fetchTicketActivity(id: string) {
  const res = await request<any[]>("/tickets/" + id + "/activity");
  return (res ?? []).map(toActivity);
}

// ---- Comments ------------------------------------------------------------

export async function addComment(ticketId: string, message: string, isInternal: boolean) {
  const res = await request<any>(`/tickets/${ticketId}/comments`, {
    method: "POST",
    body: JSON.stringify({ message, isInternal }),
  });
  return toComment(res);
}

export async function listComments(ticketId: string) {
  const res = await request<any[]>("/tickets/" + ticketId + "/comments");
  return (res ?? []).map(toComment);
}

// ---- SLA ----------------------------------------------------------------

export async function fetchSlaRules(): Promise<SlaRules> {
  const res = await request<any[]>("/sla-rules");
  const out = {} as SlaRules;
  for (const row of res ?? []) {
    const priority = row.priority as keyof SlaRules;
    out[priority] = {
      response: row.response_time_minutes,
      resolution: row.resolution_time_minutes,
    };
  }
  return out;
}

export async function fetchTicketSlaStatus(id: string): Promise<SlaStatus> {
  return request<SlaStatus>(`/tickets/${id}/sla-status`);
}

// ---- Attachments ---------------------------------------------------------

export function attachmentUrl(fileUrl: string): string {
  if (!fileUrl) return "";
  if (/^https?:\/\//.test(fileUrl)) return fileUrl;
  return `${API_HOST}${fileUrl}`;
}

export async function uploadAttachment(ticketId: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await request<any>(`/tickets/${ticketId}/attachments`, {
    method: "POST",
    body: form,
  });
  return toAttachment(res);
}

export async function deleteAttachment(attachmentId: string) {
  return request<void>(`/attachments/${attachmentId}`, { method: "DELETE" });
}