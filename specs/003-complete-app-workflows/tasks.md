# Tasks: Complete App Workflows

**Input**: Design documents from `/specs/003-complete-app-workflows/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Automated tests are REQUIRED for acceptance scenarios, business rules,
regressions, and cross-boundary behavior. Write tests before implementation in
each user story phase and ensure they fail for the missing behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare shared fixtures, environment wiring, and documentation references needed by all complete-workflow stories.

- [x] T001 Add menu import, table session, and role-complete fixture data builders in tests/fixtures/complete-workflows.ts
- [x] T002 [P] Add representative PDF/image fixture metadata and fixture loading helpers in tests/fixtures/menu-import-files.ts
- [x] T003 [P] Add complete-workflow environment validation helpers for OCR and AI import-agent settings in tests/setup/production-env.ts
- [x] T004 [P] Add menu import and table link dictionary keys for English product copy in src/lib/i18n/dictionaries/en.ts
- [x] T005 [P] Add menu import and table link dictionary keys for Spanish product copy in src/lib/i18n/dictionaries/es.ts
- [x] T006 [P] Document local OCR and AI import-agent environment variables in docs/deployment.md
- [x] T007 [P] Document complete-workflow smoke expectations in docs/smoke-tests.md
- [x] T008 Verify package scripts still cover check, unit, integration, RLS, build, and e2e validation in package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add shared persistence, type, authorization, and service foundations that every user story depends on.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T009 Create Supabase migration for menu import jobs, import warnings, menu draft versions, published menu snapshots, stable table tokens, and order status events in supabase/migrations/007_complete_workflows.sql
- [x] T010 Create Supabase storage policy migration for tenant-scoped menu source resources in supabase/migrations/008_menu_import_storage.sql
- [x] T011 Create Supabase RLS migration for owner/manager menu editing, staff order access, customer table-link reads, and cross-tenant blocking in supabase/migrations/009_complete_workflows_rls.sql
- [x] T012 [P] Add complete-workflow domain types for import jobs, warnings, drafts, published snapshots, table sessions, and order events in src/lib/types.ts
- [x] T013 [P] Add warning severity, import status, menu draft status, and table session status constants in src/lib/menu-publish.ts
- [x] T014 [P] Add reusable tenant authorization helpers for owner, manager, staff, and table-link scopes in src/lib/server/tenant.ts
- [x] T015 Add server-side storage helper functions for menu source uploads and signed internal resource references in src/lib/server/supabase.ts
- [x] T016 Add RLS helper fixtures for complete-workflow tenant isolation tests in tests/rls/helpers.ts
- [x] T017 [P] Add unit tests for warning severity and publication-blocking rules in tests/unit/menu-publish.test.ts
- [x] T018 [P] Add unit tests for tenant role helper decisions in tests/unit/tenant.test.ts
- [x] T019 [P] Add RLS tests for menu import, menu draft, table link, and order isolation in tests/rls/tenant-isolation.test.ts
- [x] T020 Run baseline validation before story work and record failures in specs/003-complete-app-workflows/quickstart.md

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Import Menu From PDF Or Image (Priority: P1) MVP

**Goal**: Owners and managers upload PDF/image menus, persist source and OCR text, call the AI import agent with both resource and OCR text, and receive a reviewable draft with critical/non-critical warnings.

**Independent Test**: Upload representative PDF and image menus, verify stored source resource, persisted OCR text, AI import-agent request inputs, structured draft creation, warning display, failure fallback, and saved review progress.

### Tests for User Story 1

- [x] T021 [P] [US1] Add contract tests for createMenuImportJob and processMenuImportJob in tests/integration/menu-import.test.ts
- [x] T022 [P] [US1] Add unit tests for OCR text normalization and confidence warning mapping in tests/unit/menu-import.test.ts
- [x] T023 [P] [US1] Add unit tests for AI import-agent schema validation and warning classification in tests/unit/openrouter.test.ts
- [x] T024 [P] [US1] Add integration tests ensuring OCR text and source resource reference are passed to the AI import agent in tests/integration/openrouter-ai-waiter.test.ts
- [x] T025 [P] [US1] Add integration tests for provider timeout, OCR failure, invalid schema, and manual-entry fallback in tests/integration/menu-import.test.ts
- [x] T026 [P] [US1] Add Playwright import review journey for PDF and image uploads in tests/e2e/manager-menu-import.spec.ts
- [x] T027 [P] [US1] Add RLS test blocking cross-tenant access to source files, OCR text, import jobs, and generated drafts in tests/rls/tenant-isolation.test.ts

### Implementation for User Story 1

- [x] T028 [US1] Implement menu import job creation, upload validation, and tenant-scoped source storage in src/lib/server/menu-import.ts
- [x] T029 [US1] Implement OCR extraction orchestration and persisted OCR summary fields in src/lib/server/menu-import.ts
- [x] T030 [US1] Implement AI import-agent prompt assembly with source resource reference, OCR text, locale, location, and currency in src/lib/server/menu-import.ts
- [x] T031 [US1] Implement structured AI draft response parsing, schema validation, and provider metadata redaction in src/lib/server/openrouter.ts
- [x] T032 [US1] Implement draft, category, item, option, and ImportWarning creation from AI import output in src/lib/server/menu.ts
- [x] T033 [US1] Implement critical/non-critical warning resolution and review status updates in src/lib/server/menu-import.ts
- [x] T034 [US1] Add manager menu upload, queued, processing, failed, and review-ready load/action handling in src/routes/manager/menus/+page.server.ts
- [x] T035 [US1] Add import upload, progress, OCR summary, warning list, and fallback manual-entry UI in src/routes/manager/menus/+page.svelte
- [x] T036 [US1] Add import review detail load/action handling for warning resolution and draft save in src/routes/manager/menus/[menuId]/+page.server.ts
- [x] T037 [US1] Add import review detail UI for extracted categories, items, warnings, save progress, and non-technical errors in src/routes/manager/menus/[menuId]/+page.svelte
- [x] T038 [US1] Add audit-safe AI import event logging without secrets in src/lib/server/ai.ts

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Owner And Manager Edit Published Menus (Priority: P1)

**Goal**: Owners and managers manually create, edit, preview, conflict-review, and publish menus while unauthorized users are blocked and customers see only published snapshots.

**Independent Test**: Owner and assigned manager edit and publish menus, critical import warnings block publication, non-critical warnings permit publication after review, stale saves produce conflicts, and staff/cross-tenant users cannot mutate menus.

### Tests for User Story 2

- [x] T039 [P] [US2] Add unit tests for menu draft versioning, stale save conflict detection, and publish validation in tests/unit/menu-publish.test.ts
- [x] T040 [P] [US2] Add integration tests for loadMenuWorkspace, saveMenuDraft, resolveImportWarning, and publishMenu in tests/integration/persistent-menu.test.ts
- [x] T041 [P] [US2] Add integration tests for owner, manager, staff, unauthenticated, and cross-tenant menu permissions in tests/integration/staff-permissions.test.ts
- [x] T042 [P] [US2] Add Playwright tests for owner/manager menu editing, preview, conflict review, and publication in tests/e2e/manager-menu-import.spec.ts
- [x] T043 [P] [US2] Add Playwright regression confirming customer table links see published menus and never drafts in tests/e2e/customer-manual-order.spec.ts

### Implementation for User Story 2

- [x] T044 [US2] Implement menu workspace loading with drafts, current published menu, import jobs, and permissions in src/lib/server/menu.ts
- [x] T045 [US2] Implement menu draft save with last_seen_version conflict detection and draft version history in src/lib/server/menu.ts
- [x] T046 [US2] Implement manual category, item, option group, and option value create/update/reorder/archive operations in src/lib/server/menu.ts
- [x] T047 [US2] Implement import warning resolution and accepted non-critical warning persistence in src/lib/server/menu-import.ts
- [x] T048 [US2] Implement publishMenu with critical warning blocking, required field checks, stale version blocking, and published snapshot creation in src/lib/server/menu.ts
- [x] T049 [US2] Enforce owner/manager-only menu edit and publish authorization in src/routes/manager/menus/+page.server.ts
- [x] T050 [US2] Add menu editor actions for manual edit, duplicate, reorder, archive, preview, warning resolution, and publish in src/routes/manager/menus/[menuId]/+page.server.ts
- [x] T051 [US2] Add menu editor UI for manual editing, conflict review, preview, publish blockers, and publish success in src/routes/manager/menus/[menuId]/+page.svelte
- [x] T052 [US2] Add manager menu workspace UI for drafts, published menu state, import jobs, and role-scoped empty states in src/routes/manager/menus/+page.svelte
- [x] T053 [US2] Add customer published-menu snapshot loading helper for active table sessions in src/lib/server/menu.ts

**Checkpoint**: User Story 2 is fully functional and testable independently.

---

## Phase 5: User Story 3 - Customer Opens Table Link And Orders (Priority: P1)

**Goal**: Customers open one stable table link/QR per table, view the current active session's published menu without signing in, submit manual or AI-confirmed orders, and see their table-session order status.

**Independent Test**: Create an active table session, open the stable table link on a phone viewport, browse published menu, submit manual and AI-confirmed orders, verify correct table/session association, and verify blocked states after close/reset.

### Tests for User Story 3

- [x] T054 [P] [US3] Add integration tests for openTableSession, closeTableSession, and stable table link resolution in tests/integration/table-session.test.ts
- [x] T055 [P] [US3] Add integration tests for manual and AI order submission validation against the current published menu in tests/integration/persistent-orders.test.ts
- [x] T056 [P] [US3] Add security tests for altered, cross-tenant, closed, reset, and no-menu table links in tests/e2e/table-token-security.spec.ts
- [x] T057 [P] [US3] Add Playwright manual ordering journey for stable table links in tests/e2e/customer-manual-order.spec.ts
- [x] T058 [P] [US3] Add Playwright AI-confirmed ordering journey for stable table links in tests/e2e/customer-ai-order.spec.ts
- [x] T059 [P] [US3] Add customer interaction performance budget checks in tests/e2e/performance-budgets.spec.ts

### Implementation for User Story 3

- [x] T060 [US3] Implement one stable table entry token per RestaurantTable and active-session resolution in src/lib/server/table-session.ts
- [x] T061 [US3] Implement openTableSession and closeTableSession behavior with one active session per table in src/lib/server/table-session.ts
- [x] T062 [US3] Implement customer table-link route loading for published menu, active session, visible orders, and blocked reasons in src/routes/table/[sessionCode]/+page.server.ts
- [x] T063 [US3] Implement customer order submission validation against active session and published menu in src/lib/server/orders.ts
- [x] T064 [US3] Implement exact AI order proposal confirmation reuse for table-link orders in src/lib/server/ai.ts
- [x] T065 [US3] Add customer ordering UI for published menu browsing, options, cart, review, submit, AI proposal confirmation, and status feedback in src/routes/table/[sessionCode]/+page.svelte
- [x] T066 [US3] Add blocked-state UI for no active session, closed/reset session, invalid link, no published menu, and submission failure in src/routes/table/[sessionCode]/+page.svelte
- [x] T067 [US3] Add customer-safe order status formatting and visibility filtering in src/lib/order-status.ts
- [x] T068 [US3] Add customer-flow English and Spanish copy for table links, blocked states, cart review, AI confirmation, and order status in src/lib/i18n/dictionaries/en.ts
- [x] T069 [US3] Add matching Spanish customer-flow copy for table links, blocked states, cart review, AI confirmation, and order status in src/lib/i18n/dictionaries/es.ts

**Checkpoint**: User Story 3 is fully functional and testable independently.

---

## Phase 6: User Story 4 - Staff Receive And Manage Orders (Priority: P1)

**Goal**: Staff assigned to a location receive incoming table orders, understand table/source/review reasons, update fulfillment status, and keep originating customers informed.

**Independent Test**: Submit orders from two table links, sign in as assigned staff, verify the dashboard shows only assigned-location orders, update statuses, and verify customer sessions see their own updates.

### Tests for User Story 4

- [x] T070 [P] [US4] Add integration tests for staff assigned-location order dashboard filtering and status updates in tests/integration/orders-dashboard.test.ts
- [x] T071 [P] [US4] Add integration tests for order status history and customer-visible status changes in tests/integration/persistent-orders.test.ts
- [x] T072 [P] [US4] Add Playwright staff dashboard fulfillment journey in tests/e2e/staff-orders.spec.ts
- [x] T073 [P] [US4] Add Playwright staff review reason and AI escalation visibility tests in tests/e2e/staff-order-issues.spec.ts

### Implementation for User Story 4

- [x] T074 [US4] Implement assigned-location order dashboard query with table, item, source, note, review reason, and status data in src/lib/server/orders.ts
- [x] T075 [US4] Implement staff-only order status transition validation and status event creation in src/lib/server/orders.ts
- [x] T076 [US4] Implement manager/staff orders route loading and status update actions in src/routes/manager/orders/+page.server.ts
- [x] T077 [US4] Add staff order dashboard UI with filters, grouping, review reasons, status controls, and non-technical failure states in src/routes/manager/orders/+page.svelte
- [x] T078 [US4] Add realtime or refresh-based staff order visibility path within the 5-second service budget in src/lib/server/orders.ts
- [x] T079 [US4] Add staff-flow English and Spanish copy for order dashboard states and review reasons in src/lib/i18n/dictionaries/en.ts
- [x] T080 [US4] Add matching Spanish staff-flow copy for order dashboard states and review reasons in src/lib/i18n/dictionaries/es.ts

**Checkpoint**: User Story 4 is fully functional and testable independently.

---

## Phase 7: User Story 5 - Role-Complete Production Experience (Priority: P2)

**Goal**: Owners, managers, staff, and customers complete the full production workflow without demo data, hidden manual steps, or role boundary leaks.

**Independent Test**: Run the cross-role smoke path with owner onboarding, manager/staff invitations, menu import, review, publication, stable table links, customer ordering, staff fulfillment, and English/Spanish journeys.

### Tests for User Story 5

- [x] T081 [P] [US5] Add role-complete smoke Playwright test covering owner, manager, staff, and customer flows in tests/e2e/production-smoke.spec.ts
- [x] T082 [P] [US5] Add cross-role and cross-tenant regression tests for complete workflows in tests/e2e/cross-tenant-access.spec.ts
- [x] T083 [P] [US5] Add English and Spanish complete-workflow journey coverage in tests/e2e/i18n-manager-flows.spec.ts
- [x] T084 [P] [US5] Add production smoke fixture setup for restaurant, location, tables, roles, source files, and published menu in tests/fixtures/production.ts

### Implementation for User Story 5

- [x] T085 [US5] Connect owner onboarding completion to initial location, manager menu workspace, and table setup readiness in src/lib/server/onboarding.ts
- [x] T086 [US5] Ensure staff invitation acceptance creates role assignments compatible with menu, table, and order scopes in src/lib/server/staff.ts
- [x] T087 [US5] Add table setup visibility and stable link management for owner/manager workflows in src/routes/manager/+page.server.ts
- [x] T088 [US5] Add manager dashboard links and role-scoped workflow status cards for menus, tables, orders, and staff in src/routes/manager/+page.svelte
- [x] T089 [US5] Update deployment smoke health checks to include import-agent configuration, table links, published menu, customer order, and staff status checks in src/lib/server/deployment-health.ts
- [x] T090 [US5] Update production smoke route output for complete workflows in src/routes/health/deployment-smoke/+server.ts
- [x] T091 [US5] Remove or gate demo-data fallbacks from complete production workflows in src/lib/server/demo-data.ts

**Checkpoint**: All user stories are independently functional and connected into the full production smoke path.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validate quality, docs, performance, accessibility, and release readiness across all stories.

- [x] T092 [P] Run formatting check and fix generated issues in package.json
- [x] T093 [P] Run Svelte static checks and fix type/load/action issues in src/
- [x] T094 [P] Run unit tests and fix regressions in tests/unit/
- [x] T095 [P] Run integration tests and fix regressions in tests/integration/
- [x] T096 [P] Run RLS tests and fix policy regressions in tests/rls/
- [x] T097 Run Playwright e2e suite and fix role-complete journey regressions in tests/e2e/
- [x] T098 Validate responsive manager/customer/staff UI against DESIGN.md in src/routes/manager/ and src/routes/table/[sessionCode]/
- [x] T099 Validate quickstart manual smoke path and update any stale instructions in specs/003-complete-app-workflows/quickstart.md
- [x] T100 Update deployment and smoke-test documentation for complete workflows in docs/deployment.md and docs/smoke-tests.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Stories (Phase 3-7)**: Depend on Foundational completion.
- **Polish (Phase 8)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 Import Menu From PDF Or Image (P1)**: Can start after Foundation; MVP because it creates reviewed draft menu data.
- **US2 Owner And Manager Edit Published Menus (P1)**: Can start after Foundation; integrates naturally with US1 drafts but can be tested with manually created drafts.
- **US3 Customer Opens Table Link And Orders (P1)**: Can start after Foundation and a published menu fixture; can use seeded published snapshots if US2 is incomplete.
- **US4 Staff Receive And Manage Orders (P1)**: Can start after Foundation and seeded orders; integrates with US3 submitted orders.
- **US5 Role-Complete Production Experience (P2)**: Depends on US1-US4 for the full smoke path.

### Within Each User Story

- Tests before implementation.
- Migration/type/permission foundations before services.
- Services before route actions.
- Route actions before UI wiring.
- UI wiring before Playwright acceptance completion.

## Parallel Opportunities

- Setup tasks T002-T007 can run in parallel.
- Foundational tasks T012-T014 and T017-T019 can run in parallel after migrations are sketched.
- US1 test tasks T021-T027 can run in parallel before implementation.
- US2 test tasks T039-T043 can run in parallel before implementation.
- US3 test tasks T054-T059 can run in parallel before implementation.
- US4 test tasks T070-T073 can run in parallel before implementation.
- US5 test tasks T081-T084 can run in parallel once US1-US4 contracts are stable.
- Dictionary copy tasks can run in parallel with service implementation.

## Parallel Example: User Story 1

```bash
# Launch all US1 tests together:
Task: "T021 Contract tests in tests/integration/menu-import.test.ts"
Task: "T022 OCR normalization tests in tests/unit/menu-import.test.ts"
Task: "T023 AI schema tests in tests/unit/openrouter.test.ts"
Task: "T024 AI import-agent input tests in tests/integration/openrouter-ai-waiter.test.ts"
Task: "T025 Failure fallback tests in tests/integration/menu-import.test.ts"
Task: "T026 Playwright import review in tests/e2e/manager-menu-import.spec.ts"
Task: "T027 RLS import isolation in tests/rls/tenant-isolation.test.ts"
```

## Parallel Example: User Story 3

```bash
# Launch table-link and customer-order tests together:
Task: "T054 Table session integration tests in tests/integration/table-session.test.ts"
Task: "T055 Order submission integration tests in tests/integration/persistent-orders.test.ts"
Task: "T056 Link security tests in tests/e2e/table-token-security.spec.ts"
Task: "T057 Manual order journey in tests/e2e/customer-manual-order.spec.ts"
Task: "T058 AI order journey in tests/e2e/customer-ai-order.spec.ts"
Task: "T059 Performance budget checks in tests/e2e/performance-budgets.spec.ts"
```

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Complete US1 import-to-reviewable-draft.
3. Validate US1 independently with PDF and image imports, OCR persistence, AI import-agent request inputs, warnings, and draft save.
4. Add US2 publication before exposing customer ordering from imported menus.

### Incremental Delivery

1. Foundation.
2. US1 import draft creation.
3. US2 owner/manager editing and publishing.
4. US3 customer stable table link ordering.
5. US4 staff fulfillment dashboard.
6. US5 role-complete smoke and production readiness.

### Parallel Team Strategy

After Foundation:

- Developer A: US1 import agent and review workflow.
- Developer B: US2 menu editor, publication, and conflict workflow.
- Developer C: US3 table links and customer ordering using seeded published menu fixtures.
- Developer D: US4 staff orders using seeded order fixtures.
- Developer E: US5 smoke tests and fixture orchestration once story contracts stabilize.

## Notes

- [P] tasks use different files or can be developed independently.
- [US1]-[US5] labels map directly to user stories in spec.md.
- Do not publish AI-imported menu content until owner/manager review passes critical-field validation.
- Keep uploaded source resources, OCR text, provider metadata, and menu data tenant-scoped.
