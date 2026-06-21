# TastyTable — technical overview

A deep-dive into the architecture and the decisions worth explaining. For setup and a feature tour see
[`README.md`](README.md).

## Shape

```
tastytable/
├── backend/                          NestJS 11 (modular)
│   └── src/
│       ├── users / restaurants / reservations   schemas (Mongoose), services, controllers
│       ├── availability             the booking engine (slots, free-table search)
│       ├── auth                     JWT + rotating refresh, guards, roles
│       ├── owner                    owner-only panel (composes restaurants + reservations)
│       └── database                 idempotent seed (Portland dining scene)
├── frontend/                         Ionic 8 + Angular 20 (standalone + signals, PWA)
│   └── src/app/{core, shared, features}
│   └── e2e/                          Playwright (auth, booking, owner, tour)
└── docker-compose.yml                MongoDB (port 27018)
```

## The availability engine (the core)

`AvailabilityService` turns a restaurant's service window + tables and the day's confirmed bookings into
per-slot availability:

- **Slots** are generated from `openTime` → `lastSeating` in `slotMinutes` steps.
- **Occupancy** is a `Map<time, Set<tableLabel>>` built from that date's `confirmed` reservations.
- A slot is **available** if at least one table large enough for the party (in the requested area, if any)
  is not already held at that time.
- **`findFreeTable`** picks the **smallest fitting** free table, so large tables stay open for larger
  parties. Booking holds that specific table for the (date, time) — the unit of contention is the table-slot.

Because availability is pure given (restaurant, bookings), it's unit-tested against a fake reservation model
with no database.

## Data model

- **Restaurant** embeds its `tables[]` ({label, capacity, area}) and `menu[]`, plus the service window and
  `seatingAreas`. A text index backs search.
- **Reservation** references restaurant + user but **denormalizes** `restaurantName` and `guestName` so lists
  render without populate; the slot is stored as `date` ("YYYY-MM-DD") + `time` ("HH:mm") and a held
  `tableLabel`. Status is `confirmed | cancelled | completed`.
- **User** carries the `role` (`diner | owner`) and, for owners, the `restaurantId` they manage.

`mine()` populates the restaurant for slug/address/photo and splits results into **upcoming** (confirmed and
future) vs **history** (everything else), sorted in opposite directions.

## Auth & authorization

- Passwords hashed with **bcryptjs**; short-lived JWT access tokens via `@nestjs/jwt`.
- **Refresh tokens** are opaque random strings stored only as a SHA-256 hash; refreshing **rotates** them, and
  reusing a rotated token revokes the whole family (reuse detection).
- Brute-force **lockout** after 5 failed logins (15 min).
- A custom `JwtAuthGuard` verifies the bearer and attaches the user; `RolesGuard` + `@Roles` gate diner-only
  (`/reservations`) and owner-only (`/owner/*`) routes. The JWT payload carries `role` + `restaurantId`, so
  authorization needs no extra DB round-trip.

## Frontend

- **Standalone + signals.** The Ionic CLI scaffolds NgModules; the app was converted to `bootstrapApplication`
  with `provideIonicAngular({mode:'ios'})` and `IonicRouteStrategy`. Route params bind to component inputs via
  `withComponentInputBinding`.
- **Design.** Tailwind v4 (`@theme` tokens: terracotta/wine/cream/cocoa + Lora/Outfit) for the custom warm UI,
  layered over an Ionic theme; Ionic components live in shadow DOM so Tailwind's preflight doesn't fight them.
  Dark mode is disabled — this app is warm-light only.
- **State.** `AuthService` holds tokens + user in signals (persisted to `localStorage`); an HTTP interceptor
  attaches the bearer and transparently refreshes once on 401. Role-aware guards route the landing path
  (diner → discover, owner → restaurant panel).
- **Booking UX.** The detail screen's selector loads availability reactively as date/party/area change; a
  reusable `TicketComponent` renders the perforated stub (with a `celebrate` flag) for both the post-booking
  confirmation and the history view.
- **Guided demo.** `DemoService` exposes **role-specific** tour steps (`computed` from `auth.role()`), a
  coach-mark `TourComponent` (spotlight measured from `getBoundingClientRect`) and a "How to explore" sheet
  with a role badge and a cross-role hint. The tour auto-starts once per browser (`tt-tour-seen`).
- **PWA.** `@angular/pwa` (branded manifest + ngsw); the production build emits the service worker.

## Notable trade-offs

- **Mongoose 9 string→ObjectId casting** is not automatic in `find({ userId })` / `create`, so ids are wrapped
  with `new Types.ObjectId(...)` in queries and on write (otherwise a booking saved with a string `userId`
  wouldn't be found by the ObjectId-cast query).
- Mongoose 9 union-typed `@Prop`s (role / status / photo) need an explicit `{ type: String }`, and the filter
  type was renamed `FilterQuery` → `QueryFilter`.
- "Today" availability returns the full window regardless of the current time; the create endpoint is the one
  that rejects past slots, keeping the engine pure.
