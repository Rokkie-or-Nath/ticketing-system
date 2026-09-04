# Ticketing System API

A REST API for an internal support-ticket system, built with Express, TypeScript, and PostgreSQL.

**Base URL:** `http://localhost:3001/api`

## Table of Contents

1. [Roles and Permissions](#roles-and-permissions)
2. [Authentication](#authentication)
3. [Error Format](#error-format)
4. [Endpoints](#endpoints)
   - [Auth](#auth)
   - [Tickets](#tickets)
   - [Comments](#comments)
   - [Attachments](#attachments)
   - [SLA](#sla)
   - [Admin](#admin)
5. [Conventions](#conventions)

---

## Roles and Permissions

The system defines three roles, each inheriting the permissions of the role before it.

| Role | Permissions |
|---|---|
| Employee | Create tickets; view, comment on, and attach files to their own tickets |
| Agent | All employee permissions, plus: view, update, and assign any ticket; post internal-only comments |
| Admin | All agent permissions, plus: delete tickets; manage SLA rules; manage user accounts and roles; view system-wide statistics |

Every account is created with the Employee role. Role changes are performed by an admin through the Admin API.

## Authentication

All endpoints except `POST /auth/signup` and `POST /auth/login` require the following header:

```
Authorization: Bearer <token>
```

Tokens are JSON Web Tokens issued at signup or login and are valid for seven days. Calling `POST /auth/logout` revokes a token immediately, before its natural expiry.

## Error Format

All errors are returned as JSON with an appropriate HTTP status code:

```json
{ "error": { "message": "Ticket not found" } }
```

---

## Endpoints

Endpoints marked **Auth required** require a valid `Authorization` header. Endpoints marked with a specific role require the caller to hold that role or higher, as defined in [Roles and Permissions](#roles-and-permissions).

### Auth

#### `POST /auth/signup`
Creates a new account with the Employee role.

**Request body**
```json
{ "name": "string", "email": "string", "password": "string" }
```

**Response** `201 Created`
```json
{ "user": { "id": "...", "name": "...", "email": "...", "role": "employee" }, "token": "..." }
```

#### `POST /auth/login`
Authenticates an existing account.

**Request body**
```json
{ "email": "string", "password": "string" }
```

**Response** `200 OK` — same shape as signup. Returns `401 Unauthorized` on invalid credentials.

#### `POST /auth/logout`
Auth required. Revokes the current token so it can no longer be used to authenticate.

**Response** `204 No Content`

#### `GET /auth/me`
Auth required. Returns the profile of the currently authenticated user.

**Response** `200 OK`
```json
{ "user": { "userId": "...", "role": "..." } }
```

---

### Tickets

#### `POST /tickets`
Auth required. Creates a ticket owned by the requesting user.

**Request body**
```json
{ "subject": "string", "description": "string", "category": "string", "priority": "low | medium | high | critical" }
```

**Response** `201 Created` — the created ticket.

#### `GET /tickets`
Auth required. Lists tickets with pagination and filtering. Employees see only tickets they created; agents and admins see all tickets. Soft-deleted tickets are excluded.

**Query parameters**

| Parameter | Description |
|---|---|
| `query` | Free-text search across subject and description |
| `status` | Filter by ticket status |
| `priority` | Filter by priority |
| `category` | Filter by category |
| `page` | Page number (default 1) |
| `limit` | Results per page (default 20) |

**Response** `200 OK`
```json
{ "data": [ ... ], "page": 1, "limit": 20, "total": 42 }
```

#### `GET /tickets/:id`
Auth required. Returns full ticket detail: the ticket record, its comments, its attachments, and its activity log. Employees receive `403 Forbidden` for tickets they do not own; internal-only comments are omitted for employees.

**Response** `200 OK`
```json
{ "ticket": { ... }, "comments": [ ... ], "attachments": [ ... ], "activity": [ ... ] }
```

#### `PATCH /tickets/:id`
Requires Agent or Admin. Updates one or more of `status`, `priority`, and `category`. Only supplied fields are changed. Each changed field is recorded as a separate entry in the activity log. Setting `status` to `resolved` also records `resolved_at`.

**Request body**
```json
{ "status": "string", "priority": "string", "category": "string" }
```

**Response** `200 OK` — the updated ticket.

#### `PATCH /tickets/:id/assign`
Requires Agent or Admin. Assigns or reassigns a ticket. If `assigneeId` is omitted, the ticket is assigned to the requesting user.

**Request body**
```json
{ "assigneeId": "string" }
```

**Response** `200 OK` — the updated ticket.

#### `DELETE /tickets/:id`
Requires Admin. Soft-deletes a ticket. The record is retained but excluded from all subsequent reads.

**Response** `204 No Content`

#### `GET /tickets/:id/activity`
Auth required. Returns the activity log for a ticket independently of the full detail endpoint. Access rules match `GET /tickets/:id`.

**Response** `200 OK` — an array of activity entries.

#### `GET /tickets/:id/sla-status`
Auth required. Returns SLA timing information for a ticket. Access rules match `GET /tickets/:id`.

**Response** `200 OK`
```json
{
  "priority": "high",
  "status": "open",
  "responseTargetMinutes": 60,
  "resolutionTargetMinutes": 480,
  "elapsedMinutes": 42,
  "responseBreached": false,
  "resolutionBreached": false,
  "resolutionRemainingMinutes": 438
}
```

---

### Comments

#### `POST /tickets/:id/comments`
Auth required. Adds a comment to a ticket and records a `comment_added` activity entry. The `isInternal` flag is honored only for agents and admins; it is forced to `false` for employees.

**Request body**
```json
{ "message": "string", "isInternal": false }
```

**Response** `201 Created` — the created comment.

#### `GET /tickets/:id/comments`
Auth required. Lists comments on a ticket. Internal-only comments are omitted for employees.

**Response** `200 OK` — an array of comments.

---

### Attachments

#### `POST /tickets/:id/attachments`
Auth required. Uploads a file to a ticket. Request must be `multipart/form-data` with the file in a field named `file`. Maximum file size is 10 MB.

**Response** `201 Created` — the created attachment record.

#### `GET /tickets/:id/attachments`
Auth required. Lists attachments on a ticket.

**Response** `200 OK` — an array of attachments.

#### `DELETE /attachments/:attachmentId`
Auth required. Deletes an attachment. Permitted only for the original uploader or an admin.

**Response** `204 No Content`

---

### SLA

#### `GET /sla-rules`
Auth required. Lists the response and resolution time targets, in minutes, for each priority level.

**Response** `200 OK` — an array of SLA rules.

#### `PATCH /sla-rules/:priority`
Requires Admin. Updates the targets for a given priority level.

**Request body**
```json
{ "responseTimeMinutes": 60, "resolutionTimeMinutes": 480 }
```

**Response** `200 OK` — the updated rule.

---

### Admin

All endpoints in this section require the Admin role.

#### `GET /admin/stats/overview`
Returns total ticket count and a breakdown by status.

#### `GET /admin/stats/sla-breaches`
Returns the number of open tickets that have exceeded their resolution SLA, and the overall breach rate.

#### `GET /admin/stats/agents`
Returns, per agent, the number of tickets assigned, the number resolved, and the average resolution time.

#### `GET /admin/users`
Lists all user accounts, excluding password hashes.

#### `PATCH /admin/users/:id/role`
Changes a user's role.

**Request body**
```json
{ "role": "employee | agent | admin" }
```

**Response** `200 OK` — the updated user.

---

## Conventions

- Timestamps are ISO 8601, UTC.
- List endpoints return an object of the form `{ data, page, limit, total }`.
- Errors return `{ error: { message, code? } }` with an appropriate HTTP status code.
