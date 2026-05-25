# Tasks: Production Readiness

**Input**: Design documents from `/specs/002-production-readiness/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Automated tests are REQUIRED by the project constitution and feature plan. Write tests before implementation in each story phase and verify they fail before implementing the behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other ready tasks because it uses different files and has no dependency on incomplete tasks
- **[Story]**: Maps task to a user story from spec.md
- Every task includes exact file paths

## Phase 1: Setup (Shared Production Infrastructure)

**Purpose**: Prepare the existing SvelteKit/Supabase app for production auth, persistence, AI configuration, Coolify deployment, and focused test suites.

- [x] T001 Update production environment variables for Supabase, OpenRouter, public app URL, Coolify, and smoke-test configuration in `.env.example`
- [x] T002 Add production validation scripts for unit, integration, RLS, Playwright smoke, and deployment checks in `package.json`
- [x] T003 Configure SvelteKit Node adapter dependency and build output for Coolify deployment in `package.json` and `svelte.config.js`
- [x] T004 [P] Configure production test environment guards and Supabase/OpenRouter skip helpers in `tests/setup/production-env.ts`
- [x] T005 [P] Create production fixture builders for restaurants, accounts, invitations, locations, tables, sessions, menus, orders, and AI events in `tests/fixtures/production.ts`
- [x] T006 [P] Create RLS test helpers for admin and user Supabase clients in `tests/rls/helpers.ts`
- [x] T007 [P] Create deployment documentation skeletons for Coolify and smoke tests in `docs/deployment.md` and `docs/smoke-tests.md`
- [x] T008 [P] Add shared test setup imports for Vitest and Playwright production fixtures in `tests/setup/vitest.ts` and `tests/setup/playwright.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared schema, security, Supabase clients, auth context, typed data access, and UX primitives required by every production story.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T009 Create Supabase migration for accounts, restaurants, locations, staff assignments, staff invitations, table-session token fields, AI audit events, marketing leads, and deployment smoke records in `supabase/migrations/004_production_readiness.sql`
- [x] T010 Add Supabase constraints, indexes, updated_at triggers, token hash fields, invitation uniqueness rules, and realtime publication updates in `supabase/migrations/004_production_readiness.sql`
- [x] T011 Add RLS policies for accounts, assignments, invitations, menus, orders, table sessions, AI audits, marketing leads, and deployment records in `supabase/migrations/005_production_rls.sql`
- [x] T012 Update seed data for two isolated restaurants, owner accounts, invited staff, locations, tables, active/expired tokenized sessions, published menus, and sample orders in `supabase/seed.sql`
- [x] T013 Update production TypeScript types for auth, tenant, staff invitation, staff assignment, table session, AI audit, marketing lead, and deployment smoke entities in `src/lib/types.ts`
- [x] T014 Replace demo Supabase fallback behavior with explicit environment validation and typed browser/server/service clients in `src/lib/server/supabase.ts` and `src/lib/supabase.ts`
- [x] T015 Implement server-side request session loading, safe session validation, and account resolution in `src/hooks.server.ts` and `src/lib/server/auth.ts`
- [x] T016 Implement tenant-scoped query helpers, role checks, location-scope checks, and safe no-access errors in `src/lib/server/tenant.ts`
- [x] T017 Implement token hashing, secure random token generation, and constant-time token comparison helpers in `src/lib/server/security.ts`
- [x] T018 [P] Add reusable auth, loading, validation, empty, failure, success, and no-access UI components in `src/lib/components/auth/` and `src/lib/components/shared/`
- [x] T019 [P] Add unit tests for tenant scoping, role checks, and no-access behavior in `tests/unit/tenant.test.ts`
- [x] T020 [P] Add unit tests for token hashing and secure comparison behavior in `tests/unit/security.test.ts`
- [x] T021 [P] Add integration tests for Supabase environment validation and service-role boundary behavior in `tests/integration/supabase-env.test.ts`
- [x] T022 Add RLS regression tests for cross-tenant access across restaurants, locations, staff assignments, invitations, menus, sessions, orders, and AI audits in `tests/rls/tenant-isolation.test.ts`
- [x] T023 Add Playwright unauthenticated route protection baseline tests for manager, onboarding completion, health smoke, and private staff routes in `tests/e2e/auth-protection.spec.ts`

**Checkpoint**: Production foundation ready - user story implementation can now begin in priority order or parallel where dependencies allow.

---

## Phase 3: User Story 1 - Secure Restaurant Accounts And Data (Priority: P1) MVP

**Goal**: Restaurant owners and staff can sign up, sign in, accept scoped invitations, complete onboarding, and access only authorized tenant data.

**Independent Test**: Create two restaurant accounts with separate staff users and verify each user can complete staff workflows for their own restaurant while being unable to view or modify the other restaurant's data.

### Tests for User Story 1

- [x] T024 [P] [US1] Add auth and onboarding contract tests for sign-up, sign-in, sign-out, recovery, owner assignment, and no-assignment states in `tests/integration/auth-onboarding.test.ts`
- [x] T025 [P] [US1] Add staff invitation integration tests for valid, expired, revoked, accepted, wrong-email, and conflicting invitations in `tests/integration/staff-invitations.test.ts`
- [x] T026 [P] [US1] Add role permission integration tests for owner, manager, and staff capabilities in `tests/integration/staff-permissions.test.ts`
- [x] T027 [P] [US1] Add Playwright owner sign-up to first dashboard journey in `tests/e2e/owner-onboarding.spec.ts`
- [x] T028 [P] [US1] Add Playwright staff invitation acceptance journey after sign-up and sign-in in `tests/e2e/staff-invitation.spec.ts`
- [x] T029 [P] [US1] Add Playwright cross-tenant blocking test for two restaurant accounts in `tests/e2e/cross-tenant-access.spec.ts`

### Implementation for User Story 1

- [x] T030 [US1] Implement owner sign-up, sign-in, sign-out, and account recovery server actions in `src/routes/auth/sign-up/+page.server.ts`, `src/routes/auth/sign-in/+page.server.ts`, and `src/routes/auth/sign-out/+server.ts`
- [x] T031 [US1] Build production sign-up and sign-in UI with established form states in `src/routes/auth/sign-up/+page.svelte` and `src/routes/auth/sign-in/+page.svelte`
- [x] T032 [US1] Implement restaurant onboarding service for account, restaurant, first location, and owner assignment creation in `src/lib/server/onboarding.ts`
- [x] T033 [US1] Create onboarding loader, action, and UI for first restaurant setup in `src/routes/onboarding/+page.server.ts` and `src/routes/onboarding/+page.svelte`
- [x] T034 [US1] Implement staff invitation creation, token hashing, expiry, revocation, acceptance, and assignment creation in `src/lib/server/staff.ts`
- [x] T035 [US1] Implement staff invitation acceptance route and UI in `src/routes/auth/invite/[token]/+page.server.ts` and `src/routes/auth/invite/[token]/+page.svelte`
- [x] T036 [US1] Implement manager staff management page for scoped invitations and assignment status in `src/routes/manager/staff/+page.server.ts` and `src/routes/manager/staff/+page.svelte`
- [x] T037 [US1] Update manager layout guard to require active assignment and expose role/location context in `src/routes/manager/+layout.server.ts` and `src/routes/manager/+layout.svelte`
- [x] T038 [US1] Remove demo staff fallback from auth-aware layouts and manager loaders in `src/routes/+layout.server.ts` and `src/lib/server/auth.ts`
- [x] T039 [US1] Add owner/staff no-access, inactive-assignment, invalid-invitation, and auth-provider failure states in `src/lib/components/auth/AccessState.svelte`
- [x] T040 [US1] Validate US1 quickstart account, invitation, and tenancy pass criteria in `specs/002-production-readiness/quickstart.md`

**Checkpoint**: User Story 1 is independently complete when staff auth, invitations, onboarding, role checks, and tenant isolation are enforced.

---

## Phase 4: User Story 2 - Replace Demo Data With Persistent Operations (Priority: P1)

**Goal**: Menus, tokenized table sessions, orders, customer status, and analytics are persisted in Supabase and remain correct across reloads and deployments.

**Independent Test**: Set up a restaurant, publish a menu, open a tokenized table session, submit orders, update order statuses, reload the app, and verify all records and permissions remain correct.

### Tests for User Story 2

- [x] T041 [P] [US2] Add persistent menu query, publish, availability, and tenant-scope integration tests in `tests/integration/persistent-menu.test.ts`
- [x] T042 [P] [US2] Add tokenized table session tests for active, closed, expired, guessed, reused, and altered tokens in `tests/integration/persistent-table-session.test.ts`
- [x] T043 [P] [US2] Add persistent order submission, status transition, reload, and assigned-location permission tests in `tests/integration/persistent-orders.test.ts`
- [x] T044 [P] [US2] Add persistent analytics aggregation tests for owner and manager scopes in `tests/integration/analytics.test.ts`
- [x] T045 [P] [US2] Add Playwright tokenized customer manual ordering reload flow in `tests/e2e/persistent-customer-order.spec.ts`
- [x] T046 [P] [US2] Add Playwright staff dashboard realtime persistence flow in `tests/e2e/persistent-staff-orders.spec.ts`
- [x] T047 [P] [US2] Add Playwright invalid table token and expired session rejection flow in `tests/e2e/table-token-security.spec.ts`

### Implementation for User Story 2

- [x] T048 [US2] Replace in-memory menu helpers with tenant-scoped Supabase menu queries, import records, availability mutations, and publish behavior in `src/lib/server/menu.ts` and `src/lib/server/menu-import.ts`
- [x] T049 [US2] Replace in-memory table session helpers with Supabase-backed token creation, lookup, open, close, expire, and rejection behavior in `src/lib/server/table-session.ts`
- [x] T050 [US2] Replace in-memory order helpers with Supabase-backed order list, creation, status update, session visibility, and needs-attention queries in `src/lib/server/orders.ts`
- [x] T051 [US2] Replace in-memory analytics helper with Supabase-backed operational summary aggregation scoped by role and location in `src/lib/server/analytics.ts`
- [x] T052 [US2] Update manager menu routes to use persistent menu and import records in `src/routes/manager/menus/+page.server.ts` and `src/routes/manager/menus/[menuId]/+page.server.ts`
- [x] T053 [US2] Update customer table route to load tokenized session, published menu, cart validation, manual order submission, and session order status in `src/routes/table/[sessionCode]/+page.server.ts`
- [x] T054 [US2] Update customer table UI for closed, expired, invalid-token, loading, order-submitted, and status states in `src/routes/table/[sessionCode]/+page.svelte`
- [x] T055 [US2] Update staff orders route to use persistent order data, assigned-location filtering, and status mutations in `src/routes/manager/orders/+page.server.ts`
- [x] T056 [US2] Update manager dashboard and analytics routes to use persistent scoped summaries in `src/routes/manager/+page.server.ts` and `src/routes/manager/analytics/+page.server.ts`
- [x] T057 [US2] Implement Supabase realtime order subscription with production channel names, reconnect states, and no-leak filtering in `src/lib/components/staff/OrdersRealtime.svelte` and `src/lib/components/customer/OrderStatus.svelte`
- [x] T058 [US2] Remove or quarantine demo-data usage from production route paths in `src/lib/server/demo-data.ts` and `src/routes/`
- [x] T059 [US2] Validate US2 quickstart persistent operations and table-token pass criteria in `specs/002-production-readiness/quickstart.md`

**Checkpoint**: User Story 2 is independently complete when menu, table, order, and analytics operations are durable, token-scoped, and tenant-scoped.

---

## Phase 5: User Story 3 - Production AI Waiter And Menu Assistance (Priority: P1)

**Goal**: OpenRouter-backed AI assistance uses approved restaurant context, requires deterministic confirmation, records audit events, escalates staff-judgment cases, and falls back cleanly.

**Independent Test**: Configure an AI provider, ask menu questions, request recommendations, build an AI cart, confirm an order, trigger fallback and escalation cases, and verify all AI actions are logged and scoped to the correct restaurant and table.

### Tests for User Story 3

- [x] T060 [P] [US3] Add OpenRouter adapter unit tests for request construction, timeout, provider error, response normalization, and metadata stripping in `tests/unit/openrouter.test.ts`
- [x] T061 [P] [US3] Add AI waiter contract tests for approved-context answers, unsupported claims, exact confirmation, and modified confirmation rejection in `tests/integration/openrouter-ai-waiter.test.ts`
- [x] T062 [P] [US3] Add AI escalation integration tests for allergens, safety uncertainty, unavailable items, unsupported substitutions, complaints, refunds, discounts, and post-submission cancellations in `tests/integration/ai-escalation.test.ts`
- [x] T063 [P] [US3] Add AI audit event integration tests for proposals, confirmations, submitted orders, fallbacks, escalations, and provider failures in `tests/integration/ai-audit.test.ts`
- [x] T064 [P] [US3] Add cross-tenant AI context RLS test in `tests/rls/ai-context-isolation.test.ts`
- [x] T065 [P] [US3] Add OpenRouter secret boundary integration test for browser payloads and built client output in `tests/integration/openrouter-secret-boundary.test.ts`
- [x] T066 [P] [US3] Add Playwright AI waiter production confirmation, fallback, and escalation flow in `tests/e2e/production-ai-waiter.spec.ts`

### Implementation for User Story 3

- [x] T067 [US3] Implement server-only OpenRouter client with API key validation, model config, timeout, retry policy, metadata headers, and normalized errors in `src/lib/server/openrouter.ts`
- [x] T068 [US3] Implement restaurant-approved menu and policy context builder for customer and manager AI requests in `src/lib/server/ai.ts`
- [x] T069 [US3] Replace demo AI waiter behavior with OpenRouter-backed reply, recommendation, cart proposal, and deterministic action validation in `src/lib/server/ai.ts`
- [x] T070 [US3] Implement exact confirmation comparison and order submission through persistent order helpers in `src/lib/server/ai.ts` and `src/lib/server/orders.ts`
- [x] T071 [US3] Implement escalation detection for clarified staff-judgment cases and staff-visible escalation records in `src/lib/server/ai.ts`
- [x] T072 [US3] Persist AI conversations, messages, action audits, fallback reasons, escalation reasons, and submitted order IDs in `src/lib/server/ai.ts`
- [x] T073 [US3] Update Supabase ai-waiter Edge Function to use OpenRouter config and the same confirmation, fallback, escalation, and audit contract in `supabase/functions/ai-waiter/index.ts`
- [x] T074 [US3] Update customer AI waiter UI for provider loading, proposal review, exact confirmation, escalation, decline, and manual fallback states in `src/lib/components/customer/AiWaiter.svelte`
- [x] T075 [US3] Add manager/menu AI assistance fallback and audit handling for import/review suggestions in `src/lib/server/menu-import.ts` and `src/routes/manager/menus/[menuId]/+page.server.ts`
- [x] T076 [US3] Ensure OpenRouter secrets never appear in browser payloads or built client bundles in `src/lib/server/openrouter.ts` and `src/routes/table/[sessionCode]/+page.server.ts`
- [x] T077 [US3] Validate US3 quickstart production AI pass criteria in `specs/002-production-readiness/quickstart.md`

**Checkpoint**: User Story 3 is independently complete when AI can assist safely in production and manual ordering still works without AI.

---

## Phase 6: User Story 4 - Marketing Landing And Conversion (Priority: P2)

**Goal**: The public home page becomes a polished marketing landing page with sign-up and contact conversion paths and no private data leakage.

**Independent Test**: A prospective restaurant owner can visit the public page, understand the product in under one minute, view core benefits and supported workflows, and start account creation or request contact.

### Tests for User Story 4

- [x] T078 [P] [US4] Add marketing lead validation, abuse resistance, and persistence tests in `tests/integration/marketing-leads.test.ts`
- [x] T079 [P] [US4] Add Playwright public landing conversion test for first viewport, sign-up action, and contact action in `tests/e2e/marketing-landing.spec.ts`
- [x] T080 [P] [US4] Add Playwright no-private-data public page regression test for signed-out, search preview, and unauthorized contexts in `tests/e2e/public-data-leakage.spec.ts`
- [x] T081 [P] [US4] Add responsive landing viewport coverage for phone and desktop in `tests/e2e/marketing-responsive.spec.ts`

### Implementation for User Story 4

- [x] T082 [US4] Implement marketing lead service with validation, rate-limit hooks, and tenant-safe persistence in `src/lib/server/marketing-leads.ts`
- [x] T083 [US4] Replace demo home page with marketing landing loader and lead form action in `src/routes/+page.server.ts` and `src/routes/+page.svelte`
- [x] T084 [US4] Create landing hero, workflow, proof, CTA, and lead form components in `src/lib/components/landing/`
- [x] T085 [US4] Add signed-in staff navigation from public landing to manager dashboard without exposing private data in `src/routes/+layout.svelte`
- [x] T086 [US4] Add public lead capture success, validation, loading, and failure states in `src/lib/components/landing/LeadForm.svelte`
- [x] T087 [US4] Add landing page metadata, canonical URL, public indexing rules, and private route no-index safeguards in `src/routes/+page.server.ts` and `src/app.html`
- [x] T088 [US4] Validate US4 quickstart marketing landing pass criteria in `specs/002-production-readiness/quickstart.md`

**Checkpoint**: User Story 4 is independently complete when public visitors can understand value and convert without accessing staff data.

---

## Phase 7: User Story 5 - Deployment Readiness And Operations (Priority: P2)

**Goal**: Operators can configure, deploy to Coolify, smoke test, monitor, and roll back the production app with documented steps.

**Independent Test**: Follow the Coolify deployment readiness guide from a clean environment and verify production configuration, database setup, AI provider configuration, health checks, smoke tests, and rollback instructions are complete.

### Tests for User Story 5

- [x] T089 [P] [US5] Add deployment configuration validation unit tests for required public values, server secrets, Coolify URL, Supabase, and OpenRouter readiness in `tests/unit/deployment-health.test.ts`
- [x] T090 [P] [US5] Add health route integration tests for missing config, safe success payloads, and secret redaction in `tests/integration/health.test.ts`
- [x] T091 [P] [US5] Add Playwright production smoke flow covering landing, auth, invitation, menu, tokenized ordering, AI escalation, staff status, and health in `tests/e2e/production-smoke.spec.ts`
- [x] T092 [P] [US5] Add documentation verification test for Coolify setup, smoke tests, rollback, disable-AI, and launch blockers in `tests/unit/deployment-docs.test.ts`

### Implementation for User Story 5

- [x] T093 [US5] Finalize explicit SvelteKit Node adapter and Coolify build/start settings in `svelte.config.js` and `package.json`
- [x] T094 [US5] Implement health and deployment-smoke route handlers with safe configuration checks in `src/routes/health/+server.ts` and `src/routes/health/deployment-smoke/+server.ts`
- [x] T095 [US5] Implement deployment health service for public values, server secrets, Supabase connectivity, storage, auth redirects, OpenRouter readiness, and Coolify metadata in `src/lib/server/deployment-health.ts`
- [x] T096 [US5] Add deployment smoke-test result persistence and retrieval in `src/lib/server/deployment-health.ts` and `supabase/migrations/004_production_readiness.sql`
- [x] T097 [US5] Complete Coolify deployment guide with environment setup, Node adapter commands, Supabase migrations, auth redirects, storage policies, OpenRouter secrets, health checks, smoke tests, and rollback in `docs/deployment.md`
- [x] T098 [US5] Complete operator smoke-test checklist with expected results, troubleshooting, tokenized session checks, invitation checks, AI escalation checks, and recovery steps in `docs/smoke-tests.md`
- [x] T099 [US5] Add production launch blocker checklist and rollback procedures for disabling AI and pausing new table sessions in `docs/deployment.md`
- [x] T100 [US5] Validate US5 quickstart Coolify deployment readiness pass criteria in `specs/002-production-readiness/quickstart.md`

**Checkpoint**: User Story 5 is independently complete when a clean Coolify environment can be deployed and smoke-tested from documentation.

---

## Phase 8: User Story 6 - English And Spanish Product Experience (Priority: P2)

**Goal**: Restaurant owners, staff, and customers can use public, account, onboarding, customer ordering, AI, staff, manager, and operational flows in English or Spanish, with default language resolved from explicit choice, persisted preference, supported browser/user locale, then English fallback.

**Independent Test**: Switch between English and Spanish on public, customer, and staff/manager journeys and verify navigation, forms, actions, validation messages, empty states, AI fallback guidance, operational status messages, and language persistence behave correctly without losing current task state.

### Tests for User Story 6

- [x] T111 [P] [US6] Add locale resolution unit tests for explicit choice, persisted account/session preference, `en-*`, `es-*`, unsupported locale fallback, and missing-key behavior in `tests/unit/i18n.test.ts`
- [x] T112 [P] [US6] Add integration tests for server-side locale persistence on public, auth, onboarding, manager, customer table, and health routes in `tests/integration/i18n-routes.test.ts`
- [x] T113 [P] [US6] Add integration tests for account language preference, anonymous language preference, marketing lead locale, and AI audit locale persistence in `tests/integration/i18n-persistence.test.ts`
- [x] T114 [P] [US6] Add Playwright bilingual landing, sign-up, sign-in, onboarding, and invitation acceptance journeys in `tests/e2e/i18n-account-flows.spec.ts`
- [x] T115 [P] [US6] Add Playwright bilingual customer table ordering, AI fallback/escalation, and order status journeys in `tests/e2e/i18n-customer-flows.spec.ts`
- [x] T116 [P] [US6] Add Playwright bilingual manager dashboard, menu review, staff invitations, analytics, and staff order board journeys in `tests/e2e/i18n-manager-flows.spec.ts`
- [x] T117 [P] [US6] Add responsive regression coverage for longer Spanish labels in compact mobile controls in `tests/e2e/i18n-responsive.spec.ts`

### Implementation for User Story 6

- [x] T118 [US6] Add language preference fields, locale columns, indexes, constraints, and RLS-safe access for accounts, anonymous sessions, marketing leads, and AI audit records in `supabase/migrations/006_i18n_language_preferences.sql`
- [x] T119 [US6] Update seed data with English and Spanish account/session language preferences and locale-bearing marketing/AI records in `supabase/seed.sql`
- [x] T120 [US6] Update TypeScript types for supported locales, language preference, account preferred locale, marketing lead locale, and AI audit locale in `src/lib/types.ts`
- [x] T121 [US6] Implement locale constants, locale normalization, browser/user locale parsing, dictionary lookup, fallback handling, and missing-key test hooks in `src/lib/i18n/index.ts`
- [x] T122 [P] [US6] Add English product dictionary covering navigation, landing, auth, onboarding, customer, AI, staff, manager, health, smoke, validation, empty, success, failure, and access states in `src/lib/i18n/dictionaries/en.ts`
- [x] T123 [P] [US6] Add Spanish product dictionary covering navigation, landing, auth, onboarding, customer, AI, staff, manager, health, smoke, validation, empty, success, failure, and access states in `src/lib/i18n/dictionaries/es.ts`
- [x] T124 [US6] Implement server-side locale resolution and language preference persistence using cookies, authenticated account preference, anonymous session preference, supported browser/user locale, and English fallback in `src/hooks.server.ts`, `src/routes/+layout.server.ts`, and `src/lib/server/auth.ts`
- [x] T125 [US6] Add a reusable language selector that submits locale changes without losing current route/task state in `src/lib/components/shared/LanguageSelector.svelte`
- [x] T126 [US6] Integrate locale-aware navigation, metadata, language selector, and translated layout copy in `src/routes/+layout.svelte`, `src/routes/+page.server.ts`, and `src/app.html`
- [x] T127 [US6] Translate landing page hero, workflow, lead form labels, validation, success, and failure states while preserving restaurant-provided lead content in `src/routes/+page.svelte` and `src/lib/components/landing/`
- [x] T128 [US6] Translate sign-up, sign-in, invitation acceptance, onboarding, no-access, validation, success, and failure states without losing non-secret form values on language switch in `src/routes/auth/`, `src/routes/onboarding/`, and `src/lib/components/auth/`
- [x] T129 [US6] Translate customer table session inactive/expired states, menu browsing shell, manual order form, order status, AI waiter actions, AI fallback, AI escalation, and confirmation guidance while leaving menu/notes content as entered in `src/routes/table/[sessionCode]/+page.svelte` and `src/lib/components/customer/`
- [x] T130 [US6] Translate manager dashboard, menu list/review controls, availability actions, analytics, staff invitations, order board lanes, status controls, realtime messages, and manager layout copy in `src/routes/manager/` and `src/lib/components/manager/`
- [x] T131 [US6] Pass selected locale into AI waiter/menu assistance requests and record locale for replies, fallbacks, escalations, confirmations, and audit events in `src/lib/server/ai.ts`, `src/lib/server/openrouter.ts`, `src/routes/table/[sessionCode]/+page.server.ts`, and `supabase/functions/ai-waiter/index.ts`
- [x] T132 [US6] Update marketing lead capture to persist selected locale without creating staff access in `src/lib/server/marketing-leads.ts` and `src/routes/+page.server.ts`
- [x] T133 [US6] Update health and deployment-smoke copy/payloads to use English by default and selected locale when provided without exposing secrets in `src/lib/server/deployment-health.ts`, `src/routes/health/+server.ts`, and `src/routes/health/deployment-smoke/+server.ts`
- [x] T134 [US6] Update public/customer/staff route metadata, no-index safeguards, and canonical handling to include safe locale behavior in `src/routes/+page.server.ts`, `src/routes/+layout.server.ts`, and `src/app.html`
- [x] T135 [US6] Update deployment and smoke-test documentation with bilingual validation, default user locale behavior, missing translation launch blocker, and Spanish mobile control checks in `docs/deployment.md` and `docs/smoke-tests.md`
- [x] T136 [US6] Update README with English/Spanish support, locale resolution order, and validation commands in `README.md`
- [x] T137 [US6] Validate US6 quickstart English/Spanish i18n pass criteria and record final notes in `specs/002-production-readiness/quickstart.md`

**Checkpoint**: User Story 6 is independently complete when English and Spanish product UI flows work across public, account, customer, AI, staff, manager, and operational states, selected language persists where appropriate, unsupported locales fall back to English, and restaurant-provided content remains as entered.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Verify production quality gates, UX consistency, security, and performance across all production readiness stories.

- [x] T101 [P] Update README with production setup, local Supabase, OpenRouter, staff invitations, tokenized table sessions, Coolify deployment, and smoke-test overview in `README.md`
- [x] T102 [P] Add accessibility and copy review for auth, invitation, onboarding, landing, customer AI fallback, staff no-access, and deployment health states in `src/lib/components/` and `src/routes/`
- [x] T103 [P] Add performance budget checks for customer feedback under 2 seconds, staff order visibility under 5 seconds, owner onboarding under 5 minutes, and landing first-viewport conversion in `tests/e2e/performance-budgets.spec.ts`
- [x] T104 Review all public and customer routes for implementation jargon, staff-only leakage, token leakage, and metadata mistakes in `src/routes/`
- [x] T105 Review all server helpers for service-role key boundaries, OpenRouter secret boundaries, token hashing, invitation scope, and tenant scoping in `src/lib/server/`
- [x] T106 Run formatting, linting, type checking, unit tests, integration tests, RLS tests, Playwright tests, and production build using scripts in `package.json`
- [x] T107 Run Supabase migration reset and seed validation against `supabase/config.toml`, `supabase/migrations/`, and `supabase/seed.sql` with `supabase db reset`
- [x] T108 Execute quickstart local, account/tenancy, persistence, AI, marketing, and Coolify readiness validation and record final notes in `specs/002-production-readiness/quickstart.md`
- [x] T109 Verify no delivery, pickup, payment, loyalty, or kitchen hardware scope leaked into `src/routes/`, `src/lib/`, `docs/`, or `specs/002-production-readiness/`
- [x] T110 Apply `DESIGN.md` visual system across global styles, public landing, auth/onboarding, customer ordering, and manager/staff UI in `src/app.css`, `src/routes/`, and `src/lib/components/`
- [x] T138 Run formatting, linting, type checking, unit tests, integration tests, RLS tests, Playwright tests, Supabase migration reset, and production build after i18n implementation using scripts in `package.json` and `supabase db reset`
- [x] T139 Review all user-facing English and Spanish copy for implementation jargon, staff-only leakage, missing translations, mobile overflow, and task-state loss in `src/routes/`, `src/lib/components/`, `src/lib/i18n/`, `docs/`, and `specs/002-production-readiness/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **US1 Secure Restaurant Accounts And Data (Phase 3)**: Depends on Foundational and is the MVP production gate.
- **US2 Persistent Operations (Phase 4)**: Depends on Foundational and should follow US1 for real staff/session context.
- **US3 Production AI (Phase 5)**: Depends on Foundational and benefits from US2 persistent menu/order helpers.
- **US4 Marketing Landing (Phase 6)**: Depends on Foundational and can run after US1 auth routes exist.
- **US5 Deployment Readiness (Phase 7)**: Depends on Foundational and should finalize after US1-US4 routes exist for complete smoke coverage.
- **US6 English And Spanish Product Experience (Phase 8)**: Depends on Foundational and should follow US1-US5 route surfaces so all public, customer, staff, manager, AI, and operational states can be translated and tested.
- **Polish (Phase 9)**: Depends on all desired user stories.

### User Story Dependencies

- **US1 - Secure Restaurant Accounts And Data**: First production slice because every staff and tenant operation depends on authentication, invitations, and assignment scoping.
- **US2 - Replace Demo Data With Persistent Operations**: Requires auth/tenancy to safely replace demo state with real data and tokenized table sessions.
- **US3 - Production AI Waiter And Menu Assistance**: Requires persistent menus, table sessions, and orders for realistic context and audit.
- **US4 - Marketing Landing And Conversion**: Can be delivered after auth routes are available for conversion actions.
- **US5 - Deployment Readiness And Operations**: Can start documentation early, but final smoke tests depend on implemented product routes.
- **US6 - English And Spanish Product Experience**: Cross-cuts all existing surfaces; can start after foundational locale storage exists, but complete validation depends on US1-US5 route surfaces and AI/health states.

### Within Each User Story

- Tests before implementation.
- Schema/RLS before data access helpers.
- Server helpers before route loaders/actions.
- Route loaders/actions before Svelte UI.
- Edge Function/provider integration after server contract tests.
- Story checkpoint validation before moving to dependent stories.

---

## Parallel Opportunities

- Setup tasks T004-T008 can run in parallel after T001-T003 are started.
- Foundational tests T019-T023 can run in parallel once schema/RLS expectations are clear.
- US1 tests T024-T029 can run in parallel before auth, onboarding, and invitation implementation.
- US2 tests T041-T047 can run in parallel before persistent helper replacement.
- US3 tests T060-T066 can run in parallel before OpenRouter adapter implementation.
- US4 tests T078-T081 can run in parallel before landing implementation.
- US5 tests T089-T092 can run in parallel before health/deployment implementation.
- US6 tests T111-T117 can run in parallel before locale implementation; dictionaries T122-T123 can run in parallel after locale key structure is defined.
- Polish tasks T101-T103 and T138-T139 can run in parallel once the related routes/components exist.

## Parallel Example: User Story 1

```bash
Task: "T024 [P] [US1] Add auth and onboarding contract tests for sign-up, sign-in, sign-out, recovery, owner assignment, and no-assignment states in tests/integration/auth-onboarding.test.ts"
Task: "T025 [P] [US1] Add staff invitation integration tests for valid, expired, revoked, accepted, wrong-email, and conflicting invitations in tests/integration/staff-invitations.test.ts"
Task: "T026 [P] [US1] Add role permission integration tests for owner, manager, and staff capabilities in tests/integration/staff-permissions.test.ts"
Task: "T027 [P] [US1] Add Playwright owner sign-up to first dashboard journey in tests/e2e/owner-onboarding.spec.ts"
```

## Parallel Example: User Story 2

```bash
Task: "T041 [P] [US2] Add persistent menu query, publish, availability, and tenant-scope integration tests in tests/integration/persistent-menu.test.ts"
Task: "T042 [P] [US2] Add tokenized table session tests for active, closed, expired, guessed, reused, and altered tokens in tests/integration/persistent-table-session.test.ts"
Task: "T043 [P] [US2] Add persistent order submission, status transition, reload, and assigned-location permission tests in tests/integration/persistent-orders.test.ts"
Task: "T047 [P] [US2] Add Playwright invalid table token and expired session rejection flow in tests/e2e/table-token-security.spec.ts"
```

## Parallel Example: User Story 3

```bash
Task: "T060 [P] [US3] Add OpenRouter adapter unit tests for request construction, timeout, provider error, response normalization, and metadata stripping in tests/unit/openrouter.test.ts"
Task: "T061 [P] [US3] Add AI waiter contract tests for approved-context answers, unsupported claims, exact confirmation, and modified confirmation rejection in tests/integration/openrouter-ai-waiter.test.ts"
Task: "T062 [P] [US3] Add AI escalation integration tests for allergens, safety uncertainty, unavailable items, unsupported substitutions, complaints, refunds, discounts, and post-submission cancellations in tests/integration/ai-escalation.test.ts"
Task: "T064 [P] [US3] Add cross-tenant AI context RLS test in tests/rls/ai-context-isolation.test.ts"
```

## Parallel Example: User Story 4

```bash
Task: "T078 [P] [US4] Add marketing lead validation, abuse resistance, and persistence tests in tests/integration/marketing-leads.test.ts"
Task: "T079 [P] [US4] Add Playwright public landing conversion test for first viewport, sign-up action, and contact action in tests/e2e/marketing-landing.spec.ts"
Task: "T080 [P] [US4] Add Playwright no-private-data public page regression test for signed-out, search preview, and unauthorized contexts in tests/e2e/public-data-leakage.spec.ts"
```

## Parallel Example: User Story 5

```bash
Task: "T089 [P] [US5] Add deployment configuration validation unit tests for required public values, server secrets, Coolify URL, Supabase, and OpenRouter readiness in tests/unit/deployment-health.test.ts"
Task: "T090 [P] [US5] Add health route integration tests for missing config, safe success payloads, and secret redaction in tests/integration/health.test.ts"
Task: "T091 [P] [US5] Add Playwright production smoke flow covering landing, auth, invitation, menu, tokenized ordering, AI escalation, staff status, and health in tests/e2e/production-smoke.spec.ts"
```

## Parallel Example: User Story 6

```bash
Task: "T111 [P] [US6] Add locale resolution unit tests for explicit choice, persisted account/session preference, en-*, es-*, unsupported locale fallback, and missing-key behavior in tests/unit/i18n.test.ts"
Task: "T114 [P] [US6] Add Playwright bilingual landing, sign-up, sign-in, onboarding, and invitation acceptance journeys in tests/e2e/i18n-account-flows.spec.ts"
Task: "T115 [P] [US6] Add Playwright bilingual customer table ordering, AI fallback/escalation, and order status journeys in tests/e2e/i18n-customer-flows.spec.ts"
Task: "T116 [P] [US6] Add Playwright bilingual manager dashboard, menu review, staff invitations, analytics, and staff order board journeys in tests/e2e/i18n-manager-flows.spec.ts"
Task: "T122 [P] [US6] Add English product dictionary covering navigation, landing, auth, onboarding, customer, AI, staff, manager, health, smoke, validation, empty, success, failure, and access states in src/lib/i18n/dictionaries/en.ts"
Task: "T123 [P] [US6] Add Spanish product dictionary covering navigation, landing, auth, onboarding, customer, AI, staff, manager, health, smoke, validation, empty, success, failure, and access states in src/lib/i18n/dictionaries/es.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational production schema, RLS, clients, security helpers, and guards.
3. Complete Phase 3: US1 secure accounts, invitations, and tenant isolation.
4. Stop and validate US1 independently with auth, invitation, role, RLS, and cross-tenant tests.

### Incremental Delivery

1. Foundation + US1 creates the production security baseline.
2. US2 replaces demo data with durable operations and tokenized table sessions.
3. US3 adds production AI behind deterministic confirmation, escalation, and audit.
4. US4 opens public conversion paths.
5. US5 makes Coolify deployment and operations reproducible.
6. US6 adds English and Spanish across the completed product surfaces with locale persistence and default user/browser locale behavior.
7. Polish validates full production readiness.

### Parallel Team Strategy

After Foundational completion:

- Developer A: US1 account, invitation, onboarding, and guards.
- Developer B: US2 persistent menus, orders, analytics, and table sessions.
- Developer C: US3 OpenRouter adapter, AI escalation, and AI audit.
- Developer D: US4 marketing landing once auth links exist.
- Developer E: US5 Coolify docs and health checks, finalizing smoke coverage after routes land.
- Developer F: US6 locale infrastructure, bilingual route/component integration, and i18n smoke coverage once route surfaces exist.

## Notes

- [P] tasks use different files or test scopes and can run in parallel when prerequisites are met.
- [Story] labels map tasks to independently testable user stories from spec.md.
- All production route and server tasks must preserve the no delivery, pickup, payment, loyalty, and kitchen hardware scope boundary.
