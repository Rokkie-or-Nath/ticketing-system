// TICKETNET — in-memory mock data mirroring docs/DATABASE.md
// Used so the frontend is fully interactive without a running backend.

export type Role = "employee" | "agent" | "admin";
export type Priority = "low" | "medium" | "high" | "critical";
export type Status = "open" | "in_progress" | "resolved" | "closed";
export type Category =
  | "hardware"
  | "software"
  | "network"
  | "access"
  | "other";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  createdBy: string; // user id
  assignedTo: string | null; // user id
  createdAt: string; // ISO 8601 UTC
  updatedAt: string;
  resolvedAt: string | null;
}

export interface Comment {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

export interface Activity {
  id: string;
  ticketId: string;
  actorId: string;
  actionType:
    | "created"
    | "status_changed"
    | "priority_changed"
    | "assigned"
    | "reassigned"
    | "comment_added";
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}

export const USERS: User[] = [
  { id: "u-emp-1", name: "D. Rivera", email: "d.rivera@corp.io", role: "employee" },
  { id: "u-emp-2", name: "M. Chua", email: "m.chua@corp.io", role: "employee" },
  { id: "u-emp-3", name: "J. Ong", email: "j.ong@corp.io", role: "employee" },
  { id: "u-ag-1", name: "S. Reyes", email: "s.reyes@it.corp.io", role: "agent" },
  { id: "u-ag-2", name: "T. Dizon", email: "t.dizon@it.corp.io", role: "agent" },
  { id: "u-ad-1", name: "ADMIN / ROOT", email: "root@it.corp.io", role: "admin" },
];
export const TICKETS: Ticket[] = [
  {
    id: "TK-1042",
    subject: "Laptop won't power on after BIOS update",
    description:
      "Attempted a scheduled BIOS update; machine now powers off during POST. "
      + "No display output, fans spin then die. Need a loaner as this is my primary workstation.",
    category: "hardware",
    priority: "high",
    status: "in_progress",
    createdBy: "u-emp-1",
    assignedTo: "u-ag-1",
    createdAt: "2026-09-04T08:12:00Z",
    updatedAt: "2026-09-04T10:40:00Z",
    resolvedAt: null,
  },
  {
    id: "TK-1041",
    subject: "VPN drops every ~15 minutes",
    description:
      "SSL VPN disconnects on a timer even on idle. Reconnect works but the "
      + "session never lasts. Happens on both office and home networks.",
    category: "network",
    priority: "critical",
    status: "open",
    createdBy: "u-emp-2",
    assignedTo: null,
    createdAt: "2026-09-04T09:05:00Z",
    updatedAt: "2026-09-04T09:05:00Z",
    resolvedAt: null,
  },
  {
    id: "TK-1039",
    subject: "New hire needs ERP read-only access",
    description:
      "Onboarded employee starting Monday requires read-only access to the ERP "
      + "and the shared drive. Requested by the people team.",
    category: "access",
    priority: "medium",
    status: "resolved",
    createdBy: "u-emp-3",
    assignedTo: "u-ag-2",
    createdAt: "2026-09-04T07:20:00Z",
    updatedAt: "2026-09-04T09:40:00Z",
    resolvedAt: "2026-09-04T09:40:00Z",
  },
  {
    id: "TK-1037",
    subject: "Excel keeps crashing on large pivot tables",
    description:
      "Spreadsheet with ~80k rows freezes Excel on any pivot refresh. Cleared "
      + "cache already. Considering a memory upgrade or Office repair.",
    category: "software",
    priority: "low",
    status: "closed",
    createdBy: "u-emp-1",
    assignedTo: "u-ag-1",
    createdAt: "2026-09-02T11:00:00Z",
    updatedAt: "2026-09-02T15:30:00Z",
    resolvedAt: "2026-09-02T14:10:00Z",
  },
  {
    id: "TK-1036",
    subject: "Conference room monitor no signal",
    description:
      "Main display in room 2B shows 'NO SIGNAL' from the wall PC. Cable reseated "
      + "and power cycled, still black. Possibly the output board.",
    category: "hardware",
    priority: "medium",
    status: "in_progress",
    createdBy: "u-emp-3",
    assignedTo: "u-ag-2",
    createdAt: "2026-09-02T09:45:00Z",
    updatedAt: "2026-09-03T08:00:00Z",
    resolvedAt: null,
  },
  {
    id: "TK-1034",
    subject: "Antivirus flagging internal dev tool as malware",
    description:
      "Corporate AV quarantined our internal CLI tool. It's a false positive but "
      + "blocked the CI pipeline. Needs whitelist exception.",
    category: "software",
    priority: "high",
    status: "open",
    createdBy: "u-emp-2",
    assignedTo: null,
    createdAt: "2026-09-04T07:30:00Z",
    updatedAt: "2026-09-04T07:30:00Z",
    resolvedAt: null,
  },
  {
    id: "TK-1031",
    subject: "Reset MFA for shared service account",
    description:
      "Ops service account lost its authenticator. Need MFA reset and a shared "
      + "recovery code issued under access policy.",
    category: "access",
    priority: "critical",
    status: "resolved",
    createdBy: "u-emp-3",
    assignedTo: "u-ag-1",
    createdAt: "2026-09-02T13:10:00Z",
    updatedAt: "2026-09-02T15:50:00Z",
    resolvedAt: "2026-09-02T15:50:00Z",
  },
  {
    id: "TK-1028",
    subject: "Wifi drops in east wing meeting pods",
    description:
      "Intermittent connectivity in the east wing pods. Likely access point "
      + "coverage. Happens at peak hours.",
    category: "network",
    priority: "medium",
    status: "closed",
    createdBy: "u-emp-1",
    assignedTo: "u-ag-2",
    createdAt: "2026-09-01T10:15:00Z",
    updatedAt: "2026-09-01T17:20:00Z",
    resolvedAt: "2026-09-01T16:40:00Z",
  },
];
export const COMMENTS: Comment[] = [
  {
    id: "c-1",
    ticketId: "TK-1042",
    userId: "u-ag-1",
    message: "Re-flashed BIOS via recovery mode, currently stress-testing POST.",
    isInternal: false,
    createdAt: "2026-09-04T09:20:00Z",
  },
  {
    id: "c-2",
    ticketId: "TK-1042",
    userId: "u-ag-1",
    message: "Loaner arranged — PD-004. Confirm collection at front desk.",
    isInternal: true,
    createdAt: "2026-09-04T09:25:00Z",
  },
  {
    id: "c-3",
    ticketId: "TK-1041",
    userId: "u-emp-2",
    message: "Still dropping as of 09:05. Waiting on agent pickup.",
    isInternal: false,
    createdAt: "2026-09-04T09:06:00Z",
  },
  {
    id: "c-4",
    ticketId: "TK-1037",
    userId: "u-ag-1",
    message: "Repaired Office install and raised memory to 16GB. Re-tested pivots.",
    isInternal: false,
    createdAt: "2026-09-02T14:10:00Z",
  },
  {
    id: "c-5",
    ticketId: "TK-1031",
    userId: "u-admin",
    message: "MFA reset completed under ticket T-OP-SEC; recovery code handed off.",
    isInternal: true,
    createdAt: "2026-09-02T15:50:00Z",
  },
];

export const ACTIVITY: Activity[] = [
  {
    id: "a-1",
    ticketId: "TK-1042",
    actorId: "u-emp-1",
    actionType: "created",
    oldValue: null,
    newValue: "high",
    createdAt: "2026-09-04T08:12:00Z",
  },
  {
    id: "a-2",
    ticketId: "TK-1042",
    actorId: "u-ag-1",
    actionType: "assigned",
    oldValue: null,
    newValue: "S. Reyes",
    createdAt: "2026-09-04T08:20:00Z",
  },
  {
    id: "a-3",
    ticketId: "TK-1042",
    actorId: "u-ag-1",
    actionType: "status_changed",
    oldValue: "open",
    newValue: "in_progress",
    createdAt: "2026-09-04T09:20:00Z",
  },
  {
    id: "a-4",
    ticketId: "TK-1041",
    actorId: "u-emp-2",
    actionType: "created",
    oldValue: null,
    newValue: "critical",
    createdAt: "2026-09-04T09:05:00Z",
  },
  {
    id: "a-5",
    ticketId: "TK-1039",
    actorId: "u-ag-2",
    actionType: "created",
    oldValue: null,
    newValue: "medium",
    createdAt: "2026-09-04T07:20:00Z",
  },
  {
    id: "a-6",
    ticketId: "TK-1039",
    actorId: "u-ag-2",
    actionType: "status_changed",
    oldValue: "in_progress",
    newValue: "resolved",
    createdAt: "2026-09-04T09:40:00Z",
  },
];
// ---- Lookup helpers ----
export function userById(id: string): User {
  return USERS.find((u) => u.id === id) ?? {
    id,
    name: "UNKNOWN",
    email: "unknown@unknown",
    role: "employee",
  };
}

export const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const STATUS_LABEL: Record<Status, string> = {
  open: "OPEN",
  in_progress: "IN PROGRESS",
  resolved: "RESOLVED",
  closed: "CLOSED",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  critical: "CRITICAL",
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
};

// SLA targets (minutes) per priority — response / resolution.
export const SLA_RULES: Record<Priority, { response: number; resolution: number }> = {
  critical: { response: 15, resolution: 240 },
  high: { response: 30, resolution: 480 },
  medium: { response: 120, resolution: 1440 },
  low: { response: 480, resolution: 2880 },
};

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(diffMs / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function fmtClock(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}