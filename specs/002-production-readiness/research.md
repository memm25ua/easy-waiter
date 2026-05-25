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
active staff assignment or active table session token, while Supabase RLS
provides a database-level backstop. Cross-tenant tests must verify that one
restaurant cannot read or mutate another restaurant's records even if route
code regresses.

**Alternatives considered**:

- Server-only scoping without RLS: faster to implement but too fragile for
  production tenant data.
- RLS-only with no route-level checks: harder to produce useful UX and harder
  to reason about staff role differences.

## Decision: Model staff access with explicit roles and email invitations

**Rationale**: The first production release has a concrete owner/manager/staff
permission split. Owners manage restaurant profiles, locations, staff, menus,
and analytics; managers manage assigned locations, menus, orders, and
analytics; staff handle assigned-location orders only. Email invitations let an
owner or manager assign role and location scope before a staff member accepts
after sign-up or sign-in, which keeps tenant access deliberate and testable.

**Alternatives considered**:

- Staff self-request access: convenient but creates extra approval states and
  greater tenant-discovery risk for the first release.
- Manual assignment after independent account creation: workable, but creates
  a weaker staff onboarding experience and more support steps.
- Email-domain auto-join: unsafe for restaurants with shared domains,
  contractors, or personal email accounts.

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

## Decision: Use unguessable table-session tokens for customer ordering

**Rationale**: Customers should not need accounts for dine-in ordering, but the
table route must be resistant to guessing, reuse, and cross-session access.
Unguessable QR/link tokens scoped to one active table session preserve a low
friction customer journey while giving route handlers and RLS policies a clear
authorization primitive.

**Alternatives considered**:

- Customer accounts for table ordering: stronger identity but too much friction
  for dine-in service.
- Short manual table codes: easier to type but easier to guess and reuse.
- Staff-started orders only: reduces customer self-service value and AI waiter
  usefulness.

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
as manual ordering. It must escalate allergens or safety uncertainty,
unavailable items, substitutions outside menu options, complaints, refunds,
discounts, and cancellation requests after submission. This satisfies the
confirmation, staff-judgment, and audit requirements.

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

## Decision: Target Coolify as the explicit deployment path first

**Rationale**: Production readiness should document one primary Coolify
deployment path using the SvelteKit Node adapter, environment variables,
Supabase migration flow, auth redirects, AI secrets, health checks, smoke
tests, and rollback. Coolify gives the operator a concrete self-hostable target
and keeps validation focused on one launch path.

**Alternatives considered**:

- Keep `adapter-auto` only: acceptable for early demo but less explicit for
  production operations.
- Document multiple hosts: useful later, but increases validation matrix before
  the first production launch.
- Provider-agnostic deployment notes only: too vague for a clean-environment
  smoke test and rollback checklist.

**Reference**: https://svelte.dev/docs/kit/adapter-node and
https://coolify.io/docs

## Decision: Use local dictionaries for English and Spanish product copy

**Rationale**: The first production release requires two known product
languages, English and Spanish, across public, account, customer, staff,
manager, AI fallback, and operational states. A local dictionary-based i18n
layer keeps copy centralized, testable, and available without a runtime
translation service. Locale resolution should prefer an explicit user choice,
then persisted account/session preference, then the browser or user locale
when it is `en` or `es`, and finally English as the safe default.

Restaurant-provided content such as menu item names, descriptions, staff notes,
and customer notes remains as entered. Product interface text around that
content is translated.

**Alternatives considered**:

- Runtime machine translation: adds cost, latency, quality risk, and privacy
  questions before the product needs arbitrary languages.
- Browser-only locale switching: misses server-rendered validation, redirects,
  metadata, AI fallback copy, and smoke-test/health states.
- English-only product copy with manual restaurant translations: conflicts
  with the bilingual production-readiness requirement.

## Decision: Pass selected locale into AI-visible user messages

**Rationale**: AI waiter replies, fallback messages, and escalation guidance
must match the user's selected product language where possible, while still
using restaurant-approved menu context and deterministic confirmation rules.
The locale is an input to user-visible phrasing, not permission scope or menu
truth. Audit records should retain the locale used for the interaction so
staff can understand why the customer saw English or Spanish copy.

**Alternatives considered**:

- Let the model infer language from each customer message: convenient but
  inconsistent after explicit language selection and harder to test.
- Translate only static UI and leave AI/fallback copy English-only: creates an
  incomplete customer experience in Spanish.
