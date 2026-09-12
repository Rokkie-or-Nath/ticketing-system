// TICKETNET - shared ticket data hook.
//
// Loads tickets plus the SLA rules from the API, keeps them in state, and
// exposes a loading/error/refresh wrapper. Also seeds the user-name cache so
// ticket tables can render assignee/reporter names.

"use client";

import { useCallback, useEffect, useState } from "react";
import type { Ticket } from "@/data/mock";
import {
  fetchSlaRules,
  listTickets,
  messageOf,
  rememberUser,
  type SlaRules,
} from "@/lib/api";

export interface UseTicketsResult {
  tickets: Ticket[];
  total: number;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  sla: SlaRules | null;
  me: any;
}

export function useTicketData(user: any): UseTicketsResult {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [sla, setSla] = useState<SlaRules | null>(null);
  const [me, setMe] = useState<any>();

  const refresh = useCallback(() => setReload((r) => r + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        if (user) {
          rememberUser(user);
          setMe(user);
        }
        const [rows, rules] = await Promise.all([listTickets(), fetchSlaRules()]);
        if (cancelled) return;
        setTickets(rows.data);
        setTotal(rows.total);
        setSla(rules);
        setError(null);
      } catch (e) {
        if (!cancelled) setError(messageOf(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, reload]);

  return { tickets, total, loading, error, refresh, sla, me };
}