# Pathologist Friend — API Endpoints Report

**Base URL:** `http://localhost:3000`  
**Swagger UI:** `http://localhost:3000/api/docs`  
**Auth header (protected routes):** `Authorization: Bearer <accessToken>`

---

## Response Envelope

All endpoints return a consistent JSON shape.

### Success

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { }
}
```

- `message` may be customized per endpoint (e.g. `"Login successful"`).
- `data` holds the actual payload (user object, list, tokens, etc.).

### Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["field must be a valid email"]
}
```

| HTTP Status | When |
|-------------|------|
| `400` | Validation failed / bad request |
| `401` | Missing/invalid token, wrong credentials, inactive account |
| `403` | Insufficient role permissions |
| `404` | Resource not found |
| `409` | Duplicate email or username |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

---

## Enums

| Enum | Values |
|------|--------|
| **Role** | `ADMIN`, `PATHOLOGIST`, `USER` |
| **Status** | `ACTIVE`, `INACTIVE` |

## Password Rules

Minimum 8 characters, must include:
- Uppercase letter
- Lowercase letter
- Number
- Special character (`@$!%*?&#`)

---

## Shared: User Object (`data`)

Returned wherever a single user is included:

```json
{
  "id": "665f1a2b3c4d5e6f7a8b9c0d",
  "fullName": "Dr. Jane Smith",
  "email": "jane.smith@hospital.com",
  "username": "jsmith",
  "role": "PATHOLOGIST",
  "status": "ACTIVE",
  "lastLoginAt": "2026-07-29T10:30:00.000Z",
  "createdAt": "2026-07-01T08:00:00.000Z",
  "updatedAt": "2026-07-29T10:30:00.000Z"
}
```

> Password hash is **never** returned.

---

# Auth Endpoints

## 1. Login

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/auth/login` |
| **Auth** | None (public) |

### Request Body

```json
{
  "identifier": "admin",
  "password": "AdminPass1!"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `identifier` | string | Yes | Username **or** email |
| `password` | string | Yes | Account password |

### Success Response (`200`)

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "...",
      "fullName": "System Administrator",
      "email": "admin@pathologist-friend.com",
      "username": "admin",
      "role": "ADMIN",
      "status": "ACTIVE",
      "lastLoginAt": "2026-07-29T10:30:00.000Z",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| `401` | `Invalid credentials` |
| `401` | `Account is inactive` |
| `400` | Validation errors (missing fields) |

---

## 2. Logout

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/auth/logout` |
| **Auth** | Bearer token required |

### Request Body

None.

### Success Response (`200`)

```json
{
  "success": true,
  "message": "Logout successful",
  "data": {}
}
```

> Invalidates the stored refresh token on the server.

---

## 3. Refresh Token

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/auth/refresh` |
| **Auth** | None (public) |

### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refreshToken` | string | Yes | Valid refresh JWT |

### Success Response (`200`)

Same shape as login — new `accessToken`, new `refreshToken` (rotation), and `user` object.

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": { }
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| `401` | `Invalid refresh token` |

---

## 4. Get Current User

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/auth/me` |
| **Auth** | Bearer token required |

### Request Body

None.

### Success Response (`200`)

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": "...",
    "fullName": "...",
    "email": "...",
    "username": "...",
    "role": "PATHOLOGIST",
    "status": "ACTIVE",
    "lastLoginAt": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

# User Endpoints

> All `/users/*` routes require a valid Bearer token unless noted.  
> Admin-only routes return `403 Forbidden` for `PATHOLOGIST` and `USER` roles.

---

## 5. List Users

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/users` |
| **Auth** | Bearer token |
| **Role** | `ADMIN` only |

### Query Parameters

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `page` | number | No | `1` | Page number |
| `limit` | number | No | `10` | Items per page |
| `search` | string | No | — | Search fullName, email, username |
| `role` | enum | No | — | Filter by `ADMIN`, `PATHOLOGIST`, or `USER` |
| `status` | enum | No | — | Filter by `ACTIVE` or `INACTIVE` |

**Example:** `GET /users?page=1&limit=10&search=jane&role=PATHOLOGIST&status=ACTIVE`

### Success Response (`200`)

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "items": [
      {
        "id": "...",
        "fullName": "Dr. Jane Smith",
        "email": "jane.smith@hospital.com",
        "username": "jsmith",
        "role": "PATHOLOGIST",
        "status": "ACTIVE",
        "lastLoginAt": null,
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

## 6. Get User by ID

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/users/:id` |
| **Auth** | Bearer token |
| **Role** | `ADMIN` only |

### URL Params

| Param | Type | Description |
|-------|------|-------------|
| `id` | string | MongoDB ObjectId of the user |

### Success Response (`200`)

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": "...",
    "fullName": "...",
    "email": "...",
    "username": "...",
    "role": "PATHOLOGIST",
    "status": "ACTIVE",
    "lastLoginAt": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| `404` | `User not found` |

---

## 7. Create User

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/users` |
| **Auth** | Bearer token |
| **Role** | `ADMIN` only |

### Request Body

```json
{
  "fullName": "Dr. Jane Smith",
  "email": "jane.smith@hospital.com",
  "username": "jsmith",
  "password": "SecurePass1!",
  "role": "PATHOLOGIST",
  "status": "ACTIVE"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fullName` | string | Yes | Max 100 chars |
| `email` | string | Yes | Valid, unique email |
| `username` | string | Yes | 3–50 chars, unique |
| `password` | string | Yes | Strong password (see rules) |
| `role` | enum | Yes | `ADMIN`, `PATHOLOGIST`, or `USER` |
| `status` | enum | No | `ACTIVE` (default) or `INACTIVE` |

### Success Response (`200`)

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "...",
    "fullName": "Dr. Jane Smith",
    "email": "jane.smith@hospital.com",
    "username": "jsmith",
    "role": "PATHOLOGIST",
    "status": "ACTIVE",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

> Triggers welcome email (+ activation email if status is `ACTIVE`).

### Error Responses

| Status | Message |
|--------|---------|
| `409` | `Email already exists` |
| `409` | `Username already exists` |
| `400` | Validation errors |

---

## 8. Update User

| | |
|---|---|
| **Method** | `PATCH` |
| **URL** | `/users/:id` |
| **Auth** | Bearer token |
| **Role** | `ADMIN` only |

### URL Params

| Param | Type | Description |
|-------|------|-------------|
| `id` | string | User ObjectId |

### Request Body (all fields optional)

```json
{
  "fullName": "Dr. Jane Smith Updated",
  "email": "jane.new@hospital.com",
  "username": "jsmith2",
  "role": "PATHOLOGIST",
  "status": "ACTIVE"
}
```

### Success Response (`200`)

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": { }
}
```

Returns the updated user object in `data`.

---

## 9. Delete User

| | |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/users/:id` |
| **Auth** | Bearer token |
| **Role** | `ADMIN` only |

### URL Params

| Param | Type | Description |
|-------|------|-------------|
| `id` | string | User ObjectId |

### Request Body

None.

### Success Response (`200`)

```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {}
}
```

---

## 10. Update User Status (Activate / Deactivate)

| | |
|---|---|
| **Method** | `PATCH` |
| **URL** | `/users/:id/status` |
| **Auth** | Bearer token |
| **Role** | `ADMIN` only |

### URL Params

| Param | Type | Description |
|-------|------|-------------|
| `id` | string | User ObjectId |

### Request Body

```json
{
  "status": "INACTIVE"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `status` | enum | Yes | `ACTIVE`, `INACTIVE` |

### Success Response (`200`)

```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "id": "...",
    "fullName": "...",
    "status": "INACTIVE",
    "..."
  }
}
```

> Sends activation or deactivation email when status changes.

---

## 11. Reset User Password

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/users/:id/reset-password` |
| **Auth** | Bearer token |
| **Role** | `ADMIN` only |

### URL Params

| Param | Type | Description |
|-------|------|-------------|
| `id` | string | User ObjectId |

### Request Body

```json
{
  "sendTemporaryPassword": true
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `sendTemporaryPassword` | boolean | No | `true` | `true` = email temp password; `false` = email reset link |

### Success Response (`200`)

When `sendTemporaryPassword: true` (default):

```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": {}
}
```

When `sendTemporaryPassword: false`:

```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": {
    "temporaryPassword": "TmpAb12xYz1!"
  }
}
```

> Also invalidates the user's refresh token.

---

## 12. Get Own Profile

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/users/profile` |
| **Auth** | Bearer token |
| **Role** | Any authenticated user |

### Success Response (`200`)

Same user object as `GET /auth/me`.

---

## 13. Update Own Profile

| | |
|---|---|
| **Method** | `PATCH` |
| **URL** | `/users/profile` |
| **Auth** | Bearer token |
| **Role** | Any authenticated user |

### Request Body (all fields optional)

```json
{
  "fullName": "Dr. Jane Smith",
  "email": "jane.smith@hospital.com",
  "username": "jsmith"
}
```

| Field | Type | Notes |
|-------|------|-------|
| `fullName` | string | Max 100 chars |
| `email` | string | Must be unique |
| `username` | string | 3–50 chars, must be unique |

> Cannot change `role` or `status` via profile update.

### Success Response (`200`)

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { }
}
```

Returns updated user object in `data`.

---

## 14. Change Own Password

| | |
|---|---|
| **Method** | `PATCH` |
| **URL** | `/users/change-password` |
| **Auth** | Bearer token |
| **Role** | Any authenticated user |

### Request Body

```json
{
  "currentPassword": "OldSecurePass1!",
  "newPassword": "NewSecurePass1!",
  "confirmPassword": "NewSecurePass1!"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `currentPassword` | string | Yes | Current account password |
| `newPassword` | string | Yes | Strong password (see rules) |
| `confirmPassword` | string | Yes | Must match `newPassword` |

### Success Response (`200`)

```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {}
}
```

### Error Responses

| Status | Message |
|--------|---------|
| `401` | `Current password is incorrect` |
| `400` | `Passwords do not match` |
| `400` | Password strength validation errors |

> Invalidates refresh token after password change.

---

# Access Control Summary

| Endpoint | ADMIN | PATHOLOGIST | USER | Public |
|----------|:-----:|:-----------:|:----:|:------:|
| `POST /auth/login` | ✓ | ✓ | ✓ | ✓ |
| `POST /auth/logout` | ✓ | ✓ | ✓ | |
| `POST /auth/refresh` | ✓ | ✓ | ✓ | ✓ |
| `GET /auth/me` | ✓ | ✓ | ✓ | |
| `GET /users` | ✓ | | | |
| `GET /users/:id` | ✓ | | | |
| `POST /users` | ✓ | | | |
| `PATCH /users/:id` | ✓ | | | |
| `DELETE /users/:id` | ✓ | | | |
| `PATCH /users/:id/status` | ✓ | | | |
| `POST /users/:id/reset-password` | ✓ | | | |
| `GET /users/profile` | ✓ | ✓ | ✓ | |
| `PATCH /users/profile` | ✓ | ✓ | ✓ | |
| `PATCH /users/change-password` | ✓ | ✓ | ✓ | |

---

# Token Usage

| Token | Lifetime | Usage |
|-------|----------|-------|
| **Access token** | 15 minutes (configurable) | `Authorization: Bearer <token>` on protected routes |
| **Refresh token** | 7 days (configurable) | `POST /auth/refresh` body; rotated on each refresh |

---

# Audit Events (logged automatically)

| Action | Trigger |
|--------|---------|
| `LOGIN` | Successful login |
| `LOGOUT` | Logout |
| `USER_CREATE` | Admin creates user |
| `USER_UPDATE` | Admin updates user / user updates profile |
| `USER_DELETE` | Admin deletes user |
| `PASSWORD_RESET` | Admin resets password |
| `PASSWORD_CHANGE` | User changes own password |
| `USER_ACTIVATE` | Admin sets status to `ACTIVE` |
| `USER_DEACTIVATE` | Admin sets status to `INACTIVE` |
