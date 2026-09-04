# Architecture

## Table of Contents

- [System Overview](#system-overview)
- [High-Level Diagram](#high-level-diagram)
- [Components](#components)
- [Data Flow](#data-flow)
- [Roles & Permissions](#roles--permissions)
- [SLA Engine](#sla-engine)
- [Key Design Decisions](#key-design-decisions)

## System Overview

The system is a monorepo with two deployable units:

- **`web/`** — Next.js frontend, server-rendered pages for employees, agents, and admins
- **`api/`** — Express/TypeScript REST API, stateless, talks to PostgreSQL

Both are managed as pnpm workspace packages so they can be developed and versioned together while deploying independently.

## High-Level Diagram

```
┌─────────────┐        HTTPS/JSON        ┌──────────────┐        SQL        ┌──────────────┐
│   Next.js    │ ──────────────────────▶ │  Express API  │ ─────────────────▶ │  PostgreSQL   │
│   (web/)     │ ◀────────────────────── │   (api/)      │ ◀───────────────── │              │
└─────────────┘                          └──────────────┘                    └──────────────┘
      │                                          │
      │                                          ▼
      │                                  ┌──────────────┐
      └───────────────────────────────▶  │  File Storage │  (attachments)
                                          └──────────────┘
```

## Components

| Component        | Responsibility                                              |
|-------------------|--------------------------------------------------------------|
| `routes/`          | Defines endpoints, maps to controllers                      |
| `controllers/`      | Request handling, validation, calls into models             |
| `models/`           | Database queries and data shape definitions                 |
| `middleware/`       | Auth checks (JWT verification), role guards, error handling |

## Data Flow

**Creating a ticket:**

1. Employee submits form on `web/` → `POST /api/tickets`
2. `middleware` verifies JWT, attaches `user` to request
3. `controller` validates payload, calls `model` to insert into `tickets` table
4. A corresponding row is written to `ticket_activity_log` (ticket created)
5. Response returns the new ticket; frontend redirects to ticket detail page

**Updating ticket status:**

1. Agent changes status on ticket detail page → `PATCH /api/tickets/:id`
2. `middleware` confirms requester has `agent` or `admin` role
3. `controller` updates the `tickets` row inside a DB transaction
4. Same transaction inserts a row into `ticket_activity_log` capturing old/new value
5. If the change resolves an SLA-breaching ticket, the SLA status is recalculated

## Roles & Permissions

| Action                        | Employee | Agent | Admin |
|--------------------------------|:--------:|:-----:|:-----:|
| Create ticket                  | ✅        | ✅     | ✅     |
| View own tickets                | ✅        | ✅     | ✅     |
| View all tickets                | ❌        | ✅     | ✅     |
| Assign/reassign tickets         | ❌        | ✅     | ✅     |
| Change ticket status            | ❌        | ✅     | ✅     |
| Manage users/roles              | ❌        | ❌     | ✅     |
| Configure SLA rules             | ❌        | ❌     | ✅     |
| View admin dashboard            | ❌        | ❌     | ✅     |

Role checks are enforced server-side via middleware — the frontend hides UI elements for convenience only, and is not treated as a security boundary.

## SLA Engine

Each priority level (`low`, `medium`, `high`, `critical`) maps to a `response_time_minutes` and `resolution_time_minutes` target, stored in `sla_rules`. On each ticket read, the API computes:

- Time remaining until response/resolution target
- Whether the target has already been breached

This is computed on read rather than stored, so changing an SLA rule retroactively affects how existing tickets are displayed without a data migration.

## Key Design Decisions

- **Activity log writes happen inside the same transaction as the ticket update** — guarantees the audit trail can never drift out of sync with actual ticket state.
- **File attachments are stored externally** (e.g. Supabase Storage/S3), with only the URL and metadata in Postgres — keeps the database lean and avoids binary blobs in backups.
- **SLA status is computed, not stored** — avoids stale SLA flags if rules change.
- **AI features are deliberately deferred** (see [TODO.md](TODO.md)) — the core workflow is built and stable first; AI categorization and RAG suggestions are additive, not load-bearing.
