# EdvantiQ Backend — Reference for Frontend Development

This document describes the current state of the EdvantiQ backend so a frontend can be
built against it without re-reading the whole codebase. It reflects the backend **as of
2026-06-30**, after two cleanup/bug-fix/hardening passes (see "Recent backend work" at the
bottom). The backend is now in a solid, security-reviewed state — see section 7 for the
one remaining real gap (no "list roles" endpoint).

EdvantiQ is a multi-tenant School Management SaaS. Every school is an isolated tenant
(`schoolId` on nearly every table). Full product spec: `EdvantiQ system design specification.md`
in the repo root.

---

## 1. Tech stack

- Backend: Node.js, Express 5, TypeScript (ESM, `NodeNext` modules)
- ORM: Prisma 5 + PostgreSQL
- Auth: JWT (7-day expiry), bcrypt password hashing
- Frontend: React + Vite + Tailwind CSS + React Router, in `frontend/` — built and wired up to
  every endpoint below, including a Super Admin "Platform" page (`frontend/src/pages/PlatformPage.tsx`)
  for the cross-school access-request flow. `frontend/src/lib/api.ts` is the single HTTP client;
  keep it in sync with this doc when either side changes.

## 2. Running the backend locally

```
cd backend
npm install
# .env needs: DATABASE_URL (Postgres), JWT_SECRET (server now refuses to boot in
# production without it; dev falls back to an insecure default with a console warning)
npx prisma migrate dev      # apply migrations
npx prisma generate         # regenerate client (run after any schema.prisma change)
npm run dev                 # nodemon + tsx, watches src/server.ts

# One-time, after the DB is migrated: bootstrap the platform Super Admin account.
# Set SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD (12+ chars) / SUPER_ADMIN_NAME in .env first.
npm run seed:super-admin
```

Server listens on `process.env.PORT || 5000`. Base URL for all routes below: `http://localhost:5000`.

In production, set `ALLOWED_ORIGINS` (comma-separated list of allowed frontend origins) —
the server throws on boot if it's missing and `NODE_ENV=production`. In dev, CORS allows
all origins if `ALLOWED_ORIGINS` is unset.

Quick health checks: `GET /` and `GET /test` (no auth).

---

## 3. Auth & request flow

1. **Bootstrap (one-time, ops task, not a frontend flow)**: `npm run seed:super-admin` creates
   the platform's first `SUPER_ADMIN` user from env vars. Super Admins have `schoolId: null` —
   they're platform-level accounts, not tied to any school.
2. `POST /api/schools` — **requires a `SUPER_ADMIN` bearer token.** Creates a School + its
   default roles (ADMIN/TEACHER/STUDENT) + the first ADMIN user for that school.
3. `POST /api/auth/login` — body `{ email, password }` → returns `{ user: { id, email, role }, token }`.
   The JWT payload is `{ id, email, schoolId, role, iat, exp }` (`schoolId` is `null` for
   Super Admins). Rate-limited: 20 requests / 15 min per IP across all of `/api/auth`.
4. Every protected request sends `Authorization: Bearer <token>`.
5. `authMiddleware` verifies the JWT and sets `req.user = { id, email, schoolId, role }`.
6. `tenantMiddleware` then resolves `req.schoolId`:
   - Normal users: `req.schoolId = req.user.schoolId`.
   - `SUPER_ADMIN`: must send header `x-school-id`; middleware checks there's an **approved,
     unexpired** access request for that school (see Access Requests below) before allowing it.
7. Route-level guards on top of that:
   - `requirePermission(PERMISSIONS.X)` — granular permission check against the user's role
     (see RBAC section). `SUPER_ADMIN` bypasses all permission checks.
   - `rbac([...roles])` — simple role allow-list (e.g. `rbac(["ADMIN"])`). `SUPER_ADMIN` always
     allowed.
   - `requireSuperAdmin` — role must be exactly `SUPER_ADMIN`.

**Always read `schoolId` from `req.schoolId` (tenant-resolved), never `req.user.schoolId`,**
when writing backend code — this matters for the Super Admin cross-school access flow.

There is **no public self-registration endpoint** — per the product spec, all accounts are
created by an Admin via `/api/onboarding/*` or `/api/users`. Don't build a public sign-up
screen; there isn't one to call.

### Roles
`SUPER_ADMIN`, `ADMIN`, `TEACHER`, `STUDENT`, `PARENT`, `STAFF`. Non-platform roles are stored
per-school in the `Role` table (created via `setupSchoolDefaults` when a school is created:
ADMIN, TEACHER, STUDENT). PARENT and STAFF roles get created lazily — check before relying on
them existing. `SUPER_ADMIN` is a single platform-wide `Role` row with `schoolId: null`.

---

## 4. Data model (Prisma schema, `backend/prisma/schema.prisma`)

Key models (all have `schoolId` except platform-level `School` itself):

- **School** — `id, name, type, location`
- **User** — `id, email (unique), password (bcrypt hash), fullName, phoneNumber?, address?,
  profileImageUrl?, emergencyContact?, position?, staffCode?, roleId?, schoolId`. One row per
  human; `student`/`teacher`/`staffProfile` are optional 1:1 profile extensions; `parentLinks`
  (via `ParentStudent`) link a PARENT user to their children.
- **Role** — `id, name, isSystem, schoolId?` + `permissions: Permission[]` (legacy/unused —
  the live permission model is the static `ROLE_PERMISSIONS` map, see RBAC below).
- **Student** — profile fields (`dateOfBirth, gender, address, phoneNumber, profileImageUrl,
  indexNo`), optional `userId` link, `enrollments, attendanceRecords, results, payments,
  StudentFee, Invoice, parentLinks`.
- **Teacher** — profile fields (`email, phoneNumber, address, qualification, employmentType,
  hireDate, profileImageUrl, subject`), optional `userId` link, `assignments,
  attendanceSessions`.
- **Class**, **Subject** — simple, `name` (+ `level` for Class).
- **Enrollment** — student↔class link, drives auto-generation of `StudentFee` rows.
- **TeacherAssignment** — teacher↔class↔subject link.
- **AttendanceSession** (class+subject+teacher+date) → **AttendanceRecord** (student + status:
  `PRESENT|ABSENT|LATE`).
- **Assessment** (`title, type: CA|EXAM|QUIZ, totalMark`, class+subject) → **AssessmentResult**
  (student, score, remark).
- **FeeStructure** (`title, amount, term`, per class) → **FeePayment** (per student) and
  **StudentFee** (per-student amount-due record, auto-created on enrollment/onboarding).
- **Invoice** → **InvoiceItem[]**. `status: UNPAID|PARTIAL|PAID`, recalculated whenever a
  payment is recorded.
- **Announcement**, **Message** (sender/receiver, school-wide or DM), **Notification**
  (per-user).
- **AccessRequest** — Super Admin's request to access a school. `status:
  PENDING|APPROVED|REJECTED`, `expiresAt` (2 hours after approval).
- **AuditLog** — `userId, schoolId?, action, entity?, entityId?, metadata (json)`.
- **ParentStudent** — join table, parent User ↔ Student, scoped by `schoolId`.

Run `npx prisma studio` for a live browsable view of the DB while developing the frontend.

---

## 5. RBAC permission list

Defined in `backend/src/rbac/permissions.ts` (`PERMISSIONS` object) and mapped to roles in
`backend/src/rbac/rolePermissions.ts` (`ROLE_PERMISSIONS`). Current mapping:

- **ADMIN**: every permission (`Object.values(PERMISSIONS)`).
- **TEACHER**: `MARK_ATTENDANCE, CREATE_ATTENDANCE_SESSION, VIEW_STUDENT, VIEW_ATTENDANCE,
  ENTER_RESULTS, VIEW_RESULTS`.
- **STAFF**: `VIEW_STUDENT, VIEW_FEES, VIEW_INVOICE`.
- **PARENT**: `VIEW_RESULTS, VIEW_ATTENDANCE, VIEW_FEES, VIEW_INVOICE`.
- **STUDENT**: `VIEW_RESULTS, VIEW_ATTENDANCE, VIEW_INVOICE`.

Full permission constants exist for students/teachers/classes/subjects/attendance/academics/
fees/invoices/communication/onboarding/school-admin areas (see the file for exact names like
`CREATE_STUDENT`, `UPDATE_CLASS`, `RECORD_PAYMENT`, etc.) — most are only actually wired to
routes for the modules below; some exist in the enum but aren't yet used by any route
(`GENERATE_*_REPORT` ones, `ADD_STUDENT_TO_CLASS`, etc. — useful to know they're "reserved" for
future report/management screens).

**Important for frontend**: a TEACHER, STUDENT, PARENT, or STAFF role only has a short
allow-list of permissions today. Most CRUD screens (students, teachers, classes, subjects,
fees, assessments) are effectively ADMIN-only until `ROLE_PERMISSIONS` is expanded. Plan the
UI around that (e.g. don't build a "Teacher creates a class" screen yet).

---

## 6. Full API reference

All paths are prefixed with `/api`. "Auth" column: 🔓 public, 🔑 authenticated (any role),
plus any specific role/permission requirement.

### Auth — `/api/auth`
| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/login` | 🔓 | `{ email, password }` | Returns `{ user: {id,email,role}, token }`. Rate-limited. |

No public registration endpoint exists. See section 3.

### Schools — `/api/schools`
| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/` | 🔑 SUPER_ADMIN | `{ name, type, location, adminEmail, adminPassword, adminName }` | Creates school + default roles + first ADMIN user. |
| GET | `/` | 🔑 SUPER_ADMIN | — | List all schools on the platform |
| GET | `/:id` | 🔑 ADMIN (own school) or SUPER_ADMIN | — | School details |
| PUT | `/:id` | 🔑 ADMIN (own school) or SUPER_ADMIN | `{ name?, type?, location? }` | |

### Access Requests — `/api/access-requests` (Super Admin ↔ School Admin flow)
| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/request` | 🔑 SUPER_ADMIN | `{ schoolId }` | Super Admin requests temporary access to a school |
| GET | `/mine` | 🔑 SUPER_ADMIN | — | Super Admin's own requests across all schools, with `school` included — drives the "Platform" page |
| GET | `/` | 🔑 ADMIN (own school) | — | List pending/approved/rejected requests for caller's school |
| PATCH | `/:id/approve` | 🔑 ADMIN | — | Approves; sets 2-hour `expiresAt` |
| PATCH | `/:id/reject` | 🔑 ADMIN | — | Rejects |

Frontend flow: Super Admin calls `/mine` + `/schools` on a "Platform" page, requests access, then
once `APPROVED` and unexpired, the client stores the school id (`x-school-id` sent automatically
on every subsequent request) and behaves like an ADMIN inside that school until they "exit".

### Onboarding — `/api/onboarding` (all 🔑 authenticated, tenant-scoped)
| Method | Path | Body |
|---|---|---|
| POST | `/student` | `{ fullName, indexNo?, classId, dateOfBirth?, gender?, address?, phoneNumber?, profileImageUrl? }` — auto-enrolls into class + generates `StudentFee` rows from the class's fee structures |
| POST | `/teacher` | `{ fullName, email, password, subject?, phoneNumber?, address?, qualification?, employmentType?, hireDate?, profileImageUrl? }` |
| POST | `/parent` | `{ fullName, email, password, studentIds: string[], phoneNumber?, address?, profileImageUrl?, emergencyContact? }` — links to existing students (must belong to same school) |
| POST | `/admin` | `{ fullName, email, password, phoneNumber?, address?, profileImageUrl?, position?, staffCode? }` |
| POST | `/staff` | `{ fullName, email, password, position }` |
| POST | `/` | `{ type: "STUDENT"\|"TEACHER"\|"PARENT"\|"ADMIN"\|"STAFF", payload: {...one of the above bodies} }` — generic dispatcher |

All onboarding endpoints require the corresponding Role (e.g. "TEACHER") to already exist for
the school — it's created automatically when the school is set up via `POST /api/schools`,
except PARENT/STAFF roles which must exist before use (created lazily on first use currently —
worth double-checking when wiring up the parent/staff onboarding screens).

### Students — `/api/students` (🔑 + tenant + permission)
| Method | Path | Permission | Body |
|---|---|---|---|
| POST | `/` | CREATE_STUDENT | `{ fullName, indexNo?, ... }` |
| GET | `/` | VIEW_STUDENT | — (returns all students + enrollments for the school) |
| GET | `/:studentId` | VIEW_STUDENT | — (+ enrollments, attendanceRecords, results, payments) |
| PUT | `/:studentId` | UPDATE_STUDENT | partial student fields |
| DELETE | `/:studentId` | DELETE_STUDENT | — |

### Teachers — `/api/teachers` (🔑 + tenant + permission)
Same CRUD shape as students. `GET /:teacherId` includes `assignments, attendanceSessions`.

### Classes — `/api/classes` (🔑 + permission, no per-route tenant middleware needed — global)
Same CRUD shape. `GET /:classId` includes enrollments(+student), teacherAssignments(+teacher,
+subject), feeStructures.

### Subjects — `/api/subjects` (🔑 + permission)
Same CRUD shape. `GET /:subjectId` includes teacherAssignments, assessments(+results).

### Enrollments — `/api/enrollments`
| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/` | 🔑 rbac(ADMIN, TEACHER) | `{ studentId, classId }` — also regenerates `StudentFee` rows for the new class |

### Teacher Assignments — `/api/assignments`
| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/` | 🔑 rbac(ADMIN) | `{ teacherId, classId, subjectId }` |

### Attendance — `/api/attendance` (🔑 + tenant + permission)
| Method | Path | Permission | Body |
|---|---|---|---|
| POST | `/session` | CREATE_ATTENDANCE_SESSION | `{ classId, subjectId?, date, teacherId? }` — `teacherId` is resolved from the caller's own Teacher profile (looked up by `userId`); pass it explicitly if an ADMIN with no Teacher profile is opening a session on a teacher's behalf, otherwise this 400s with a clear message |
| POST | `/mark` | MARK_ATTENDANCE | `{ sessionId, studentId, status: PRESENT\|ABSENT\|LATE }` — upserts on `(sessionId, studentId)`, so re-marking a student updates their status instead of creating a duplicate row |
| GET | `/sessions` | VIEW_ATTENDANCE | — all sessions for school, each with its `records` included |
| GET | `/:sessionId` | VIEW_ATTENDANCE | — records for one session |

⚠️ `teacherId` on `AttendanceSession` is a foreign key to `Teacher.id`, **not** `User.id` — don't
ever pass a raw `req.user.id` there directly (this was a real bug, found and fixed: every session
creation failed with an opaque FK-violation error until the controller started resolving the
Teacher row first).

### Academics / Assessments — `/api/academics` (🔑 + permission)
| Method | Path | Permission |
|---|---|---|
| POST | `/assessment` | CREATE_ASSESSMENT — `{ title, type: CA\|EXAM\|QUIZ, totalMark, classId, subjectId, academicYearId? }` |
| GET | `/assessment` | VIEW_ASSESSMENT |
| GET | `/assessment/:assessmentId` | VIEW_ASSESSMENT |
| PUT | `/assessment/:assessmentId` | UPDATE_ASSESSMENT |
| DELETE | `/assessment/:assessmentId` | DELETE_ASSESSMENT |

### Results — `/api/results` (🔑 + tenant + permission) — separate router, also has its own assessment-create
| Method | Path | Permission | Body |
|---|---|---|---|
| POST | `/assessment` | CREATE_ASSESSMENT | same as above |
| POST | `/enter` | ENTER_RESULTS | `{ assessmentId, studentId, score, remark? }` |
| GET | `/` | VIEW_RESULTS | all results for school |
| GET | `/student/:studentId` | VIEW_RESULTS | results for one student |

### Fees — `/api/fees` (🔑 + tenant + permission)
| Method | Path | Permission | Body |
|---|---|---|---|
| POST | `/structure` | CREATE_FEE_STRUCTURE | `{ title, amount, term?, classId, academicYearId? }` |
| GET | `/structures` | VIEW_FEES | — |
| GET | `/structure/:feeId` | VIEW_FEES | — |
| PUT | `/structure/:feeId` | UPDATE_FEE_STRUCTURE | partial |
| DELETE | `/structure/:feeId` | DELETE_FEE_STRUCTURE | — |
| POST | `/payment` | RECORD_PAYMENT | `{ studentId, feeId, amountPaid, method }` — also recalculates any existing invoice's status |
| GET | `/balance/:studentId` | VIEW_FEES | `{ totalFees, totalPaid, balance }` |
| POST | `/invoice/:studentId` | CREATE_INVOICE | generates invoice from current `StudentFee` rows |
| GET | `/invoices` | VIEW_INVOICE | — |
| GET | `/invoice/:invoiceId` | VIEW_INVOICE | — |

### Communication — `/api/communication`, `/api/messages`, `/api/notifications`
| Method | Path | Permission/Auth | Body |
|---|---|---|---|
| POST | `/communication/announcement` | CREATE_ANNOUNCEMENT | `{ title, message, type }` |
| GET | `/communication/announcements` | VIEW_ANNOUNCEMENT | — |
| GET | `/communication/announcement/:id` | VIEW_ANNOUNCEMENT | — |
| POST | `/messages/send` | SEND_MESSAGE | `{ receiverId?, content }` (no receiverId = broadcast-style, check school-wide semantics before relying on it) |
| GET | `/messages` | VIEW_MESSAGES | messages where caller is sender or receiver |
| GET | `/messages/:messageId` | VIEW_MESSAGES | — |
| GET | `/messages/inbox` | 🔑 | received messages |
| GET | `/messages/sent` | 🔑 | sent messages |
| POST | `/notifications` | 🔑 | `{ title, message, type, userId }` |
| GET | `/notifications` | 🔑 | notifications for caller |

### Users — `/api/users`
| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/` | 🔑 rbac(ADMIN) | `{ email, password, fullName, roleId }` — `roleId` must belong to caller's school (validated server-side) |
| GET | `/` | 🔑 any authenticated school member | — lightweight directory (`id, email, fullName, profileImageUrl, role.name`) for pickers like message recipients |
| GET | `/roles` | 🔑 rbac(ADMIN) | — list this school's `Role` rows, for populating the `roleId` field above |

### Self-service profile — `/api/me` (🔑 any authenticated user, no tenant middleware — works for SUPER_ADMIN too)
| Method | Path | Body |
|---|---|---|
| GET | `/` | — current user's profile |
| PUT | `/` | `{ fullName?, phoneNumber?, address?, profileImageUrl? }` |
| POST | `/change-password` | `{ currentPassword, newPassword }` (newPassword ≥ 8 chars) |

### Audit — `/api/audit`
| Method | Path | Auth |
|---|---|---|
| GET | `/` | 🔑 rbac(ADMIN) — last 100 logs for the school, newest first |
| POST | `/` | 🔑 rbac(ADMIN) — manual log entry, mainly for testing |

---

## 7. Known issues / open decisions

1. Most non-ADMIN roles (TEACHER/STUDENT/PARENT/STAFF) only have a handful of permissions
   wired up today (see RBAC section) — many screens will only make sense for ADMIN until that
   expands further.
2. `Role`/`Permission` DB tables exist but aren't actually used for authorization — the live
   permission system is the static `ROLE_PERMISSIONS` map in code. Don't build a "manage
   custom roles" UI yet; it wouldn't do anything.
3. All update (`PUT`) endpoints strip `id`/`schoolId`/`createdAt`/`updatedAt` from the request
   body server-side before applying it (`utils/sanitizeUpdate.ts`); the Student/Teacher update
   endpoints additionally whitelist their real columns so a stray field like `classId` (valid on
   other resources) is silently dropped instead of crashing. Sending protected/unknown fields in
   a PUT body is silently ignored, not an error.
4. JWT tokens are valid for 7 days with no revocation/logout mechanism (logout is purely a
   frontend "drop the token" action). If you need server-side session kill (e.g. for an admin
   "force logout" feature), that's not built — flag it if the product needs it.
5. `FeePayment` rows aren't linked to a specific `Invoice` in the schema, so `Invoice.paidAmount`
   in API responses is *derived* (sum of the student's total payments, capped at the invoice
   total) rather than stored. Fine for a student with one invoice at a time; would need a real
   `invoiceId` FK on `FeePayment` if multiple concurrent invoices per student become a thing.
6. Notification preferences (the toggles on the frontend Settings page) aren't backed by
   anything — there's no preferences table. The notifications themselves (`/api/notifications`)
   are real and working; only the on/off switches are cosmetic.

## 8. Recent backend work

**Pass 1 — compile/boot/correctness:**
- Removed ~130 stale OneDrive sync-conflict duplicate files across the repo, initialized git.
- Fixed `rbacMiddleware` (was checking permissions but every call site passed a role array —
  restored role-based checking).
- Fixed Prisma schema validation errors (missing inverse relations on `User`/`Student`).
- Fixed real DB/schema drift: `User`, `Student`, `Teacher` were missing several columns that
  existed in `schema.prisma` but were never migrated — added migration to sync.
- Removed a broken hardcoded `seedRoles()` call in `server.ts` that crashed every server boot
  (referenced a non-existent school id).
- Fixed ~20 cross-tenant IDOR bugs: `update`/`delete`/`findMany` calls that targeted a record by
  `id` alone without checking it belonged to the caller's `schoolId` (students, teachers,
  classes, subjects, assessments, fee structures, results, attendance records, access requests).
- Fixed parent onboarding storing **plaintext passwords** (every other onboarding path hashes;
  parent didn't).
- Fixed several controllers reading `req.user.schoolId` instead of the tenant-resolved
  `req.schoolId` (breaks the Super Admin cross-school access flow).
- Fixed `teachers` update/delete routes checking the wrong permission constant.
- Fixed `/api/audit` having a duplicate, unguarded `GET /` route shadowing the guarded one.
- Removed unused/dead duplicate files and deduplicated route mounts in `app.ts`.

**Pass 2 — Super Admin + full vulnerability sweep:**
- Made `User.schoolId` nullable so `SUPER_ADMIN` can be a true platform-level account with no
  home school (matches the product spec — "has NO default access inside schools").
- Built `npm run seed:super-admin` to bootstrap the first Super Admin from env vars (idempotent).
- Gated `POST /api/schools` behind `requireSuperAdmin` (was completely public before).
- **Removed `POST /api/auth/register` entirely** — it was a public privilege-escalation hole
  that let any caller self-assign `role: "ADMIN"` and any `schoolId`.
- Fixed mass-assignment: every update endpoint passed `req.body` straight into Prisma's `data:`,
  so a caller could include `schoolId` in a PUT body and reassign a record to a different
  tenant even though the `where` clause correctly checked the *current* school. Added
  `utils/sanitizeUpdate.ts` and applied it to every create/update controller.
- Found and fixed `subjects` delete endpoint that was still missing `schoolId` scoping (missed
  in pass 1).
- Added input validation: assessment `type` enum, attendance `status` enum, attendance session
  `date` parsing, result `score` bounds (0..totalMark), fee payment amount/method.
- Wired up `payment.service.ts`'s invoice-recalculation logic, which existed but was dead code —
  the live payment endpoint was creating `FeePayment` rows without ever updating the related
  `Invoice.status`.
- Sanitized error responses across all 26 controllers: raw `error.message` (which could leak
  Prisma internals, e.g. we observed `"Invalid \`prisma.user.create()\` invocation in
  D:\...\controller.ts:20:41..."` in a real response) is now routed through
  `utils/errorResponse.ts`, which logs the real error server-side and returns a generic message
  for anything that looks like an internal/Prisma error.
- Added `helmet` (security headers), `express-rate-limit` (20 req/15min on `/api/auth`, 600
  req/15min on the rest of `/api`), configurable CORS via `ALLOWED_ORIGINS` (fails to boot
  without it in production), and JWT_SECRET enforcement (fails to boot without it in production,
  warns loudly in dev).

All findings from both passes have been fixed.

**Pass 3 — frontend build-out + cross-stack hardening:**
The frontend (`frontend/`, React/Vite/Tailwind) was built out against the API above. While
wiring it up, several more real bugs surfaced — some backend, some frontend-only:
- **Critical backend bug**: `POST /api/attendance/session` used `req.user.id` as
  `AttendanceSession.teacherId`, but that FK points at `Teacher.id`, a different value — every
  attendance session creation failed with an opaque FK-violation error. Fixed to resolve the
  caller's Teacher profile (or accept an explicit `teacherId` from an ADMIN).
- Added a `(sessionId, studentId)` unique constraint on `AttendanceRecord` + switched
  `markAttendance` to an upsert — re-marking a student used to silently create duplicate rows.
- Added computed `paidAmount` to invoice responses (was `undefined` → frontend rendered `$NaN`).
- Added field allow-lists to the Student/Teacher update endpoints, on top of the existing
  blacklist-only `sanitizeUpdate` — a client accidentally including a foreign field like
  `classId` (legitimate on other resources, not on Student/Teacher) used to crash with a raw
  Prisma error instead of being dropped.
- Login response was missing `fullName`/`schoolId`/etc (only returned `id, email, role`) — broke
  the UI immediately after login (`name.split is not a function` on the undefined `fullName`).
- Expanded `TEACHER`/`STAFF`/`PARENT`/`STUDENT` permissions to include `VIEW_ANNOUNCEMENT`,
  `SEND_MESSAGE`, `VIEW_MESSAGES`, `VIEW_NOTIFICATIONS` (the frontend nav showed these pages to
  every role, but only ADMIN had permission to load them — every non-admin got a 403 on a page
  the UI told them they could visit).
- Added the previously-missing endpoints: `GET /api/users` (directory, any authenticated user),
  `GET /api/users/roles`, `GET/PUT /api/me` + `POST /api/me/change-password`,
  `GET/PUT /api/schools/:id`, `GET /api/schools` (Super Admin), `GET /api/access-requests/mine`,
  `PUT/DELETE /api/communication/announcement/:id`, `GET /api/fees/payments`,
  `GET /api/students/me` (self-service, STUDENT), `GET /api/students/my-children` (self-service,
  PARENT, via `ParentStudent`).
- Validated `createUser`'s `roleId` actually belongs to the caller's school (was trusted blindly).
- All of the above were verified with live end-to-end HTTP testing against a running server
  (school creation → admin login → teacher onboarding → class/student/fee/attendance/assessment/
  result CRUD → Super Admin access-request → approve → cross-school access), not just
  typechecking — every flow listed above was exercised for real and confirmed working.
