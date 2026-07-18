# Apex Altitude — Rails API Backend — Technical Brief for Antigravity

## Context
Apex is an existing, fully-built Next.js 16 + TypeScript + Tailwind v4 + Radix + Framer Motion frontend for a skydiving dropzone booking platform. It currently fakes its entire backend via a hand-rolled mock Supabase client (`src/lib/supabase.ts`) backed by `localStorage`. This brief scopes a **real Rails 7 API backend** to replace that mock, wired into the existing frontend with minimal visual disruption. Do not rebuild the frontend UI — extend/rewire it.

The frontend already assumes a query-builder-shaped interface (`supabase.from('bookings').select().eq().insert().update()`). Do NOT preserve that shape as a shim — replace it with a proper typed API client (`src/lib/apiClient.ts`) that calls REST endpoints directly, and update every calling component accordingly (list below). This is a genuine refactor, not a compatibility patch.

## Stack
- **Backend**: Ruby on Rails 8.1.3, API-only mode
- **Database**: SQLite in development (embedded), PostgreSQL 16 in production
- **Background jobs**: Solid Queue (Rails 8 default, database-backed)
- **Real-time**: Action Cable (Solid Cable default in Rails 8, database-backed)
- **Auth**: Devise + `devise-jwt` (stateless JWT, since frontend and API are cross-origin)
- **Authorization**: Pundit (policy per role: Guest/unauthenticated, Student, Instructor, Admin)
- **Payments**: Stripe (PaymentIntents API, deposit-only charge)
- **Weather**: NOAA/NWS API (free, no key required) for real GO/MARGINAL/NO-GO conditions, polled on a schedule and cached
- **Email**: ActionMailer + Resend (or Postmark) for booking confirmations, waiver receipts, weather-hold notices
- **Deployment**: Rails API + Postgres + Redis (or Solid Queue on Postgres) + background worker all on **Render** (web service + background worker + managed Postgres). Next.js frontend stays on **Vercel**; set `NEXT_PUBLIC_API_URL` to the Render API URL and configure CORS on Rails (`rack-cors`) to allow the Vercel domain.

## Data Models

```
User
  - email, encrypted_password (Devise)
  - role: enum [student, instructor, admin]  # guest = no User record
  - name, phone
  - jwt_denylist (for devise-jwt revocation)

Profile-equivalent fields live directly on User (no separate profiles table needed —
simpler than the mock's split, and this is worth noting as a deliberate simplification).

TimeSlot
  - date (date), time (string, e.g. "09:00 AM")
  - capacity (integer)
  - location (string, default "Main Dropzone")
  - weekday-derived max capacity is enforced in a service, not a DB constraint,
    since Admin can override (matches existing AdminSlotManager UI)
  - unique index on [date, time, location]

Booking
  - user_id (nullable, references User)          # nullable = guest booking
  - guest_name, guest_email, guest_phone (nullable, required if user_id is nil)
  - time_slot_id (references TimeSlot)
  - package (enum: tandem, solo, sunset)
  - instructor_id (nullable, references User where role=instructor)
  - extras (jsonb array, e.g. ["video","photos","insurance"])
  - total_cents (integer)
  - status (enum: pending_payment, scheduled, completed, cancelled)
  - stripe_payment_intent_id
  - deposit_paid_cents
  - validates: either user_id OR (guest_name + guest_email) must be present

WaiverAcknowledgment
  - booking_id (references Booking)
  - age_confirmed, weight_confirmed, health_confirmed, alcohol_confirmed, risk_acknowledged (booleans)
  - signed_at (datetime)
  - ip_address (string, for a basic audit trail)
  - all must be true before Booking can transition out of pending_payment

WeatherReading (cache table, not per-request live calls)
  - recorded_at (datetime)
  - wind_kts, ceiling_ft, temp_f, visibility (string)
  - status (enum: go, marginal, no_go)
  - refreshed by a scheduled Sidekiq job every 15 min during operating hours
```

## API Endpoints (all under `/api/v1`)

**Auth**
- `POST /auth/register` — creates User (student role by default)
- `POST /auth/login` — returns JWT
- `DELETE /auth/logout` — revokes JWT (denylist)
- `POST /auth/guest_upgrade` — converts a completed guest Booking into a new account by matching guest_email, offered post-booking

**Public / Guest-accessible**
- `GET /time_slots?date_from=&date_to=` — availability (computed via `SlotAvailabilityService`, includes current weather status)
- `GET /weather/current` — latest cached WeatherReading
- `POST /bookings` — create booking (guest or authenticated; requires nested waiver params in the same request — booking cannot be created without a complete waiver payload)
- `POST /bookings/:id/payment_intent` — creates Stripe PaymentIntent for the deposit, returns client_secret
- `POST /webhooks/stripe` — Stripe webhook, confirms payment, flips Booking to `scheduled`, triggers confirmation email

**Student (authenticated)**
- `GET /bookings/mine`
- `GET /bookings/:id`

**Instructor (authenticated, role=instructor)**
- `GET /bookings?date=` — manifest for a given day, sorted by time (matches existing InstructorDashboard sort logic)
- `PATCH /bookings/:id/status` — update status (scheduled → completed), broadcasts via Action Cable so any open instructor/admin views update live

**Admin (authenticated, role=admin)**
- Full CRUD on `TimeSlot` (`GET/POST/PATCH/DELETE /time_slots`) — matches AdminSlotManager UI exactly
- `GET /bookings` — all bookings, filterable
- `PATCH /users/:id/role` — role management

## Business Logic / Service Objects
- `SlotAvailabilityService` — recreates the existing weekday(max 8)/weekend(max 20)/Monday-closed rules from `scheduling.ts`, but now against real booking counts instead of a deterministic hash, and folds in the current cached weather status (NO-GO closes the day, MARGINAL reduces effective capacity by 30%, matching the existing frontend logic exactly)
- `BookingCreationService` — wraps booking + waiver creation in a transaction; uses a DB-level row lock (`SELECT ... FOR UPDATE`) on the TimeSlot during creation to prevent double-booking races — this is the concurrency story worth highlighting in the case study
- `WeatherPollingJob` (Solid Queue, scheduled) — hits NOAA/NWS, classifies GO/MARGINAL/NO-GO using the same thresholds as `useLiveWeather.ts` (wind >25kt or ceiling <4000ft = NO-GO; wind >15kt or ceiling <7000ft = MARGINAL), writes a new WeatherReading, broadcasts the change via Action Cable if status changed
- `StripeDepositService` — calculates deposit (recommend 30% of `total_cents`, confirm with client-facing copy), creates PaymentIntent, handles webhook confirmation

## Real-Time (Action Cable)
- `SlotsChannel` — clients subscribed to a date range receive a broadcast when a TimeSlot's remaining capacity changes (on booking creation) or when WeatherReading changes status. Frontend booking widget listens and updates the displayed availability without a refresh — this directly prevents a user from booking a slot that just filled.

## Security
- Pundit policy per role on every controller action; guest actions are explicitly whitelisted, not "no policy"
- Stripe webhook signature verification (never trust unverified webhook payloads)
- Rate limit `/bookings` creation (rack-attack) to prevent slot-hoarding abuse
- JWT short expiry (15 min access) is out of scope for a portfolio demo's complexity budget — use a longer-lived JWT (7 days) with denylist-based logout, and note in the case study that short-lived + refresh tokens would be the production hardening step

## Frontend Integration — Exact Files to Change
- `src/lib/supabase.ts` — **delete**, replaced by `src/lib/apiClient.ts` (typed fetch wrapper: `getSlots()`, `createBooking()`, `login()`, etc.)
- `src/lib/supabaseClient.ts` — delete (dead placeholder file, unused real Supabase config)
- `src/lib/rbac.ts` — delete the Zustand client-fakeable role store; role now comes from the decoded/verified JWT via `apiClient`, exposed through `UserContext.tsx`
- `src/components/features/RoleSwitcher.tsx` — delete (it exists only to fake RBAC; a real login flow replaces it)
- `src/lib/UserContext.tsx` — rewrite to hold the real authenticated user + role from the API, not Supabase auth
- `src/app/login/page.tsx` — rewire to call `apiClient.login()`
- `src/app/admin/page.tsx`, `src/app/instructor/page.tsx` — rewire data fetching from `supabase.from(...)` to `apiClient` methods; keep all existing JSX/layout/styling untouched
- `src/components/features/AdminSlotManager.tsx` — rewire CRUD calls to `apiClient`
- `src/components/features/BookingWidget.tsx` — rewire to call `apiClient.createBooking()`, integrate Stripe Elements for the deposit payment step, subscribe to `SlotsChannel` for live availability
- `src/components/features/ComplianceChecklist.tsx` — on completion, its checked state now gets submitted as the WaiverAcknowledgment payload alongside the booking, not just held in local component state
- `src/hooks/useLiveWeather.ts` — replace the simulated interval with a fetch to `GET /weather/current` (poll every 60s) or an Action Cable subscription

## Seed Data
Seed `db/seeds.rb` with equivalents of the existing mock: one admin, one instructor ("Sarah Connor"), one student ("Jane Doe"), 30 days of time slots (skip Mondays, weekday cap 8 / weekend cap 20), and the 3 sample bookings from `supabase.ts` (2 guest, 1 student) so the demo looks populated immediately on deploy.
