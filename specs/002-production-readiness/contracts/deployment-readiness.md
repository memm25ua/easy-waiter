# Contract: Deployment Readiness

## Required Configuration

### Public Runtime Values

- Public app URL
- Public Supabase URL
- Public Supabase anon or publishable key

### Server-only Secrets

- Supabase service role key
- OpenRouter API key
- OpenRouter model/default configuration
- Any deployment platform secret required for smoke tests

### Supabase Configuration

- Database migrations applied
- Storage buckets created
- RLS enabled and validated
- Auth redirect URLs configured for local, staging, and production
- Realtime publication includes order tables required by dashboards

## Deployment Checklist

1. Install dependencies from lockfile.
2. Run lint, type check, unit tests, integration tests, RLS tests, and
   Playwright smoke tests.
3. Apply Supabase migrations to target environment.
4. Verify storage bucket access policies.
5. Configure auth URLs and email templates.
6. Configure OpenRouter server secret and model.
7. Build the SvelteKit app with the selected adapter.
8. Deploy application.
9. Run production smoke tests.
10. Record result and rollback instructions.

## Smoke Test Coverage

- Public landing page renders value proposition and conversion actions.
- Owner sign-up creates account, restaurant, location, and owner assignment.
- Owner can sign in and reach manager dashboard.
- Manager can publish a menu.
- Active table session can submit manual order.
- AI waiter can answer from approved menu context and submit only after
  confirmation.
- Staff can see order and update status.
- Customer sees updated order status.
- Cross-tenant access test blocks data from another restaurant.
- Health check returns success without exposing secrets.

## Rollback Contract

Rollback guidance must include:

- How to identify failed deployment version.
- How to restore previous app deployment.
- How to disable AI assistance while preserving manual ordering.
- How to pause new table sessions if database configuration is unsafe.
- How to verify customer and staff routes after rollback.

## Launch Blockers

- Any staff-only route accessible without auth.
- Any cross-tenant data leak.
- Missing required production secret.
- Failed migration or storage setup.
- AI can submit an order without exact confirmation.
- Manual customer ordering unavailable when AI provider fails.
- Smoke tests cannot be executed from documentation.
