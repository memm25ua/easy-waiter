# Implementation Plan: Production Readiness

**Branch**: `002-production-readiness` | **Date**: 2026-05-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-production-readiness/spec.md`

## Summary

Upgrade the MVP demo into a production-ready dine-in ordering product. Replace
in-memory demo state with Supabase-backed authentication, tenant isolation,
persistent restaurant operations, realtime order updates, OpenRouter-backed AI
assistance, a public marketing landing page, and a deployment readiness path
with smoke tests and rollback guidance. Keep the existing single SvelteKit app
boundary and extend it with production-grade server helpers, policies, tests,
and documentation rather than adding a custom backend service.

## Technical Context

**Language/Version**: TypeScript with SvelteKit and current Svelte release

**Primary Dependencies**: SvelteKit, Tailwind CSS v4, Supabase JavaScript
client, Supabase SSR helpers, Supabase CLI, OpenRouter chat-completions API,
Vitest, Playwright, explicit SvelteKit deployment adapter selected during
implementation for the chosen host

**Storage**: Supabase PostgreSQL for restaurants, locations, staff
assignments, menus, table sessions, orders, AI audit events, marketing leads,
and deployment smoke-test records; Supabase Storage for menu imports

**Testing**: Vitest for domain and server helper tests; Supabase migration/RLS
tests for persistence and tenant isolation; Playwright for account onboarding,
staff auth, cross-tenant blocking, customer ordering, AI confirmation,
marketing landing, and deployment smoke flows

**Target Platform**: Responsive production web app for public marketing,
restaurant staff desktop/tablet workflows, and customer phone ordering at
restaurant tables

**Project Type**: Single SvelteKit web application with Supabase as backend
boundary and Supabase Edge Functions or server-only SvelteKit actions for AI
and privileged operations

**Performance Goals**: 95% of customer ordering interactions show feedback
within 2 seconds; staff see submitted orders within 5 seconds; owner onboarding
to dashboard completes under 5 minutes; public landing first viewport renders
quickly enough to identify value and conversion action during usability review

**Constraints**: Production secrets never reach the browser; all tenant-owned
data is protected by server-side checks and Supabase RLS; AI answers must use
restaurant-approved context; AI-created orders require exact confirmation;
manual ordering must work when AI is unavailable; no delivery, pickup,
payments, loyalty, or kitchen hardware integrations in this feature

**Scale/Scope**: Pilot-ready production app for multiple restaurants and
locations, with owner/staff accounts, durable menu/order operations, table
sessions, AI waiter flows, marketing conversion, and one documented deployment
path plus local/staging validation

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Code Quality**: PASS. The plan keeps one SvelteKit app and Supabase backend
  boundary, extends existing route/helper organization, and limits new
  abstractions to auth/session helpers, tenant-scoped data access helpers,
  OpenRouter adapter code, deployment health checks, and small domain modules.
- **Testing Standards**: PASS. Acceptance scenarios map to unit, integration,
  RLS, and Playwright tests, including cross-tenant isolation and AI
  confirmation regressions.
- **User Experience Consistency**: PASS. Account, marketing, customer, staff,
  and AI fallback states are explicitly in scope with loading, empty,
  validation, success, failure, escalation, and accessibility expectations.
- **Performance Requirements**: PASS. The plan carries measurable budgets for
  customer feedback, staff realtime visibility, owner onboarding, and landing
  conversion validation.
- **Exceptions**: None.

## Project Structure

### Documentation (this feature)

```text
specs/002-production-readiness/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── auth-and-tenancy.md
│   ├── openrouter-ai.md
│   ├── production-routes.md
│   └── deployment-readiness.md
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
│   │   ├── auth/
│   │   ├── customer/
│   │   ├── landing/
│   │   ├── manager/
│   │   └── staff/
│   ├── server/
│   │   ├── ai.ts
│   │   ├── analytics.ts
│   │   ├── auth.ts
│   │   ├── deployment-health.ts
│   │   ├── marketing-leads.ts
│   │   ├── menu.ts
│   │   ├── menu-import.ts
│   │   ├── onboarding.ts
│   │   ├── openrouter.ts
│   │   ├── orders.ts
│   │   ├── supabase.ts
│   │   └── table-session.ts
│   ├── cart.ts
│   ├── order-status.ts
│   └── types.ts
├── routes/
│   ├── +layout.server.ts
│   ├── +layout.svelte
│   ├── +page.svelte
│   ├── auth/
│   ├── onboarding/
│   ├── manager/
│   ├── table/[sessionCode]/
│   └── health/
└── test/
    ├── fixtures/
    └── setup.ts

supabase/
├── migrations/
├── seed.sql
└── functions/
    ├── ai-waiter/
    └── import-menu/

tests/
├── e2e/
├── integration/
├── rls/
└── unit/

docs/
├── deployment.md
└── smoke-tests.md
```

**Structure Decision**: Continue with one SvelteKit project at the repository
root. Supabase remains the backend boundary for auth, persistence, storage,
realtime, and RLS. OpenRouter is wrapped behind server-only helpers or Edge
Functions so the UI never handles provider secrets. Deployment documentation
and smoke tests live in `docs/` and `tests/e2e/` instead of creating another
service or repository.

## Complexity Tracking

No constitution violations or complexity exceptions are required.

## Phase 0: Research Summary

Research decisions are captured in [research.md](./research.md). Key outcomes:

- Use Supabase Auth with SvelteKit SSR cookie handling to keep staff sessions
  available in server loads/actions and browser navigation.
- Replace demo server state with tenant-scoped Supabase queries and RLS
  policies, verified by tests using two restaurant fixtures.
- Use OpenRouter through a server-only adapter that calls the chat-completions
  endpoint and normalizes responses into the existing AI waiter contract.
- Preserve manual ordering as the required fallback whenever AI is unavailable
  or confidence is insufficient.
- Add a public marketing route as the unauthenticated home page and move staff
  entry behind explicit sign-in/onboarding actions.
- Target one documented production deployment path first, with adapter,
  secrets, migrations, auth redirects, health checks, and rollback steps.

## Phase 1: Design Summary

Design artifacts are generated:

- [data-model.md](./data-model.md) defines production accounts, tenants,
  persistent operations, AI audit events, deployment environments, and leads.
- [contracts/auth-and-tenancy.md](./contracts/auth-and-tenancy.md) defines
  account, onboarding, staff assignment, and tenant isolation behavior.
- [contracts/openrouter-ai.md](./contracts/openrouter-ai.md) defines
  production AI request, response, confirmation, fallback, and audit contracts.
- [contracts/production-routes.md](./contracts/production-routes.md) defines
  public, auth, onboarding, manager, customer, and health route behavior.
- [contracts/deployment-readiness.md](./contracts/deployment-readiness.md)
  defines environment, smoke-test, health, and rollback requirements.
- [quickstart.md](./quickstart.md) defines local, staging, and production
  validation steps.

## Post-Design Constitution Check

- **Code Quality**: PASS. The design follows existing SvelteKit/Supabase
  boundaries and identifies small server-side helpers for auth, tenancy, AI,
  and health checks without adding unnecessary services.
- **Testing Standards**: PASS. The design requires tests for auth, RLS,
  persistence, AI confirmation/fallback, landing conversion, and deployment
  smoke scenarios before release.
- **User Experience Consistency**: PASS. Public, account, staff, customer, AI,
  and deployment error states have explicit route contracts and copy
  constraints.
- **Performance Requirements**: PASS. Existing customer and staff budgets are
  preserved and production onboarding/landing validation is added.
- **Exceptions**: None.
