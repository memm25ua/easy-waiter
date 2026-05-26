# Implementation Plan: Complete App Workflows

**Branch**: `003-complete-app-workflows` | **Date**: 2026-05-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-complete-app-workflows/spec.md`

## Summary

Complete the production dine-in ordering workflows for all roles by extending
the existing production-readiness architecture with AI-assisted menu import,
reviewable menu drafts, owner/manager menu editing and publication, one stable
customer link/QR per table, customer ordering from the current active table
session, and staff fulfillment updates. PDF/image menu import will preserve the
source resource, extract OCR text, and call a server-side AI import agent with
both the uploaded resource reference and OCR text to produce a structured draft
with confidence warnings. Owners and managers must review critical fields
before publication; customers only see published menus through active table
sessions.

## Technical Context

**Language/Version**: TypeScript with SvelteKit and current Svelte release

**Primary Dependencies**: SvelteKit, Tailwind CSS v4, Supabase JavaScript
client, Supabase SSR helpers, Supabase CLI, Supabase Storage, OpenRouter
chat-completions API, a server-side OCR extraction step for menu files, Vitest,
Playwright, and the existing local English/Spanish dictionary layer

**Storage**: Supabase PostgreSQL for restaurants, locations, role assignments,
menu import jobs, OCR text, extraction warnings, menu drafts, published menu
versions, table sessions, customer orders, and AI audit events; Supabase
Storage for uploaded PDF/image menu source files

**Testing**: Vitest for domain logic, import normalization, warning
classification, conflict detection, role permissions, and locale copy tests;
Supabase migration/RLS tests for tenant isolation and table-session access;
Playwright for owner, manager, staff, and customer end-to-end workflows,
including import review, publication blocking, stable table links, ordering,
and fulfillment updates

**Target Platform**: Responsive production web app for restaurant owner and
manager desktop/tablet workflows, staff service dashboards, and customer phone
ordering at restaurant tables

**Project Type**: Single SvelteKit web application with Supabase as backend
boundary and server-only SvelteKit actions or Supabase Edge Functions for OCR,
AI import-agent calls, AI waiter calls, and privileged mutations

**Performance Goals**: 95% of normal customer menu browsing, cart updates, and
order submission interactions show visible feedback within 2 seconds; staff
see submitted orders within 5 seconds; a customer can open a table link,
browse, submit, and see confirmation within 3 minutes; owners/managers can
complete representative menu import review in under 10 minutes; AI import jobs
show queued/processing/failure/success state within 2 seconds of upload or
refresh

**Constraints**: Production secrets never reach the browser; uploaded menu
resources and OCR text remain tenant-scoped; AI import output is never
published without owner/manager review; critical import fields must be resolved
before publication; non-critical warnings may remain visible after publication;
customer table links are one stable entry point per table and only operate on
the current active table session; manual menu creation and ordering remain
available if OCR or AI import fails; restaurant-provided menu content remains
as entered and is not automatically translated

**Scale/Scope**: Pilot-ready multi-restaurant product for small and medium
restaurants with owner, manager, staff, and customer workflows; representative
menu imports include PDFs and images with multiple pages, multilingual content,
poor contrast, rotated pages, and incomplete extraction; delivery, pickup,
payments, loyalty, and kitchen hardware integrations remain out of scope

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Code Quality**: PASS. The plan keeps one SvelteKit app boundary and
  extends existing `src/lib/server/menu-import.ts`, `menu.ts`,
  `table-session.ts`, `orders.ts`, `ai.ts`, `openrouter.ts`, tenant helpers,
  manager routes, table routes, Supabase migrations, and tests. New
  abstractions are limited to import-job orchestration, OCR extraction,
  AI-agent normalization, menu version/conflict handling, and table-link
  session resolution.
- **Testing Standards**: PASS. Acceptance scenarios map to unit,
  integration, RLS, and Playwright coverage for import review, warning
  blocking, role permissions, concurrent menu conflicts, table-session links,
  customer orders, AI confirmation, staff fulfillment, and bilingual journeys.
- **User Experience Consistency**: PASS. The plan covers loading, queued,
  processing, empty, validation, conflict, success, failure, unauthorized,
  expired/closed session, and bilingual states for owner, manager, staff, and
  customer flows while preserving the existing design reference.
- **Performance Requirements**: PASS. Customer and staff interaction budgets
  remain from production readiness, and import processing adds explicit
  feedback-state and review-time budgets.
- **Exceptions**: None.

## Project Structure

### Documentation (this feature)

```text
specs/003-complete-app-workflows/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── menu-import-agent.md
│   ├── menu-management.md
│   ├── table-link-ordering.md
│   └── role-complete-smoke.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── components/
│   │   ├── customer/
│   │   ├── manager/
│   │   ├── shared/
│   │   └── staff/
│   ├── i18n/
│   │   ├── dictionaries/
│   │   └── index.ts
│   ├── server/
│   │   ├── ai.ts
│   │   ├── menu-import.ts
│   │   ├── menu.ts
│   │   ├── openrouter.ts
│   │   ├── orders.ts
│   │   ├── staff.ts
│   │   ├── supabase.ts
│   │   ├── table-session.ts
│   │   └── tenant.ts
│   ├── menu-publish.ts
│   ├── order-status.ts
│   └── types.ts
├── routes/
│   ├── manager/
│   │   ├── menus/
│   │   ├── orders/
│   │   └── staff/
│   └── table/[sessionCode]/
└── app.css

supabase/
├── migrations/
└── functions/
    ├── ai-waiter/
    └── import-menu/

tests/
├── e2e/
├── fixtures/
├── integration/
├── rls/
└── unit/
```

**Structure Decision**: Continue with the existing single SvelteKit project at
the repository root. Supabase remains the backend boundary for auth,
persistence, storage, realtime, and RLS. OpenRouter and OCR/import-agent work
stay behind server-only helpers or Edge Functions so the browser never handles
provider secrets. Manager menu import/editing uses `src/routes/manager/menus/`
and server helpers; customer ordering remains under `src/routes/table/[sessionCode]/`.

## Complexity Tracking

No constitution violations or complexity exceptions are required.

## Phase 0: Research Summary

Research decisions are captured in [research.md](./research.md). Key outcomes:

- Store every uploaded menu PDF/image as a tenant-scoped menu import resource.
- Run OCR extraction before AI normalization and persist OCR text with the
  import job for review, audit, and retry.
- Call a server-side AI import agent with the uploaded resource reference,
  OCR text, locale, restaurant/location scope, target currency, and a strict
  structured draft schema.
- Treat AI import as assistive: owners/managers must review, critical fields
  block publication, and non-critical warnings may remain visible.
- Use optimistic conflict detection for menu drafts and published menu edits.
- Model one stable customer link/QR per table that resolves to the table's
  current active session and blocks ordering after staff close/reset it.
- Keep customer order creation deterministic against the current published
  menu and reuse the AI waiter confirmation rule for any AI-created order.

No unresolved `NEEDS CLARIFICATION` items remain.

## Phase 1: Design Summary

Design artifacts are captured in [data-model.md](./data-model.md),
[quickstart.md](./quickstart.md), and contracts under [contracts/](./contracts/).

Core additions and updates:

- `MenuImportJob` tracks uploaded resource, OCR extraction, AI import-agent
  request/response, processing status, warnings, and review outcome.
- `MenuDraft`, `MenuDraftVersion`, `MenuCategory`, `MenuItem`, and
  `PublishedMenuSnapshot` distinguish editable drafts from customer-visible
  published menus and support conflict detection.
- `RestaurantTable` owns one stable customer entry token; `TableSession`
  represents the current active party/order context for that table.
- `CustomerOrder` records the deterministic submitted order and status history
  visible to staff and the originating table session.
- Contracts define import-agent input/output, menu publication rules, table
  link ordering behavior, and role-complete smoke coverage.

## Post-Design Constitution Check

- **Code Quality**: PASS. The design extends existing server modules and route
  areas with focused responsibilities and avoids introducing a second backend
  service.
- **Testing Standards**: PASS. The design identifies unit, integration, RLS,
  and Playwright tests mapped to import, menu editing, customer ordering,
  staff fulfillment, and role-complete smoke scenarios.
- **User Experience Consistency**: PASS. The design explicitly covers import
  review states, conflict review, customer link blocked states, order feedback,
  and English/Spanish product copy expectations.
- **Performance Requirements**: PASS. The design preserves customer/staff
  budgets and adds processing feedback expectations for long-running imports.
- **Exceptions**: None.
