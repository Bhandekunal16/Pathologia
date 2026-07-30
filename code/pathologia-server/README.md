# Pathologist Friend — Backend API

Production-ready NestJS backend for the **Pathologist Friend** application with JWT authentication, RBAC, user management, audit logging, and email notifications.

## Tech Stack

- NestJS, MongoDB, Mongoose
- JWT + Passport, bcrypt
- Nodemailer (HTML templates)
- Swagger/OpenAPI, Pino logging
- Jest, Docker

## Prerequisites

- Node.js 20+
- MongoDB 7+ (or Docker)
- npm

## Quick Start

### 1. Install dependencies

```bash
cd code/pathologia-server
npm install
```

### 2. Configure environment

```bash
cp env.json.example env.json
```

Update `env.json` with your secrets (especially `JWT_SECRET` and `JWT_REFRESH_SECRET`).

For Vercel deployment, commit `env.json` to the project root or add the same keys as Vercel environment variables (Vercel vars take precedence over `env.json`).

### 3. Start MongoDB

Using Docker:

```bash
docker compose up mongo -d
```

Or use a local MongoDB instance.

### 4. Seed the first admin user

```bash
npm run seed
```

Requires `ADMIN_EMAIL`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD` in `env.json`.

### 5. Run the application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

API: `http://localhost:3000`  
Swagger docs: `http://localhost:3000/api/docs`

## Docker (full stack)

```bash
cp env.json.example env.json
docker compose up --build
```

## Vercel

Deploy from `code/pathologia-server` with zero-config NestJS support. Configuration is loaded from `env.json` at startup; Vercel environment variables override values from the file when both are set.

## API Overview

### Auth

| Method | Endpoint        | Description              |
|--------|-----------------|--------------------------|
| POST   | `/auth/login`   | Login with username/email |
| POST   | `/auth/logout`  | Logout (Bearer token)    |
| POST   | `/auth/refresh` | Refresh access token     |
| GET    | `/auth/me`      | Current user profile     |

### Users

| Method | Endpoint                      | Access    |
|--------|-------------------------------|-----------|
| GET    | `/users`                      | Admin     |
| GET    | `/users/:id`                  | Admin     |
| POST   | `/users`                      | Admin     |
| PATCH  | `/users/:id`                  | Admin     |
| DELETE | `/users/:id`                  | Admin     |
| PATCH  | `/users/:id/status`           | Admin     |
| POST   | `/users/:id/reset-password`   | Admin     |
| GET    | `/users/profile`              | Authenticated |
| PATCH  | `/users/profile`              | Authenticated |
| PATCH  | `/users/change-password`      | Authenticated |

## Response Format

**Success:**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

**Error:**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

## Roles

- `ADMIN` — full user management
- `PATHOLOGIST` — pathology features, own profile and password
- `USER` — own profile and password only

## Testing

```bash
npm test
npm run test:cov
```

## Project Structure

```
src/
├── auth/          # Authentication (JWT, login, refresh)
├── users/         # User management (repository pattern)
├── email/         # Nodemailer + HTML templates
├── audit/         # Audit logging
├── common/        # Guards, filters, interceptors, decorators
├── config/        # Configuration and validation
├── database/      # MongoDB connection
└── shared/        # Enums and shared types
```

## Security Features

- Helmet, CORS, rate limiting
- bcrypt password hashing
- JWT access + refresh token rotation
- Refresh tokens stored as hashes
- RBAC with guards and decorators
- Global validation pipe
- Sensitive fields excluded from responses
- Audit logging for auth and user actions

## License

UNLICENSED — private project.
