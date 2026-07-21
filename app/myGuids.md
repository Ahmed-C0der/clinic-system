# my mistakes and how i solved 



# techniques i have learnd

## react-pdf/renderer 
### why :
generate PDF in front or back depending on the goal so in this project we have used it in back end

### how to use it

1- in services/yourService.tsx  write your logic to get data and fill , use pdf/yourfilename.tsx as template to show it 

## PDF Generation (Service Layer)
// get data to fill and generate the pdf depend on pdf/PrescriptionTemplate.tsx as template if success save url in db

## TS 
### TS With obj
you use type Record<string, unknown> that mean the type of keys is string but type of valuse you don't know what type you will use it so put it unknown (better than any)
Example :
```TS
const selectedFields:Record<string , boolean>={name:true , email:true} 
selectedFields.phoneNumber = true;
```

### TS with ZOD

---

# Audit & Fix Log (July 2026)

## Section 1 — Authentication & Authorization

### 1.1 `prescription.controller.ts` — Missing `await` on `authenticate()`
- **Issue:** 8 `authenticate()` calls without `await` → returned unresolved Promise, role checks never ran.
- **Fix:** Added `await` before every `authenticate()` call (lines 69, 109, 131, 146, 158, 170, 181, 196).

### 1.2 `doctor.controller.ts` — Auth commented out on `list()`
- **Issue:** Auth was commented out, allowing anyone to list all doctors.
- **Fix:** Uncommented `authenticate(req, [Role.admin, Role.receptionist, Role.doctor, Role.patient])` on line 195.

### 1.3 `receptionist/actions.ts` — No auth checks
- **Issue:** All 6 exported functions (getDashboardKpis, getWeeklyOccupancy, getServiceDistribution, getRecentActivity, getDailyRevenue) had no authentication.
- **Fix:** Added `validateReceptionist()` helper that authenticates and checks role in one call. Applied to all functions.

### 1.4 `(admin portal)/_actions/adminDashboard.ts` — No auth
- **Issue:** All 5 dashboard functions had no auth.
- **Fix:** Added `validateAdmin()` helper, applied to all functions.

### 1.5 `actions/admin.ts`, `_actions/users.ts`, `_actions/medical-files.ts` — No auth
- **Issue:** All exported functions in these files had no authentication.
- **Fix:** Added `validateAdmin()` + auth checks to every exported function.

### 1.6 `invoices.controller.ts` — Broken `auth.user.patientId`
- **Issue:** Code referenced `auth.user.patientId` but access token payload doesn't have a `patientId` field (only: id, email, role, name, gender).
- **Fix:** Replaced with DB lookup `getPatientIdFromUserId(auth.user.id)` for patient-specific queries.

### 1.7 `medicalFile.controller.ts` — Same broken patientId
- **Issue:** Same pattern — `assertPatientAccess()` used non-existent `auth.user.patientId`.
- **Fix:** Resolves patient ID via `prisma.patient.findUnique({ where: { userId: auth.user.id } })`.

### 1.8 Portal Layouts — Missing auth guards
- **Issue:** Portal layouts didn't check auth before rendering.
- **Fix:** Added guards to admin layout (role=admin), doctor layout (role=doctor), patient layout (redirect if getPatientProfile fails), receptionist page (receptionist/admin roles).

### 1.9 `auth.controller.ts` logout — Wrong redirect
- **Issue:** Used `redirect("/login")` inside an API route handler, which throws NEXT_REDIRECT and doesn't set cookies/deletion.
- **Fix:** Replaced with `NextResponse.redirect()` + explicit cookie deletion.

## Section 2 — General Security

### 2.1 `lib/auth.ts` — Hardcoded JWT fallback secrets
- **Issue:** Fallback secrets in code (`'secret-clinic-key-for-jwt...'`) — insecure.
- **Fix:** Added `requireEnv()` function that throws in production if `JWT_SECRET` or `REFRESH_SECRET` are missing. Dev fallback is clearly marked as insecure.

### 2.2 `lib/auth.ts` — `httpOnly: false` in dev
- **Issue:** `saveTokenInCookies` set `httpOnly: false` in development.
- **Fix:** Always `httpOnly: true` regardless of environment.

### 2.3 All Controllers — Error message leaking
- **Issue:** ~25 catch blocks returned `e.message` to the client, leaking internal error details (DB errors, stack traces, paths).
- **Fix:** All changed to `console.error('Context:', e)` + `{ error: 'Generic message' }`. Affected controllers: auth, appointments, clinic (13 instances).

### 2.4 New: `lib/rate-limit.ts`
- **What:** Redis-based rate limiter using INCR + PEXPIRE.
- **Why:** No rate limiting existed on auth endpoints (brute-force risk).

### 2.5 `auth.controller.ts` — Rate limiting applied
- login: 5 requests/minute/IP
- register: 3 requests/minute/IP
- forgotPassword / resetPassword: 3 requests/minute/IP

## Section 3 — Pagination

### 3.1 `doctor.controller.ts` — Safety cap on availability filter
- **Issue:** When filtering by availability, ALL matching doctors were loaded into memory (`findMany` without `take`), then paginated with JS `.slice()`.
- **Fix:** Added `take: 200` safety cap.
- **Verdict:** 17 other `findMany` calls already properly paginated. 11 unpaginated ones are acceptable (small lookup tables, per-doctor schedules, date-bounded reports).

## Section 4 — App Flow

### 4.1 `login.tsx` — Wrong redirect targets
- **Issue:** Admin redirected to `/dashboard` (doesn't exist → 404), receptionist to `/receptionist-dashboard` (doesn't exist → 404).
- **Fix:** Admin → `/analytics`, Receptionist → `/receptionist`, Doctor → `/doctor-dashboard`, Patient → `/dashboard`.

### 4.2 `auth.controller.ts` logout — Wrong redirect path
- **Issue:** Redirected to `/auth/login` instead of `/login`.
- **Fix:** Changed to `/login`.

### 4.3 Four portal layouts — Wrong redirect path
- **Issue:** All auth failure redirects used `/auth/login` (9 occurrences).
- **Fix:** All changed to `/login`.

## Section 5 — Broken Links (In Progress)

| Broken Link | File(s) | Fix |
|---|---|---|
| `/admin/analytics` | admin-sidebar.tsx | → `/analytics` ✅ |
| `/admin/tables` | admin-sidebar.tsx | → `/tables` ✅ |
| `/admin/settings` | admin-sidebar.tsx | → `/settings` ✅ |
| `/admin/profile` | admin-sidebar.tsx | → `/adminProfile` ✅ |
| `/booking` | services/page.tsx, about/page.tsx | → `/doctors` |
| `/privacy` | forgot-password, reset-password pages | Needs page or remove |
| `/terms` | register.tsx, forgot-password | Needs page or remove |
| `/appointments` | step4.tsx | → `/dashboard/appointments` |
| `localhost:3000/api/...` | patients/[patientId]/page.tsx | Use relative path |
| `/doctor-dashboard/patients/${appointment.id}` | scheduelClient.tsx | Wrong ID (appointment vs patient) |
| `/doctor-dashboard/patients/${id}/prescription` | column.tsx | Route doesn't exist |

## Key Patterns Established

### Auth helper pattern (for server actions)
```ts
import { authenticate } from '@/lib/auth';
import { cookies } from 'next/headers';

async function validateRole(allowedRoles: string[]) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) throw new Error('Unauthorized');
  const payload = verifyAccessToken(token);
  if (!payload || !allowedRoles.includes(payload.role)) throw new Error('Forbidden');
  return payload;
}
```

### Rate limiting pattern
```ts
const rl = await rateLimit(rateLimitKey(req, 'endpoint-name'), { max: 5, windowMs: 60 * 1000 });
if (rl) return rl;
```

### Error handling (no message leaking)
```ts
catch (e) {
  console.error('Operation name:', e);
  return NextResponse.json({ error: 'Generic error message' }, { status: 500 });
}
```

### JWT secret validation
```ts
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    if (process.env.NODE_ENV === 'production') throw new Error(`Missing ${name}`);
    console.warn(`WARNING: ${name} not set. Using insecure fallback in dev.`);
    return `dev-fallback-${name}-...`;
  }
  return value;
}
```
