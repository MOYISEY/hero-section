# API contracts

This document describes the most important backend contracts used by NeuralBrief. It is a lightweight alternative to a full OpenAPI specification for the diploma version.

## Health

### GET `/api/health`

Returns application and database readiness.

Response 200:

```json
{
  "ok": true,
  "service": "neuralbrief",
  "database": "ready",
  "latencyMs": 12,
  "checkedAt": "2026-05-28T00:00:00.000Z"
}
```

## Auth

### POST `/api/auth/register`

Rate limit: 5 requests per minute per IP.

Request:

```json
{
  "name": "Client Name",
  "email": "client@example.com",
  "password": "secret123"
}
```

Response 200:

```json
{
  "ok": true,
  "user": {
    "id": "uuid",
    "email": "client@example.com",
    "name": "Client Name",
    "role": "client"
  }
}
```

### POST `/api/auth/login`

Rate limit: 10 requests per minute per IP.

Request:

```json
{
  "email": "client@example.com",
  "password": "secret123"
}
```

## AI interview

### POST `/api/hero-chat`

Rate limit: 20 requests per minute per IP.

Request body must include a `messages` array compatible with Vercel AI SDK UI messages.

## Director user management

### POST `/api/director/users`

Creates or restores staff accounts. Only `director` can call it.

Rate limit: 20 requests per minute per IP.

Allowed staff roles: `manager`, `developer`.

### PATCH `/api/director/users/manage`

Manages staff users. Only `director` can call it.

Rate limit: 30 requests per minute per IP.

Allowed actions:

- `set_role`
- `set_specialization`
- `delete`

All successful actions are written to `audit_log`.
