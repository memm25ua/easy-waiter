# Quickstart: Production Readiness

## Prerequisites

- Node.js current LTS
- npm
- Supabase CLI
- Docker running for local Supabase
- Supabase project for staging or production validation
- OpenRouter API key
- Deployment platform account for the selected SvelteKit adapter

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
- Tests cover cross-tenant access and customer table isolation.

## 3. Validate Account And Tenancy

1. Create Restaurant A owner account.
2. Complete onboarding for Restaurant A and Location A.
3. Create Restaurant B owner account.
4. Complete onboarding for Restaurant B and Location B.
5. Sign in as Restaurant A and create menu/order activity.
6. Sign in as Restaurant B and verify Restaurant A data is not visible.

Pass criteria:

- Staff-only pages require sign-in.
- Active assignment is required.
- Cross-tenant reads and writes fail.

## 4. Validate Persistent Operations

1. Publish a menu as manager.
2. Open an active table session.
3. Submit a manual order from the table route.
4. Reload the staff dashboard.
5. Update order status.
6. Reload the customer route.

Pass criteria:

- Menu, table session, order, and status remain correct after reload.
- Invalid or expired sessions cannot submit orders.

## 5. Validate Production AI

1. Configure OpenRouter server secret and model.
2. Ask the AI waiter a question answerable from the published menu.
3. Ask the AI waiter to build a cart.
4. Confirm the exact cart.
5. Simulate provider timeout or missing key.

Pass criteria:

- AI answers use approved menu context.
- AI-created orders require exact confirmation.
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

## 7. Deployment Readiness

1. Select and configure the production SvelteKit adapter.
2. Configure production public values and server secrets.
3. Apply Supabase migrations.
4. Configure Supabase Auth redirect URLs and email templates.
5. Configure storage bucket policies.
6. Deploy the application.
7. Run smoke tests from `docs/smoke-tests.md`.
8. Record rollback path in `docs/deployment.md`.

Pass criteria:

- Smoke test covers sign-up, sign-in, menu publish, table ordering, AI
  assistance, staff status update, health check, and public conversion.
- Missing secrets or failed migrations have documented detection and recovery.
