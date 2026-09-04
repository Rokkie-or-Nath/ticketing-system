# Database Schema

## Table of Contents

- [Entity Overview](#entity-overview)
- [Tables](#tables)
  - [users](#users)
  - [tickets](#tickets)
  - [ticket_comments](#ticket_comments)
  - [ticket_attachments](#ticket_attachments)
  - [ticket_activity_log](#ticket_activity_log)
  - [sla_rules](#sla_rules)
- [Relationships](#relationships)

## Entity Overview

```
users ─┬──< tickets (created_by)
       ├──< tickets (assigned_to)
       ├──< ticket_comments
       ├──< ticket_attachments
       └──< ticket_activity_log

tickets ─┬──< ticket_comments
         ├──< ticket_attachments
         └──< ticket_activity_log

sla_rules (standalone, referenced by priority)
```

## Tables

### `users`

| Column         | Type      | Notes                              |
|----------------|-----------|-------------------------------------|
| id             | uuid (PK) |                                      |
| name           | text      |                                      |
| email          | text      | unique                              |
| password_hash  | text      |                                      |
| role           | enum      | `employee` \| `agent` \| `admin`    |
| created_at     | timestamp |                                      |

### `tickets`

| Column        | Type      | Notes                                            |
|---------------|-----------|----------------------------------------------------|
| id            | uuid (PK) |                                                     |
| subject       | text      |                                                     |
| description   | text      |                                                     |
| category      | text      | e.g. hardware, software, network, access           |
| priority      | enum      | `low` \| `medium` \| `high` \| `critical`          |
| status        | enum      | `open` \| `in_progress` \| `resolved` \| `closed`  |
| created_by    | uuid (FK) | → users.id                                         |
| assigned_to   | uuid (FK, nullable) | → users.id                               |
| created_at    | timestamp |                                                     |
| updated_at    | timestamp |                                                     |
| resolved_at   | timestamp (nullable) |                                          |

### `ticket_comments`

| Column      | Type      | Notes                                    |
|-------------|-----------|--------------------------------------------|
| id          | uuid (PK) |                                            |
| ticket_id   | uuid (FK) | → tickets.id                              |
| user_id     | uuid (FK) | → users.id                                |
| message     | text      |                                            |
| is_internal | boolean   | true = agent-only note, hidden from requester |
| created_at  | timestamp |                                            |

### `ticket_attachments`

| Column       | Type      | Notes                          |
|--------------|-----------|----------------------------------|
| id           | uuid (PK) |                                  |
| ticket_id    | uuid (FK) | → tickets.id                    |
| uploaded_by  | uuid (FK) | → users.id                      |
| file_name    | text      |                                  |
| file_url     | text      | external storage URL            |
| file_size    | integer   | bytes                           |
| file_type    | text      | MIME type                       |
| created_at   | timestamp |                                  |

### `ticket_activity_log`

| Column      | Type      | Notes                                                        |
|-------------|-----------|-----------------------------------------------------------------|
| id          | uuid (PK) |                                                                 |
| ticket_id   | uuid (FK) | → tickets.id                                                    |
| actor_id    | uuid (FK) | → users.id                                                      |
| action_type | enum      | `status_changed` \| `priority_changed` \| `assigned` \| `reassigned` \| `comment_added` |
| old_value   | text (nullable) |                                                            |
| new_value   | text (nullable) |                                                            |
| created_at  | timestamp |                                                                  |

### `sla_rules`

| Column                    | Type    | Notes                          |
|----------------------------|---------|----------------------------------|
| id                         | uuid (PK) |                                |
| priority                   | enum    | `low` \| `medium` \| `high` \| `critical` |
| response_time_minutes      | integer | target time to first response  |
| resolution_time_minutes    | integer | target time to resolution      |

## Relationships

- A `user` can create many `tickets` (as requester) and be assigned many `tickets` (as agent) — two separate foreign keys on the same table.
- A `ticket` has many `comments`, `attachments`, and `activity_log` entries — all cascade-linked by `ticket_id`.
- `sla_rules` is not foreign-keyed to `tickets` directly; SLA status is computed at read time by matching a ticket's `priority` against the current rule for that priority.
