# API Reference

Base URL: `http://localhost:3001/api`

## Table of Contents

- [Auth](#auth)
- [Tickets](#tickets)
- [Comments](#comments)
- [Attachments](#attachments)
- [Activity Log](#activity-log)
- [SLA](#sla)
- [Admin](#admin)

## Auth

| Method | Endpoint             | Access | Description              |
|--------|------------------------|--------|----------------------------|
| POST   | `/auth/signup`          | Public | Create a new account       |
| POST   | `/auth/login`           | Public | Log in, returns JWT        |
| POST   | `/auth/logout`          | Authenticated | Invalidate session   |
| GET    | `/auth/me`              | Authenticated | Get current user     |

## Tickets

| Method | Endpoint                     | Access          | Description                                      |
|--------|--------------------------------|-----------------|-----------------------------------------------------|
| POST   | `/tickets`                      | Employee+        | Create a ticket                                     |
| GET    | `/tickets`                      | Authenticated    | List tickets — supports `?query=&status=&priority=&category=&page=&limit=`, scoped to own tickets for employees |
| GET    | `/tickets/:id`                  | Authenticated    | Get ticket detail (comments, attachments, activity) |
| PATCH  | `/tickets/:id`                  | Agent+           | Update status, priority, or category                |
| PATCH  | `/tickets/:id/assign`           | Agent+           | Assign to self or another agent                     |
| DELETE | `/tickets/:id`                  | Admin            | Soft-delete a ticket                                 |

## Comments

| Method | Endpoint                        | Access       | Description                                  |
|--------|-------------------------------------|--------------|-------------------------------------------------|
| POST   | `/tickets/:id/comments`             | Authenticated | Add a comment (`is_internal` flag for agent+) |
| GET    | `/tickets/:id/comments`             | Authenticated | List comments, filtered by role               |

## Attachments

| Method | Endpoint                          | Access       | Description                     |
|--------|---------------------------------------|--------------|-------------------------------------|
| POST   | `/tickets/:id/attachments`            | Authenticated | Upload file (multipart/form-data)  |
| GET    | `/tickets/:id/attachments`            | Authenticated | List attachments                    |
| DELETE | `/attachments/:id`                    | Uploader/Admin | Remove an attachment              |

## Activity Log

| Method | Endpoint                     | Access       | Description                          |
|--------|---------------------------------|--------------|------------------------------------------|
| GET    | `/tickets/:id/activity`          | Authenticated | Full timeline of changes for a ticket   |

Activity rows are written automatically by the server on any `PATCH /tickets/:id` or `PATCH /tickets/:id/assign` call — there is no separate endpoint to manually create an activity entry.

## SLA

| Method | Endpoint                     | Access | Description                          |
|--------|---------------------------------|--------|------------------------------------------|
| GET    | `/sla-rules`                     | Authenticated | List current SLA configuration     |
| PATCH  | `/sla-rules/:priority`           | Admin  | Update SLA targets for a priority level |
| GET    | `/tickets/:id/sla-status`        | Authenticated | Time remaining / breach flag       |

## Admin

| Method | Endpoint                          | Access | Description                        |
|--------|----------------------------------------|--------|----------------------------------------|
| GET    | `/admin/stats/overview`                | Admin  | Ticket volume, open/closed counts      |
| GET    | `/admin/stats/sla-breaches`            | Admin  | Breach rate over time                  |
| GET    | `/admin/stats/agents`                  | Admin  | Tickets resolved per agent             |
| GET    | `/admin/users`                         | Admin  | List all users                         |
| PATCH  | `/admin/users/:id/role`                | Admin  | Change a user's role                   |

---

**Conventions**

- All endpoints (except `/auth/signup` and `/auth/login`) require an `Authorization: Bearer <token>` header.
- Timestamps are ISO 8601 UTC.
- List endpoints return `{ data: [...], page, limit, total }`.
- Errors return `{ error: { message, code } }` with an appropriate HTTP status code.
