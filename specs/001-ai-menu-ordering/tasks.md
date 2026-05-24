# Tasks: AI Menu Ordering SaaS

**Input**: Design documents from `/specs/001-ai-menu-ordering/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Automated tests are REQUIRED by the project constitution and plan.
Write tests before implementation tasks in each user-story phase and verify
they fail before implementing the behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the lean SvelteKit, Tailwind v4, Supabase, and test project structure.

- [ ] T001 Initialize package metadata and npm scripts for SvelteKit, Supabase, Vitest, and Playwright in package.json
- [ ] T002 Configure SvelteKit and Vite for the single web app in svelte.config.js and vite.config.ts
- [ ] T003 Configure Tailwind CSS v4 import and global app styles in src/app.css
- [ ] T004 Create root Svelte shell and HTML template in src/app.html, src/routes/+layout.svelte, and src/routes/+page.svelte
- [ ] T005 [P] Configure TypeScript and app environment typing in tsconfig.json and src/app.d.ts
- [ ] T006 [P] Configure Vitest setup and unit test folders in vitest.config.ts and tests/unit/
- [ ] T007 [P] Configure Playwright browser tests and base URL in playwright.config.ts and tests/e2e/
- [ ] T008 [P] Create local environment example for Supabase and AI keys in .env.example
- [ ] T009 [P] Initialize Supabase local project folders in supabase/config.toml, supabase/migrations/, supabase/functions/, and supabase/seed.sql

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared data, auth, Supabase, domain helpers, and demo seed data required before any user story can work.

**CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T010 Create Supabase schema migration for restaurants, locations, staff_members, restaurant_tables, menu_imports, menus, menu_sections, menu_items, menu_item_options, menu_item_option_values, table_sessions, ai_conversations, ai_messages, cart_proposals, and orders in supabase/migrations/001_initial_schema.sql
- [ ] T011 Add Supabase indexes, foreign keys, status checks, and updated_at triggers in supabase/migrations/001_initial_schema.sql
- [ ] T012 Add Supabase private menu-imports storage bucket migration in supabase/migrations/002_storage.sql
- [ ] T013 Add row level security policies for staff, table session, published menu, order, conversation, and service-role access in supabase/migrations/003_rls_policies.sql
- [ ] T014 Create demo restaurant, location, staff, tables, table sessions, and sample published menu seed data in supabase/seed.sql
- [ ] T015 Generate shared TypeScript domain types for restaurant, menu, table session, AI conversation, cart, and order entities in src/lib/types.ts
- [ ] T016 Implement Supabase browser, server, and service-role client helpers in src/lib/server/supabase.ts and src/lib/supabase.ts
- [ ] T017 Implement SvelteKit Supabase session loading and staff auth guard helpers in src/hooks.server.ts and src/lib/server/auth.ts
- [ ] T018 [P] Implement order status transition rules in src/lib/order-status.ts
- [ ] T019 [P] Implement cart validation, option validation, unavailable item blocking, and total calculation helpers in src/lib/cart.ts
- [ ] T020 [P] Implement shared money, date, and table label formatters in src/lib/format.ts
- [ ] T021 [P] Add unit tests for order status transitions in tests/unit/order-status.test.ts
- [ ] T022 [P] Add unit tests for cart validation and unavailable item blocking in tests/unit/cart.test.ts
- [ ] T023 Add integration test for staff access and table session access policies in tests/integration/supabase-access.test.ts
- [ ] T024 Add base responsive app navigation and auth-aware routing layout in src/routes/+layout.server.ts and src/routes/+layout.svelte
- [ ] T025 Add manager route protection and assigned location loader in src/routes/manager/+layout.server.ts and src/routes/manager/+layout.svelte

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel where dependencies allow.

---

## Phase 3: User Story 1 - Create A Digital Menu From Existing Menu (Priority: P1)

**Goal**: A manager uploads a PDF/scan, receives a structured draft menu, reviews flags and AI suggestions, and publishes a customer-ready menu.

**Independent Test**: Upload a representative menu and verify the manager can review, correct, improve, and publish a complete digital menu without manually entering every item.

### Tests for User Story 1

- [ ] T026 [P] [US1] Add menu import contract test for creating a draft with confidence flags in tests/integration/menu-import.test.ts
- [ ] T027 [P] [US1] Add menu publish gate unit tests for unresolved flags, required fields, and price validation in tests/unit/menu-publish.test.ts
- [ ] T028 [P] [US1] Add Playwright test for manager menu upload, review, suggestion edit, and publish flow in tests/e2e/manager-menu-import.spec.ts

### Implementation for User Story 1

- [ ] T029 [US1] Create menu import Edge Function scaffold and request validation in supabase/functions/import-menu/index.ts
- [ ] T030 [US1] Implement menu import server helper for upload records, draft menu creation, confidence flags, and suggestions in src/lib/server/menu-import.ts
- [ ] T031 [US1] Create manager menu list loader and upload action in src/routes/manager/menus/+page.server.ts
- [ ] T032 [US1] Build manager menu list, upload, processing, failed, and empty states in src/routes/manager/menus/+page.svelte
- [ ] T033 [US1] Create menu review loader and save/publish actions in src/routes/manager/menus/[menuId]/+page.server.ts
- [ ] T034 [US1] Build menu review editor for sections, items, prices, options, flags, and AI suggestions in src/routes/manager/menus/[menuId]/+page.svelte
- [ ] T035 [US1] Create reusable manager menu editor components in src/lib/components/manager/MenuSectionEditor.svelte and src/lib/components/manager/MenuItemEditor.svelte
- [ ] T036 [US1] Add item availability toggle handling in src/routes/manager/menus/[menuId]/+page.server.ts
- [ ] T037 [US1] Add published menu read model helper for customer and AI usage in src/lib/server/menu.ts
- [ ] T038 [US1] Validate US1 quickstart menu import pass criteria manually and record notes in specs/001-ai-menu-ordering/quickstart.md

**Checkpoint**: User Story 1 is independently complete when a manager can import, review, improve, and publish a menu.

---

## Phase 4: User Story 2 - On-Site Customers Order Without A Waiter (Priority: P1)

**Goal**: An on-site customer opens a table session, browses the published menu, orders manually or through an AI waiter, and sees order confirmation.

**Independent Test**: From a table session, a customer can browse the menu, ask the AI waiter about dishes, add items, customize choices, submit an order, and receive confirmation tied to the correct table.

### Tests for User Story 2

- [ ] T039 [P] [US2] Add table session loader integration test for active, expired, and invalid sessions in tests/integration/table-session.test.ts
- [ ] T040 [P] [US2] Add AI waiter action confirmation contract tests in tests/integration/ai-waiter.test.ts
- [ ] T041 [P] [US2] Add Playwright test for customer manual table order flow in tests/e2e/customer-manual-order.spec.ts
- [ ] T042 [P] [US2] Add Playwright test for customer AI-assisted order confirmation flow in tests/e2e/customer-ai-order.spec.ts

### Implementation for User Story 2

- [ ] T043 [US2] Implement table session, published menu, cart proposal, and customer order server helpers in src/lib/server/table-session.ts
- [ ] T044 [US2] Create table route loader and manual order actions in src/routes/table/[sessionCode]/+page.server.ts
- [ ] T045 [US2] Build mobile-first customer menu, item detail, cart, confirmation, and order status UI in src/routes/table/[sessionCode]/+page.svelte
- [ ] T046 [US2] Create customer menu and cart components in src/lib/components/customer/MenuBrowser.svelte and src/lib/components/customer/CartPanel.svelte
- [ ] T047 [US2] Create AI waiter Edge Function scaffold with allowed and blocked action handling in supabase/functions/ai-waiter/index.ts
- [ ] T048 [US2] Implement AI waiter server helper for conversation messages, menu context, cart proposals, escalation, and confirmed order submission in src/lib/server/ai.ts
- [ ] T049 [US2] Build AI waiter chat, proposal review, escalation, and confirmation UI in src/lib/components/customer/AiWaiter.svelte
- [ ] T050 [US2] Add customer order realtime subscription for submitted order status in src/lib/components/customer/OrderStatus.svelte
- [ ] T051 [US2] Validate US2 quickstart manual and AI waiter order pass criteria manually and record notes in specs/001-ai-menu-ordering/quickstart.md

**Checkpoint**: User Story 2 is independently complete when a customer can submit manual and AI-confirmed orders from a valid table session.

---

## Phase 5: User Story 3 - Restaurant Staff Monitor And Manage Orders (Priority: P1)

**Goal**: Staff monitor incoming on-site orders, identify issues, and update order statuses from a dashboard.

**Independent Test**: Submit orders from multiple table sessions and verify staff can see each order, update its status, and distinguish new, preparing, ready, served, cancelled, and issue states.

### Tests for User Story 3

- [ ] T052 [P] [US3] Add order dashboard loader and status update integration tests in tests/integration/orders-dashboard.test.ts
- [ ] T053 [P] [US3] Add Playwright test for staff dashboard realtime order and status update flow in tests/e2e/staff-orders.spec.ts
- [ ] T054 [P] [US3] Add Playwright test for needs-attention and unavailable item dashboard states in tests/e2e/staff-order-issues.spec.ts

### Implementation for User Story 3

- [ ] T055 [US3] Implement staff order query, needs-attention detection, and status update helpers in src/lib/server/orders.ts
- [ ] T056 [US3] Create manager dashboard summary loader in src/routes/manager/+page.server.ts
- [ ] T057 [US3] Build manager dashboard overview, active order cards, menu status, and table activity in src/routes/manager/+page.svelte
- [ ] T058 [US3] Create orders dashboard loader and status update actions in src/routes/manager/orders/+page.server.ts
- [ ] T059 [US3] Build staff orders board with new, accepted, preparing, ready, served, cancelled, and needs-attention lanes in src/routes/manager/orders/+page.svelte
- [ ] T060 [US3] Create reusable staff order card and status controls in src/lib/components/staff/OrderCard.svelte and src/lib/components/staff/OrderStatusControls.svelte
- [ ] T061 [US3] Add Supabase realtime order subscription and disconnected warning handling in src/lib/components/staff/OrdersRealtime.svelte
- [ ] T062 [US3] Validate US3 quickstart staff dashboard pass criteria manually and record notes in specs/001-ai-menu-ordering/quickstart.md

**Checkpoint**: User Story 3 is independently complete when staff can monitor and update active orders reliably.

---

## Phase 6: User Story 4 - Restaurant Owner Measures Waiter Workload Reduction (Priority: P2)

**Goal**: Owners view usage summaries that show whether digital and AI-assisted ordering reduce waiter order-taking workload.

**Independent Test**: After simulated service activity, the owner can view counts for digital orders, AI-assisted orders, manual staff interventions, average order submission time, and table activity.

### Tests for User Story 4

- [ ] T063 [P] [US4] Add operational summary aggregation tests in tests/unit/operational-summary.test.ts
- [ ] T064 [P] [US4] Add analytics loader integration test for selectable service periods in tests/integration/analytics.test.ts
- [ ] T065 [P] [US4] Add Playwright test for owner analytics summary flow in tests/e2e/owner-analytics.spec.ts

### Implementation for User Story 4

- [ ] T066 [US4] Implement operational summary aggregation helper in src/lib/server/analytics.ts
- [ ] T067 [US4] Create analytics route loader with selectable service periods in src/routes/manager/analytics/+page.server.ts
- [ ] T068 [US4] Build analytics summary UI for total orders, AI-assisted orders, manual orders, staff interventions, and average submission time in src/routes/manager/analytics/+page.svelte
- [ ] T069 [US4] Create analytics metric components in src/lib/components/manager/MetricCard.svelte and src/lib/components/manager/ServicePeriodPicker.svelte
- [ ] T070 [US4] Validate US4 owner workload reduction pass criteria manually and record notes in specs/001-ai-menu-ordering/quickstart.md

**Checkpoint**: User Story 4 is independently complete when owners can inspect operational summaries for service periods.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verify quality gates, performance budgets, UX consistency, and POC readiness across all stories.

- [ ] T071 [P] Add README setup and product validation overview in README.md
- [ ] T072 [P] Add accessible loading, empty, validation, success, failure, unavailable-item, and AI escalation copy review in src/lib/components/
- [ ] T073 [P] Add responsive visual pass for customer phone, staff tablet, and manager desktop layouts in tests/e2e/responsive.spec.ts
- [ ] T074 Run formatting, linting, type checking, unit tests, integration tests, and Playwright tests from package.json
- [ ] T075 Run Supabase migration reset and seed validation for supabase/config.toml, supabase/migrations/, and supabase/seed.sql with supabase db reset
- [ ] T076 Validate performance budgets for customer feedback under 2 seconds, dashboard order visibility under 5 seconds, and 50-item menu review usability in specs/001-ai-menu-ordering/quickstart.md
- [ ] T077 Review all routes for customer-facing jargon and staff-only data leakage in src/routes/
- [ ] T078 Verify no remote delivery, pickup, or payment scope leaked into the POC in src/routes/ and specs/001-ai-menu-ordering/

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational.
- **User Story 2 (Phase 4)**: Depends on Foundational and published menu read model from US1 for realistic customer ordering.
- **User Story 3 (Phase 5)**: Depends on Foundational and benefits from US2 order submission to test active orders.
- **User Story 4 (Phase 6)**: Depends on order and AI activity from US2 and US3.
- **Polish (Phase 7)**: Depends on all desired user stories.

### User Story Dependencies

- **US1 - Create A Digital Menu From Existing Menu**: First MVP slice because it creates the published menu required for customer ordering.
- **US2 - On-Site Customers Order Without A Waiter**: Can start after Foundational with seed menu data, but full validation depends on US1 published menu flow.
- **US3 - Restaurant Staff Monitor And Manage Orders**: Can start after Foundational with seed orders, but full validation depends on US2 order creation.
- **US4 - Restaurant Owner Measures Waiter Workload Reduction**: Depends on order and AI interaction data.

### Within Each User Story

- Tests before implementation.
- Server/domain helpers before route loaders/actions.
- Route loaders/actions before Svelte UI.
- Edge Function contract before browser AI/menu import integration.
- Story checkpoint validation before moving to dependent story.

---

## Parallel Opportunities

- Setup tasks T005-T009 can run in parallel after T001-T004 are underway.
- Foundational domain helper tasks T018-T020 and tests T021-T022 can run in parallel after T015.
- US1 tests T026-T028 can run in parallel before implementation; component task T035 can run after route contract shape is known.
- US2 tests T039-T042 can run in parallel; AI function task T047 can run alongside customer UI task T046 after server contract is agreed.
- US3 tests T052-T054 can run in parallel; dashboard component task T060 can run alongside route tasks T056-T059.
- US4 tests T063-T065 can run in parallel; component task T069 can run alongside route task T067.
- Polish tasks T071-T073 can run in parallel after core routes exist.

---

## Parallel Example: User Story 1

```bash
Task: "T026 [P] [US1] Add menu import contract test for creating a draft with confidence flags in tests/integration/menu-import.test.ts"
Task: "T027 [P] [US1] Add menu publish gate unit tests for unresolved flags, required fields, and price validation in tests/unit/menu-publish.test.ts"
Task: "T028 [P] [US1] Add Playwright test for manager menu upload, review, suggestion edit, and publish flow in tests/e2e/manager-menu-import.spec.ts"
```

## Parallel Example: User Story 2

```bash
Task: "T039 [P] [US2] Add table session loader integration test for active, expired, and invalid sessions in tests/integration/table-session.test.ts"
Task: "T040 [P] [US2] Add AI waiter action confirmation contract tests in tests/integration/ai-waiter.test.ts"
Task: "T041 [P] [US2] Add Playwright test for customer manual table order flow in tests/e2e/customer-manual-order.spec.ts"
Task: "T042 [P] [US2] Add Playwright test for customer AI-assisted order confirmation flow in tests/e2e/customer-ai-order.spec.ts"
```

## Parallel Example: User Story 3

```bash
Task: "T052 [P] [US3] Add order dashboard loader and status update integration tests in tests/integration/orders-dashboard.test.ts"
Task: "T053 [P] [US3] Add Playwright test for staff dashboard realtime order and status update flow in tests/e2e/staff-orders.spec.ts"
Task: "T054 [P] [US3] Add Playwright test for needs-attention and unavailable item dashboard states in tests/e2e/staff-order-issues.spec.ts"
```

## Parallel Example: User Story 4

```bash
Task: "T063 [P] [US4] Add operational summary aggregation tests in tests/unit/operational-summary.test.ts"
Task: "T064 [P] [US4] Add analytics loader integration test for selectable service periods in tests/integration/analytics.test.ts"
Task: "T065 [P] [US4] Add Playwright test for owner analytics summary flow in tests/e2e/owner-analytics.spec.ts"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1 to publish a real menu.
3. Complete US2 manual ordering first, then AI-assisted ordering.
4. Complete US3 staff order monitoring.
5. Stop and validate the core product promise: customers can order on-site and staff can monitor orders with less waiter order-taking work.

### Incremental Delivery

1. Menu import and publish.
2. Customer manual ordering.
3. AI waiter chat and confirmed order submission.
4. Staff dashboard and realtime status updates.
5. Owner analytics.

### POC Scope Guardrails

- Do not add payments.
- Do not add remote delivery, pickup, or pre-ordering.
- Do not add a UI component framework unless a specific task later justifies it.
- Do not create a separate custom backend service while Supabase covers the need.
- Keep AI actions behind confirmed, auditable server-side contracts.

## Format Validation

- All executable tasks use `- [ ] T###` checklist format.
- User story phase tasks include `[US1]`, `[US2]`, `[US3]`, or `[US4]`.
- Setup, foundational, and polish tasks do not include user story labels.
- Parallel tasks use `[P]` only when they touch separate files or can proceed independently.
- Every task includes at least one concrete file path.
