// TICKETNET — API client stub.
//
// The backend (api/) is currently an empty scaffold. These thin helpers document
// the intended wire contract from docs/API.md so wiring the real backend later is
// a drop-in change. Every function falls back to the in-memory mock until the API
// is live.

import { TICKETS, COMMENTS, ACTIVITY, USERS, type Ticket, type Comment } from "@/data/mock";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // ---- Real-backend stubs (throw until the API exists) ----
  listTicketsLive: (query = "") => request(`/tickets?${query}`),
  getTicketLive: (id: string) => request(`/tickets/${id}`),

  // ---- Mock fallbacks (used now) ----
  listTicketsMock: async (): Promise<Ticket[]> => TICKETS,
  commentsMock: async (ticketId: string): Promise<Comment[]> =>
    COMMENTS.filter((c) => c.ticketId === ticketId),
  activityMock: async (ticketId: string) =>
    ACTIVITY
      .filter((a) => a.ticketId === ticketId)
      .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1)),
  usersMock: async () => USERS,
};