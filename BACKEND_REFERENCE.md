# EdvantiQ Backend — Reference for Frontend Development

This document describes the current state of the EdvantiQ backend so a frontend can be
built against it without re-reading the whole codebase. It reflects the backend **as of
2026-06-30**, after a cleanup/bug-fix pass (see "Recent backend work" at the bottom).

EdvantiQ is a multi-tenant School Management SaaS. Every school is an isolated tenant
(`schoolId` on nearly every table). Full product spec: `EdvantiQ system design specification.md`
in the repo root.

---

## 1. Tech stack

- Backend: Node.js, Express 5, TypeScript (ESM, `NodeNext` modules)
- ORM: Prisma 5 + PostgreSQL
- Auth: JWT (7-day expiry), bcrypt password hashing
- Frontend (planned, **not started yet**): React + Vite + Tailwind CSS

## 2. Running the backend locally

```
cd backend
npm install
# .env needs DATABASE_URL (Postgres) and optionally JWT_SECRET (falls back to "dev_secret")
npx prisma migrate dev      # apply migrations
npx prisma generate         # regenerate client (run after any schema.prisma change)
npm run dev                 # nodemon + tsx, watches src/server.ts
```

Server listens on `process.env.PORT || 5000`. Base URL for all routes below: `http://localhost:5000`.

Quick health checks: `GET /` and `GET /test` (no auth).

---

## 3. Auth & request flow

1. `POST /api/schools` — creates a School + its default roles (ADMIN/TEACHER/STUDENT) + the
   first ADMIN user for that school. **⚠️ Currently has no auth guard at all — see Known Issues.**
2. `POST /api/auth/login` — body `{ email, password }` → returns `{ user: { id, email, role }, token }`.
   The JWT payload is `{ id, email, schoolId, role, iat, exp }`.
3. Every protected request sends `Authorization: Bearer <token>`.
4. `authMiddleware` verifies the JWT and sets `req.user = { id, email, schoolId, role }`.
5. `tenantMiddleware` then resolves `req.schoolId`:
   - Normal users: `req.schoolId = req.user.schoolId`.
   - `SUPER_ADMIN`: must send header `x-school-id`; middleware checks there's an **approved,
     unexpired** access request for that school (see Access Requests below) before allowing it.
6. Route-level guards on top of that:
   - `requirePermission(PERMISSIONS.X)` — granular permission check against the user's role
     (see RBAC section). `SUPER_ADMIN` bypasses all permission checks.
   - `rbac([...roles])` — simple role allow-list (e.g. `rbac(["ADMIN"])`). `SUPER_ADMIN` always
     allowed.
   - `requireSuperAdmin` — role must be exactly `SUPER_ADMIN`.

**Always read `schoolId` from `req.schoolId` (tenant-resolved), never `req.user.schoolId`,**
when writing backend code — this matters for the Super Admin cross-school access flow.

### Roles
`SUPER_ADMIN`, `ADMIN`, `TEACHER`, `STUDENT`, `PARENT`, `STAFF`. Roles are stored per-school in
the `Role` table (created via `setupSchoolDefaults` when a school is created: ADMIN, TEACHER,
STUDENT). PARENT and STAFF roles get created lazily — check before relying on them existing.

⚠️ There is currently **no implemented way to create a `SUPER_ADMIN` user** (no seed script, no
endpoint). This needs to be decided/built before the Super-Admin-access-request flow can be
exercised end-to-end. Flagged in Known Issues.

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
| POST | `/register` | 🔓 **public** | `{ email, password, fullName, role, schoolId }` | ⚠️ See Known Issues — lets caller self-assign any role incl. ADMIN. Recommend not using from the frontend; prefer onboarding endpoints. |
| POST | `/login` | 🔓 | `{ email, password }` | Returns `{ user: {id,email,role}, token }` |

### Schools — `/api/schools`
| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/` | 🔓 **public** | `{ name, type, location, adminEmail, adminPassword, adminName }` | Creates school + default roles + first ADMIN user. ⚠️ See Known Issues — currently has no auth guard. |

### Access Requests — `/api/access-requests` (Super Admin ↔ School Admin flow)
| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/request` | 🔑 SUPER_ADMIN | `{ schoolId }` | Super Admin requests temporary access to a school |
| GET | `/` | 🔑 ADMIN (own school) | — | List pending/approved/rejected requests for caller's school |
| PATCH | `/:id/approve` | 🔑 ADMIN | — | Approves; sets 2-hour `expiresAt` |
| PATCH | `/:id/reject` | 🔑 ADMIN | — | Rejects |

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
| POST | `/session` | CREATE_ATTENDANCE_SESSION | `{ classId, subjectId?, date }` — `teacherId` taken from caller |
| POST | `/mark` | MARK_ATTENDANCE | `{ sessionId, studentId, status: PRESENT\|ABSENT\|LATE }` |
| GET | `/sessions` | VIEW_ATTENDANCE | — all sessions for school |
| GET | `/:sessionId` | VIEW_ATTENDANCE | — records for one session |

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
| POST | `/` | 🔑 rbac(ADMIN) | `{ email, password, fullName, roleId, schoolId }` — note: takes a raw `roleId`, not a role name; frontend needs to fetch role IDs first (no "list roles" endpoint currently exists — gap, see Known Issues) |

### Audit — `/api/audit`
| Method | Path | Auth |
|---|---|---|
| GET | `/` | 🔑 rbac(ADMIN) — last 100 logs for the school, newest first |
| POST | `/` | 🔑 rbac(ADMIN) — manual log entry, mainly for testing |

---

## 7. Known issues / open decisions (read before building auth screens)

1. **`POST /api/auth/register` is fully public and lets the caller pick their own `role` and
   `schoolId`.** This is a privilege-escalation hole (anyone can self-register as ADMIN of any
   school). Don't build a public sign-up screen against it. It will likely be removed/locked
   down — confirm with backend owner before relying on it.
2. **`POST /api/schools` has no auth guard at all.** Per the product spec this should require a
   `SUPER_ADMIN`, but there's currently no way to create a `SUPER_ADMIN` account (no seed
   script / bootstrap flow exists yet). Until that's resolved, anyone can create schools. Don't
   expose a public "create your school" marketing-site flow against this endpoint as-is.
3. **No "list roles" endpoint** — `POST /api/users` needs a `roleId`, but nothing returns the
   roles for a school. The frontend will need either a new endpoint or to infer role IDs some
   other way. Flag this to the backend owner when you hit it.
4. Most non-ADMIN roles (TEACHER/STUDENT/PARENT/STAFF) only have a handful of permissions
   wired up today (see RBAC section) — many screens will only make sense for ADMIN until that
   expands.
5. `Role`/`Permission` DB tables exist but aren't actually used for authorization — the live
   permission system is the static `ROLE_PERMISSIONS` map in code. Don't build a "manage
   custom roles" UI yet; it wouldn't do anything.
6. Frontend directory is currently **empty** — no scaffolding, no package.json, nothing.

## 8. Recent backend work (this pass)

For context on what's already been fixed, so you don't re-discover the same things:
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
- Fixed `teachers` update/delete routes checking the wrong permission constant
  (`CREATE_TEACHER` instead of `UPDATE_TEACHER`/`DELETE_TEACHER`).
- Fixed `/api/audit` having a duplicate, unguarded `GET /` route registered before the
  properly-guarded one (Express matches first-registered route, so the permission check was
  dead code).
- Removed several unused/dead duplicate files (`fees/controller.ts` + `fees/service.ts`,
  `middleware/roles.ts`, `middleware/superAdminMiddleware.ts`, `utils/permissions.ts`, empty
  scaffold files at `src/routes.ts`/`controller.ts`/`service.ts`).
- Deduplicated route mounts in `app.ts` (fees/attendance routers were mounted 2-3× each).

Items 1–3 in "Known issues" above were **found but intentionally left unfixed** pending a
product decision (they're not simple bugs — they need a bootstrap/auth-model decision). Ask
before building against them.
