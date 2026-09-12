// TICKETNET - session store.
//
// The JWT and the signed-in user profile live in localStorage so the client
// components can attach the Bearer token to every API call and remember who is
// signed in across page reloads.

import type { User } from "@/data/mock";

const TOKEN_KEY = "ticketnet_token";
const USER_KEY = "ticketnet_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getSessionUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: User): void {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function isAuthed(): boolean {
  return getToken() !== null;
}