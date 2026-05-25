# Quickstart: Production Readiness

## Prerequisites

- Node.js current LTS
- npm
- Supabase CLI
- Docker running for local Supabase
- Supabase project for staging or production validation
- OpenRouter API key
- Coolify project/service configured for the SvelteKit Node adapter

## 1. Configure Environment

Create local and deployment environment values:

```text
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENROUTER_API_KEY=
OPENROUTER_MODEL=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
PUBLIC_APP_URL=
COOLIFY_APP_URL=
COOLIFY_PROJECT_ID=
COOLIFY_SERVICE_ID=
SMOKE_TEST_OPERATOR_TOKEN=
```

Rules:

- Public values may be used by the browser.
- Service-role and OpenRouter keys are server-only.
- Production should fail health/smoke checks when required values are missing.

## 2. Validate Locally

```bash
npm install
supabase start
supabase db reset
npm run check
npm run test
npm run test:e2e
npm run build
```

Expected result:

- Supabase migrations and seed data apply.
- Auth helpers use real sessions, not demo staff fallbacks.
- Persistent menus, table sessions, orders, and AI audit events survive reloads.
- Tests cover cross-tenant access, staff invitations, customer table-token
  isolation, and AI escalation.

## 3. Validate Account And Tenancy

1. Create Restaurant A owner account.
2. Complete onboarding for Restaurant A and Location A.
3. Create Restaurant B owner account.
4. Complete onboarding for Restaurant B and Location B.
5. Sign in as Restaurant A and create menu/order activity.
6. Invite a Restaurant A staff member by email with role/location scope.
7. Accept the invitation after sign-up or sign-in.
8. Sign in as Restaurant B and verify Restaurant A data is not visible.

Pass criteria:

- Staff-only pages require sign-in.
- Active assignment is required.
- Staff joining an existing restaurant only receives the invited role/location
  scope.
- Cross-tenant reads and writes fail.

## 4. Validate Persistent Operations

1. Publish a menu as manager.
2. Open an active table session.
3. Open the customer QR/link with the unguessable session token.
4. Submit a manual order from the table route.
5. Reload the staff dashboard.
6. Update order status.
7. Reload the customer route.

Pass criteria:

- Menu, table session, order, and status remain correct after reload.
- Invalid, altered, reused, closed, or expired session tokens cannot submit
  orders or reveal staff-only data.

## 5. Validate Production AI

1. Configure OpenRouter server secret and model.
2. Ask the AI waiter a question answerable from the published menu.
3. Ask the AI waiter to build a cart.
4. Confirm the exact cart.
5. Ask for an allergen/safety-uncertain action, unavailable item, unsupported
   substitution, complaint, refund, discount, or cancellation after submission.
6. Simulate provider timeout or missing key.

Pass criteria:

- AI answers use approved menu context.
- AI-created orders require exact confirmation.
- Staff-judgment cases escalate or decline without automatic completion.
- Provider failure records fallback and manual ordering still works.
- Audit records are created without exposing secrets.

## 6. Validate Marketing Landing

1. Open `/` signed out on desktop and phone viewport.
2. Confirm value proposition is visible in the first viewport.
3. Start sign-up from the primary action.
4. Submit the contact/lead action.

Pass criteria:

- Public page does not expose staff-only data.
- Visitor can identify the conversion action in under one minute.
- Lead capture has clear success and validation states.

## 7. Validate English And Spanish I18n

1. Open `/` with browser/user locale set to Spanish (`es` or `es-*`) and no
   explicit language selection.
2. Verify Spanish is selected by default.
3. Open `/` with browser/user locale set to English (`en` or `en-*`) and no
   explicit language selection.
4. Verify English is selected by default.
5. Open `/` with an unsupported browser/user locale and no explicit language
   selection.
6. Verify English is selected by default and no translation keys are visible.
7. Manually switch between English and Spanish on landing, sign-up, sign-in,
   onboarding, invitation acceptance, customer table ordering, AI waiter, order
   status, manager dashboard, menu review, staff invitations, analytics, and
   staff order board.
8. Switch language in the middle of sign-up, table ordering, AI confirmation,
   staff order update, and manager menu review.

Pass criteria:

- Product UI copy appears in the selected language across public, account,
  onboarding, customer, AI, staff, manager, health/smoke, and operational
  states.
- Explicit user choice overrides the browser/user locale.
- Browser/user locale defaults to Spanish for `es-*`, English for `en-*`, and
  English for unsupported locales.
- Switching language takes under 10 seconds and does not lose current workflow
  state or non-secret form values.
- Restaurant-provided menu content, staff notes, customer notes, and lead
  messages remain as entered.
- Spanish labels do not overflow compact mobile controls in covered viewports.

## 8. Coolify Deployment Readiness

1. Configure the SvelteKit Node adapter for Coolify.
2. Configure production public values and server-only secrets in Coolify.
3. Apply Supabase migrations.
4. Configure Supabase Auth redirect URLs and email templates.
5. Configure storage bucket policies.
6. Deploy the application through Coolify.
7. Run smoke tests from `docs/smoke-tests.md`.
8. Record rollback path in `docs/deployment.md`.

Pass criteria:

- Smoke test covers sign-up, sign-in, menu publish, table ordering, AI
  assistance, staff invitation acceptance, staff status update, health check,
  bilingual language switching/default locale behavior, and public conversion.
- Missing secrets or failed migrations have documented detection and recovery.

## Implementation Validation Notes

Validated locally on 2026-05-25:

- English/Spanish i18n implementation added and validated:
  - `npm run check`
  - `npm run test:unit -- tests/unit/i18n.test.ts`
  - `npm run test:integration -- tests/integration/i18n-routes.test.ts tests/integration/i18n-persistence.test.ts`
  - `npx playwright test tests/e2e/i18n-account-flows.spec.ts tests/e2e/i18n-responsive.spec.ts`

- `npm run format`
- `npm run lint`
- `npm run check`
- `npm run test:unit`
- `npm run test:integration`
- `npm run test:rls`
- `npm run test:e2e`
- `npm run build`

Results: type checking, formatting, unit tests, integration tests, RLS test
scaffolding, Playwright smoke/browser tests, and production build passed.
Supabase/OpenRouter-dependent tests skipped automatically where local
credentials were not configured. After starting the local Supabase stack on
non-default ports (`55321` API, `55322` DB, `55323` Studio), `supabase db reset`
completed successfully on branch `002-production-readiness`.

Validated locally on 2026-05-24:

- `npm run lint`
- `npm run check`
- `npm run test:unit`
- `npm run test:integration`
- `npm run test:rls`
- `npm run test:e2e`
- `npm run build`

Supabase-backed integration, RLS, customer ordering, staff, and AI browser
flows are present but skip automatically when production Supabase/OpenRouter
test credentials are not configured. Run them again with the environment values
from section 1 before treating staging or production as launch-ready.

`supabase db reset` was attempted locally, but Supabase was not running. Start
the local Supabase stack with `supabase start`, then rerun `supabase db reset`
to complete the migration and seed validation gate.
