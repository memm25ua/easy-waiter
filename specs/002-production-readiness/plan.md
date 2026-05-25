# Implementation Plan: Production Readiness

**Branch**: `002-production-readiness` | **Date**: 2026-05-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-production-readiness/spec.md`

## Summary

Upgrade the MVP demo into a production-ready dine-in ordering product. Replace
in-memory demo state with Supabase-backed authentication, tenant isolation,
persistent restaurant operations, realtime order updates, OpenRouter-backed AI
assistance, English/Spanish product internationalization, a public marketing
landing page, and a Coolify deployment readiness path with smoke tests and
rollback guidance. Keep the existing single SvelteKit app boundary and extend
it with production-grade server helpers, policies, tests, locale utilities, and
documentation rather than adding a custom backend service.

## Technical Context

**Language/Version**: TypeScript with SvelteKit and current Svelte release

**Primary Dependencies**: SvelteKit, Tailwind CSS v4, Supabase JavaScript
client, Supabase SSR helpers, Supabase CLI, OpenRouter chat-completions API,
Vitest, Playwright, SvelteKit Node adapter for Coolify, and a local
dictionary-based i18n layer for English and Spanish product copy

**Storage**: Supabase PostgreSQL for restaurants, locations, staff
assignments, menus, table sessions, orders, AI audit events, marketing leads,
language preferences, and deployment smoke-test records; Supabase Storage for
menu imports

**Testing**: Vitest for domain, locale, and server helper tests; Supabase
migration/RLS tests for persistence and tenant isolation; Playwright for
account onboarding, staff auth, cross-tenant blocking, customer ordering, AI
confirmation, bilingual UI journeys, marketing landing, and deployment smoke
flows

**Target Platform**: Responsive production web app for public marketing,
restaurant staff desktop/tablet workflows, and customer phone ordering at
restaurant tables

**Project Type**: Single SvelteKit web application with Supabase as backend
boundary and Supabase Edge Functions or server-only SvelteKit actions for AI
and privileged operations

**Performance Goals**: 95% of customer ordering interactions show feedback
within 2 seconds; staff see submitted orders within 5 seconds; owner onboarding
to dashboard completes under 5 minutes; public landing first viewport renders
quickly enough to identify value and conversion action during usability review;
language switching between English and Spanish completes in under 10 seconds
without losing current workflow state

**Constraints**: Production secrets never reach the browser; all tenant-owned
data is protected by server-side checks and Supabase RLS; AI answers must use
restaurant-approved context; AI-created orders require exact confirmation;
manual ordering must work when AI is unavailable; product interface copy must
be available in English and Spanish while restaurant-provided content remains
as entered; no delivery, pickup, payments, loyalty, or kitchen hardware
integrations in this feature

**Scale/Scope**: Pilot-ready production app for multiple restaurants and
locations, with owner/staff accounts, durable menu/order operations, table
sessions, AI waiter flows, bilingual product UI, marketing conversion, and one
documented Coolify deployment path plus local/staging validation

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Code Quality**: PASS. The plan keeps one SvelteKit app and Supabase backend
  boundary, extends existing route/helper organization, and limits new
  abstractions to auth/session helpers, tenant-scoped data access helpers,
  locale resolution/dictionary helpers, OpenRouter adapter code, deployment
  health checks, and small domain modules.
- **Testing Standards**: PASS. Acceptance scenarios map to unit, integration,
  RLS, and Playwright tests, including cross-tenant isolation, AI confirmation
  regressions, and English/Spanish coverage for public, customer, account,
  staff, manager, and operational states.
- **User Experience Consistency**: PASS. Account, marketing, customer, staff,
  manager, AI fallback, language selection, and translated error/empty/success
  states are explicitly in scope with loading, validation, accessibility, and
  visual consistency expectations.
- **Performance Requirements**: PASS. The plan carries measurable budgets for
  customer feedback, staff realtime visibility, owner onboarding, landing
  conversion validation, and language switching without task loss.
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
│   ├── deployment-readiness.md
│   ├── i18n.md
│   ├── openrouter-ai.md
│   └── production-routes.md
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
│   │   ├── shared/
│   │   └── staff/
│   ├── i18n/
│   │   ├── dictionaries/
│   │   └── index.ts
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
│   │   ├── staff.ts
│   │   ├── supabase.ts
│   │   └── table-session.ts
│   ├── cart.ts
│   ├── order-status.ts
│   └── types.ts
├── routes/
│   ├── +layout.server.ts
│   ├── +layout.svelte
│   ├── +page.server.ts
│   ├── +page.svelte
│   ├── auth/
│   ├── health/
│   ├── manager/
│   ├── onboarding/
│   └── table/[sessionCode]/
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
├── setup/
└── unit/

docs/
├── deployment.md
└── smoke-tests.md
```

**Structure Decision**: Continue with one SvelteKit project at the repository
root. Supabase remains the backend boundary for auth, persistence, storage,
realtime, and RLS. OpenRouter is wrapped behind server-only helpers or Edge
Functions so the UI never handles provider secrets. English/Spanish product
copy is centralized in a local i18n dictionary module used by routes and
components, with locale resolution performed from explicit user choice,
persisted account/session preference, and browser/user locale fallback.
Deployment documentation and smoke tests live in `docs/` and `tests/e2e/`
instead of creating another service or repository.

## Complexity Tracking

No constitution violations or complexity exceptions are required.

## Phase 0: Research Summary

Research decisions are captured in [research.md](./research.md). Key outcomes:

- Use Supabase Auth with SvelteKit SSR cookie handling to keep staff sessions
  available in server loads/actions and browser navigation.
- Replace demo server state with tenant-scoped Supabase queries and RLS
  policies, verified by tests using two restaurant fixtures.
- Model staff access through owner/manager-created email invitations with
  explicit role/location scope.
- Use unguessable hashed customer table-session tokens for unauthenticated
  table ordering.
- Use a server-only OpenRouter adapter and deterministic order confirmation
  path for AI waiter actions.
- Keep the public landing page as the unauthenticated home route.
- Target Coolify as the explicit production deployment path first.
- Implement English and Spanish through a local dictionary-based i18n layer,
  resolving the default locale from explicit user choice, persisted preference,
  browser/user locale, then English fallback.

No unresolved `NEEDS CLARIFICATION` items remain.

## Phase 1: Design Summary

Design artifacts are captured in [data-model.md](./data-model.md),
[quickstart.md](./quickstart.md), and contracts under [contracts/](./contracts/).

Core additions and updates:

- `LanguagePreference` records the selected product language for authenticated
  users and anonymous table/marketing sessions when available.
- Product UI copy is translated for `en` and `es`; restaurant-provided menu
  names, descriptions, staff notes, and customer notes remain as entered.
- Locale selection must not break current sign-up, table ordering, AI
  confirmation, staff order update, or manager menu review state.
- AI prompts and fallback/escalation messages receive the selected locale for
  user-visible copy while preserving approved menu context boundaries.
- Smoke tests and quickstart validation now include bilingual public,
  customer, account, staff, manager, and operational flows.

## Post-Design Constitution Check

- **Code Quality**: PASS. Design keeps locale logic centralized and avoids
  route-by-route hard-coded translation branching.
- **Testing Standards**: PASS. Design calls for unit locale tests, route/form
  integration tests, and Playwright bilingual journeys.
- **User Experience Consistency**: PASS. Design defines language selector,
  locale fallback, long-label/mobile behavior, and translated states.
- **Performance Requirements**: PASS. Locale resolution and language switching
  have measurable budgets and are included in smoke validation.
- **Exceptions**: None.
