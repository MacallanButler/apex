# Apex Altitude — Design Brief for Antigravity

## Context
Apex's visual design is already fully built and should NOT be redesigned. This brief exists only to (a) document the existing system so Antigravity stays consistent, and (b) give direction for the handful of genuinely new UI elements the Rails backend introduces (payment, real-time status, auth).

## Existing Design System (extracted from `globals.css` — reuse exactly, do not invent new values)
- **Background**: near-black, `hsl(222.2 84% 4.9%)`
- **Foreground/text**: near-white, `hsl(210 40% 98%)`
- **Primary/accent**: burnt orange, `hsl(21 90% 48%)` — used for CTAs, active states
- **Secondary/muted/accent-bg**: dark slate, `hsl(217.2 32.6% 17.5%)`
- **Destructive**: deep red, `hsl(0 62.8% 30.6%)`
- **Border/input**: same dark slate as secondary
- **Radius**: `0.5rem`
- **Heading font**: Rajdhani (technical/aviation-adjacent, condensed, all-caps friendly)
- **Overall aesthetic**: dark, tactical, high-contrast — think flight-ops dashboard, not a friendly consumer app. Existing components (ComplianceChecklist, weather badges) lean into status colors (green/yellow/red) against the dark base.

## New UI Needed

**1. Stripe payment step (inside BookingWidget)**
- Use Stripe Elements in "flat" appearance mode, custom-themed to match: dark input backgrounds (`--color-input`), orange focus ring (`--color-primary`), Rajdhani for labels
- Show deposit amount vs. total clearly (e.g. "Deposit due now: $128 · Remaining $299 due at check-in") — don't bury this, skydiving customers are price-sensitive about surprise charges

**2. Live slot availability indicator**
- When a slot's capacity changes via Action Cable while a user is viewing it, use a brief highlight/pulse transition (Framer Motion is already a dependency — use it, don't add a new animation library) rather than an abrupt re-render, so it doesn't feel jarring
- Weather-driven status changes (GO→MARGINAL→NO-GO) should reuse the exact color mapping already in `getStatusColor()` (green/yellow/zinc-500) — do not introduce new status colors

**3. Auth pages (login/register)**
- Keep it minimal and consistent with the existing dark aesthetic — no separate "light mode" auth flow
- Role is never user-selectable in the UI post-refactor (that was the mock's RoleSwitcher, which is being removed) — a new registration always creates a Student; Instructor/Admin accounts are provisioned by an Admin, not self-service

**4. Guest → Account upsell prompt**
- Shown once, immediately after a successful guest booking confirmation — a single low-pressure card/banner ("Save this booking + waiver for next time — create an account"), not a modal blocking the confirmation itself. Should feel optional, not required.

## Explicitly Out of Scope
Do not touch: Hero, Navbar, Footer, Gallery, TrustSafety, FAQ, ExperienceTiers, or any marketing-page components — these have no backend dependency and are already finished.
