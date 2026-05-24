# Implementation Plan: AI Menu Ordering SaaS

**Branch**: `001-ai-menu-ordering` | **Date**: 2026-05-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-ai-menu-ordering/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a lean dine-in ordering POC for small and medium restaurants: managers
import menus from PDF/scan, approve AI-assisted menu drafts, customers order
from a table-specific web experience, an AI waiter can answer menu questions
and submit confirmed carts, and staff monitor orders from a dashboard. Use one
SvelteKit application with Tailwind CSS v4 and Supabase for database, auth,
storage, realtime order updates, and AI-facing server functions.

## Technical Context

**Language/Version**: TypeScript with SvelteKit and current Svelte release

**Primary Dependencies**: SvelteKit, Tailwind CSS v4, Supabase JavaScript
client, Supabase SSR helpers, Supabase CLI, Vitest, Playwright

**Storage**: Supabase PostgreSQL for restaurants, menus, table sessions,
orders, AI conversations, and summaries; Supabase Storage for uploaded menu
PDFs/scans

**Testing**: Vitest for unit and service tests; Playwright for critical
restaurant/customer/staff flows; Supabase migration validation for schema
changes

**Target Platform**: Responsive web app for restaurant staff desktops/tablets
and customer phones used on-site

**Project Type**: Single SvelteKit web application with Supabase backend
services

**Performance Goals**: Customer ordering feedback visible within 2 seconds for
95% of normal interactions; staff dashboard shows new orders within 5 seconds;
50-item menu import review can be completed in under 30 minutes

**Constraints**: POC/MVP scope only; minimum custom code and minimum libraries;
no remote delivery, pickup, or payment flow; AI actions require explicit
customer confirmation before order submission; restaurant-approved data is the
source of truth for AI answers

**Scale/Scope**: One deployable app supporting pilot restaurants, table-based
dine-in sessions, menu import/review, customer ordering, AI waiter chat, and
staff order monitoring

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Code Quality**: PASS. Single SvelteKit app avoids unnecessary service
  boundaries for the POC. Supabase owns backend persistence, auth, storage, and
  realtime concerns. New abstractions are limited to route-local form actions,
  shared Supabase clients, schema types, and small domain helpers for carts,
  menu import review, and order status transitions.
- **Testing Standards**: PASS. Plan includes Vitest coverage for cart rules,
  status transitions, AI action confirmation, and menu-import review helpers;
  Playwright coverage for manager import, customer order, AI-assisted order,
  and staff dashboard flows.
- **User Experience Consistency**: PASS. Plan defines separate but consistent
  manager, customer, and staff flows with explicit loading, empty, validation,
  success, failure, unavailable-item, and escalation states.
- **Performance Requirements**: PASS. Plan carries the spec budgets for
  customer feedback, realtime staff order visibility, and menu import review.
- **Exceptions**: None.

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-menu-ordering/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ai-actions.md
│   ├── supabase-schema.md
│   └── ui-routes.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app.css
├── app.html
├── hooks.server.ts
├── lib/
│   ├── components/
│   │   ├── customer/
│   │   ├── manager/
│   │   └── staff/
│   ├── server/
│   │   ├── ai.ts
│   │   ├── menu-import.ts
│   │   └── supabase.ts
│   ├── cart.ts
│   ├── order-status.ts
│   └── types.ts
├── routes/
│   ├── +layout.svelte
│   ├── +page.svelte
│   ├── manager/
│   │   ├── +layout.server.ts
│   │   ├── +layout.svelte
│   │   ├── menus/
│   │   ├── orders/
│   │   └── analytics/
│   └── table/[sessionCode]/
│       ├── +page.server.ts
│       └── +page.svelte
└── test/
    ├── setup.ts
    └── fixtures/

supabase/
├── migrations/
├── seed.sql
└── functions/
    ├── import-menu/
    └── ai-waiter/

tests/
├── e2e/
├── integration/
└── unit/
```

**Structure Decision**: Use one SvelteKit project at the repository root.
Supabase migrations and Edge Functions live under `supabase/`. This keeps the
POC deployable and understandable while still separating UI routes, shared
domain helpers, server-only Supabase access, and database/function artifacts.

## Complexity Tracking

No constitution violations or complexity exceptions are required.

## Phase 0: Research Summary

Research decisions are captured in [research.md](./research.md). Key outcomes:

- SvelteKit is the app shell because it provides routing, server-side loading,
  form actions, and deployment ergonomics without adding a separate backend.
- Tailwind CSS v4 is used through its Vite integration and a single CSS entry.
- Supabase is the backend boundary for auth, PostgreSQL, Storage, Realtime, row
  level security, and AI/server functions.
- The POC excludes payments, remote ordering, loyalty, kitchen display
  hardware, and multi-location enterprise administration beyond a simple
  location model.

## Phase 1: Design Summary

Design artifacts are generated:

- [data-model.md](./data-model.md) defines entities, relationships, validation
  rules, and order/menu-import state transitions.
- [contracts/supabase-schema.md](./contracts/supabase-schema.md) defines the
  Supabase tables, storage buckets, policies, and realtime expectations.
- [contracts/ui-routes.md](./contracts/ui-routes.md) defines manager, staff,
  customer, and public route behavior.
- [contracts/ai-actions.md](./contracts/ai-actions.md) defines AI waiter and
  menu import action contracts.
- [quickstart.md](./quickstart.md) defines setup, local run, and validation
  steps for the POC.

## Post-Design Constitution Check

- **Code Quality**: PASS. The design keeps one app boundary, routes map to
  user journeys, and shared logic is limited to reusable domain helpers.
- **Testing Standards**: PASS. Contracts and quickstart identify unit,
  integration, and Playwright validation for the high-risk flows.
- **User Experience Consistency**: PASS. UI route contracts require loading,
  empty, validation, unavailable, confirmation, escalation, and dashboard states.
- **Performance Requirements**: PASS. Supabase Realtime and lightweight
  SvelteKit routes support the stated POC budgets; validation steps are listed
  in quickstart.
- **Exceptions**: None.
