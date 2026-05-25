# Contract: Deployment Readiness

## Deployment Target

Production deployment targets Coolify running the SvelteKit Node adapter. Local
and staging validation remain required before launch, but this feature does not
guarantee multiple production hosting providers.

## Required Configuration

### Public Runtime Values

- Public app URL
- Public Supabase URL
- Public Supabase anon or publishable key

### Server-only Secrets

- Supabase service role key
- OpenRouter API key
- OpenRouter model/default configuration
- Any Coolify secret required for deployment or smoke tests

### Coolify Configuration

- Node runtime or container configuration for the SvelteKit Node adapter
- Build command from `package.json`
- Runtime start command for the built Node server
- Public app URL and domain
- Server-only environment variables configured as secrets
- Health check path configured to `/health`

### Supabase Configuration

- Database migrations applied
- Storage buckets created
- RLS enabled and validated
- Auth redirect URLs configured for local, staging, and production
- Realtime publication includes order tables required by dashboards
- English and Spanish product translation catalog is complete for covered
  smoke-test flows

## Deployment Checklist

1. Install dependencies from lockfile.
2. Run lint, type check, unit tests, integration tests, RLS tests, and
   Playwright smoke tests.
3. Apply Supabase migrations to target environment.
4. Verify storage bucket access policies.
5. Configure auth URLs and email templates.
6. Configure OpenRouter server secret and model.
7. Build the SvelteKit app with the Node adapter.
8. Deploy application through Coolify.
9. Run production smoke tests.
10. Record result and rollback instructions.

## Smoke Test Coverage

- Public landing page renders value proposition and conversion actions.
- Owner sign-up creates account, restaurant, location, and owner assignment.
- Owner or manager invites staff by email and accepted invitation creates only
  the scoped assignment.
- Owner can sign in and reach manager dashboard.
- Manager can publish a menu.
- Active tokenized table session can submit manual order; guessed, reused, or
  expired tokens cannot.
- AI waiter can answer from approved menu context and submit only after
  confirmation.
- AI waiter escalates staff-judgment cases instead of completing them
  automatically.
- Staff can see order and update status.
- Customer sees updated order status.
- Public, account, customer, staff, manager, AI fallback, and operational
  states can be completed in both English and Spanish.
- Unsupported browser/user locales default to English without exposing
  translation keys.
- Cross-tenant access test blocks data from another restaurant.
- Health check returns success without exposing secrets.

## Rollback Contract

Rollback guidance must include:

- How to identify failed deployment version.
- How to restore previous Coolify app deployment.
- How to disable AI assistance while preserving manual ordering.
- How to pause new table sessions if database configuration is unsafe.
- How to verify customer and staff routes after rollback.

## Launch Blockers

- Any staff-only route accessible without auth.
- Any cross-tenant data leak.
- Staff invitation creates access outside the explicit role/location scope.
- Customer table token can be guessed, reused after close/expiry, or used to
  access another session.
- Missing required production secret.
- Failed migration or storage setup.
- AI can submit an order without exact confirmation.
- AI completes a clarified staff-judgment action without escalation.
- Manual customer ordering unavailable when AI provider fails.
- English or Spanish product copy missing from primary smoke-test journeys.
- Smoke tests cannot be executed from documentation.
