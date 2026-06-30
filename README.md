# EdvantiQ

EdvantiQ is a multi-tenant School Management SaaS. Every school is an isolated tenant (`schoolId` on nearly every table), with a platform-level Super Admin layer for cross-school administration.

Full product spec: [EdvantiQ system design specification.md](EdvantiQ%20system%20design%20specification.md). Backend API reference for frontend development: [BACKEND_REFERENCE.md](BACKEND_REFERENCE.md).

## Tech stack

- **Backend**: Node.js, Express 5, TypeScript (ESM, `NodeNext` modules)
- **ORM**: Prisma 5 + PostgreSQL
- **Auth**: JWT (7-day expiry), bcrypt password hashing
- **Frontend**: React + Vite + Tailwind CSS + React Router

## Project structure

```
backend/    Express API, Prisma schema/migrations
frontend/   React + Vite client
```

## Getting started

### Backend

```
cd backend
npm install
# .env needs: DATABASE_URL (Postgres), JWT_SECRET
npx prisma migrate dev      # apply migrations
npx prisma generate         # regenerate client after schema.prisma changes
npm run dev                 # nodemon + tsx, watches src/server.ts

# One-time, after the DB is migrated: bootstrap the platform Super Admin account.
# Set SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD (12+ chars) / SUPER_ADMIN_NAME in .env first.
npm run seed:super-admin
```

Server listens on `process.env.PORT || 5000`. Health checks: `GET /` and `GET /test` (no auth required).

In production, `ALLOWED_ORIGINS` (comma-separated frontend origins) must be set — the server refuses to boot without it when `NODE_ENV=production`.

### Frontend

```
cd frontend
npm install
npm run dev
```

See [BACKEND_REFERENCE.md](BACKEND_REFERENCE.md) for the full auth flow, RBAC model, and API surface.
