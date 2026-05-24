# Research: Production Readiness

## Decision: Keep a single SvelteKit application boundary

**Rationale**: The existing MVP is already a SvelteKit app with server loads,
form actions, shared components, and Supabase helpers. Production readiness
requires stronger auth, tenancy, persistence, AI integration, and deployment
discipline, but not a separate custom backend. Keeping one app limits
operational surfaces while still allowing server-only code for privileged
operations.

**Alternatives considered**:

- Separate API service: more deployment and auth complexity before the product
  needs a second runtime.
- Browser-only app: cannot safely protect service-role database access, AI
  secrets, or tenant-scoped staff workflows.

## Decision: Use Supabase Auth with SvelteKit SSR cookies

**Rationale**: Supabase's SvelteKit SSR guidance uses cookie-backed clients so
sessions are available in hooks, server loads, form actions, and client
navigation. This matches the requirement for staff-only route protection,
onboarding, and tenant-scoped data access.

**Alternatives considered**:

- Custom password/session system: creates avoidable security and maintenance
  burden.
- Client-only auth checks: risks private data flashing or being reachable
  before browser state resolves.

**Reference**: https://supabase.com/docs/guides/auth/server-side/sveltekit

## Decision: Enforce tenant isolation with both server helpers and RLS

**Rationale**: Server loaders/actions should always scope queries through the
active staff assignment or active table session, while Supabase RLS provides a
database-level backstop. Cross-tenant tests must verify that one restaurant
cannot read or mutate another restaurant's records even if route code regresses.

**Alternatives considered**:

- Server-only scoping without RLS: faster to implement but too fragile for
  production tenant data.
- RLS-only with no route-level checks: harder to produce useful UX and harder
  to reason about staff role differences.

## Decision: Replace demo in-memory state with Supabase-backed repositories

**Rationale**: The MVP currently uses demo fixtures in server helpers. Those
helpers should become thin tenant-scoped data access modules that read/write
Supabase tables, preserving existing route contracts while making menus,
orders, table sessions, AI messages, and analytics durable across reloads and
deployments.

**Alternatives considered**:

- Keep demo fallback in production paths: conflicts with production readiness
  and can mask configuration failures.
- Rewrite route contracts before persistence: unnecessary churn because the
  current route boundaries match the product workflows.

## Decision: Use OpenRouter through a server-only adapter

**Rationale**: OpenRouter exposes an OpenAI-compatible chat-completions API at
`/api/v1/chat/completions`. A server-only adapter can centralize model choice,
timeouts, request metadata, restaurant context construction, response parsing,
fallback handling, and audit logging while keeping the API key out of the
browser.

**Alternatives considered**:

- Browser-direct OpenRouter calls: exposes private provider credentials and
  bypasses audit/control.
- Hard-code provider logic inside route actions: duplicates retry/fallback and
  makes future model/provider changes harder.

**Reference**: https://openrouter.ai/docs/api-reference/chat-completion

## Decision: Keep AI action execution deterministic and separate from text

**Rationale**: The AI may propose recommendations and cart changes, but order
submission must remain deterministic: validate current restaurant menu data,
compare the exact confirmed proposal, and submit through the same order helper
as manual ordering. This satisfies the confirmation and audit requirements.

**Alternatives considered**:

- Let the model call order actions directly: too risky for restaurant service
  and harder to audit.
- Only allow informational AI answers: safer but does not deliver the AI waiter
  value proposition.

## Decision: Public landing page becomes the unauthenticated home route

**Rationale**: A production product needs a credible public first impression
and conversion path. The existing demo home page should become a marketing
landing page with sign-up/contact actions, while staff workflows move behind
auth and onboarding.

**Alternatives considered**:

- Separate marketing site: adds deployment and content-management overhead for
  this stage.
- Keep demo navigation public: leaks product internals and weakens conversion.

## Decision: Target one explicit deployment path first

**Rationale**: Production readiness should document one primary deployment path
with adapter choice, environment variables, Supabase migration flow, auth
redirects, AI secrets, health checks, smoke tests, and rollback. SvelteKit can
deploy to several hosts, but implementing one path end to end is more reliable
than broad but shallow hosting notes.

**Alternatives considered**:

- Keep `adapter-auto` only: acceptable for early demo but less explicit for
  production operations.
- Document multiple hosts: useful later, but increases validation matrix before
  the first production launch.

**Reference**: https://svelte.dev/docs/kit/adapters and
https://vercel.com/docs/beginner-sveltekit
