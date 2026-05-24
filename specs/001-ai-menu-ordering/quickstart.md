# Quickstart: AI Menu Ordering SaaS

## Prerequisites

- Node.js current LTS
- npm
- Supabase CLI
- A local Supabase project or linked hosted Supabase project
- AI provider key available only to server-side Supabase functions

## 1. Install Dependencies

```bash
npm install
```

Expected minimum app dependencies:

- SvelteKit
- Tailwind CSS v4
- Supabase JavaScript client
- Supabase SSR helpers

Expected development dependencies:

- Supabase CLI
- Vitest
- Playwright

## 2. Configure Environment

Create local environment values for:

```text
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AI_PROVIDER_API_KEY=
```

Rules:

- Public Supabase values can be used by the browser.
- Service role and AI provider keys stay server-only.
- Local demo data must not use production restaurant data.

## 3. Start Supabase Locally

```bash
supabase start
supabase db reset
```

Expected result:

- Database migrations are applied.
- Seed data creates one demo restaurant, one location, three tables, staff
  access, and a sample published menu.
- Storage bucket for menu imports exists and is private.

## 4. Run The App

```bash
npm run dev
```

Validate:

- Manager can sign in and open `/manager`.
- Demo table session opens at `/table/[sessionCode]`.
- Tailwind styles load without a component library.

## 5. Validate Core POC Flows

### Manager menu import

1. Open `/manager/menus`.
2. Upload a readable PDF or scan.
3. Confirm import status moves to review.
4. Resolve low-confidence fields.
5. Accept or edit AI suggestions.
6. Publish the menu.

Pass criteria:

- A 50-item readable menu can be reviewed and published in under 30 minutes.
- Low-confidence fields block publish until resolved.

### Customer manual order

1. Open a table session route.
2. Browse the published menu.
3. Add available items and required options.
4. Submit the order.
5. Confirm customer order status is visible.

Pass criteria:

- Standard order can be submitted in under 3 minutes.
- Unavailable items cannot be ordered.

### Customer AI waiter order

1. Ask the AI waiter for a recommendation.
2. Ask it to add items to the cart.
3. Confirm the AI-generated cart summary.
4. Submit the order.

Pass criteria:

- AI only uses restaurant-approved menu data.
- AI cannot submit until the customer confirms the exact cart.
- Escalation appears when the request needs staff judgment.

### Staff dashboard

1. Open `/manager/orders`.
2. Submit orders from one or more table sessions.
3. Move orders through accepted, preparing, ready, and served.

Pass criteria:

- New orders appear within 5 seconds in normal local validation.
- Customer order status updates after staff changes status.

## 6. Run Tests

```bash
npm run test
npm run test:e2e
```

Minimum required coverage:

- Cart validation and unavailable item blocking.
- Order status transition rules.
- AI action confirmation contract.
- Manager import review and publish gate.
- Customer manual order.
- Customer AI-assisted order.
- Staff dashboard status update.

## 7. Performance Checks

- Customer manual and AI ordering interactions show visible feedback within 2
  seconds for normal demo data.
- Staff dashboard receives new order updates within 5 seconds.
- Menu review remains usable for at least 50 items.

## Implementation Validation Notes

- Manager menu import/review/publish flow is implemented at `/manager/menus`
  and covered by `tests/e2e/manager-menu-import.spec.ts`.
- Customer manual and AI-confirmed order flows are implemented at
  `/table/DEMO-1` and covered by Playwright tests.
- Staff order monitoring/status updates are implemented at `/manager/orders`
  with order status transition unit coverage.
- Owner workload analytics are implemented at `/manager/analytics` with unit
  coverage for operational aggregation.
- Responsive validation covers customer phone, staff tablet, and manager
  desktop viewports in `tests/e2e/responsive.spec.ts`.
- Scope review found no delivery, pickup, or payment routes in the app; the
  README calls out those exclusions.
