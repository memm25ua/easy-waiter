# Research: AI Menu Ordering SaaS

## Decision: Use SvelteKit as the only application runtime

**Rationale**: SvelteKit provides file-based routing, server-side data loading,
form actions, and a single deployable app boundary. That fits a POC/MVP where
restaurant staff dashboards, customer table ordering, and manager menu review
can share one codebase without introducing a separate custom backend.

**Alternatives considered**:

- Plain Svelte SPA: less server-side capability for auth/session loading and
  protected staff flows.
- Separate frontend plus custom backend: more code and operational overhead
  than needed when Supabase provides backend services.

**Reference**: SvelteKit documentation: https://svelte.dev/docs/kit

## Decision: Use Tailwind CSS v4 through Vite

**Rationale**: Tailwind CSS v4 supports a Vite integration and CSS-first setup,
which keeps styling close to the Svelte app with minimal configuration. This
avoids adding a component framework while still allowing consistent responsive
layouts for customer, manager, and staff flows.

**Alternatives considered**:

- Component library: faster for generic screens, but adds visual and bundle
  overhead before product workflows are validated.
- Hand-written CSS only: possible, but slower to keep consistent across the
  dashboard, menu editor, and mobile ordering surfaces.

**Reference**: Tailwind CSS installation docs: https://tailwindcss.com/docs/installation/using-vite

## Decision: Use Supabase for backend services

**Rationale**: Supabase covers the backend needs for the POC: PostgreSQL data,
authentication, file storage for menu uploads, realtime order updates, and
server-side functions for AI workflows. This matches the user's requirement to
use Supabase as the backend while avoiding a custom API service.

**Alternatives considered**:

- Custom backend with a managed database: more code and hosting surfaces than
  needed for initial validation.
- Local-only mock data: faster first screen, but cannot validate restaurant
  order monitoring, table sessions, permissions, or AI import workflows.

**Reference**: Supabase JavaScript and SvelteKit docs:
https://supabase.com/docs/reference/javascript/introduction and
https://supabase.com/docs/guides/auth/server-side/sveltekit

## Decision: Keep AI behind Supabase Edge Functions

**Rationale**: Menu import and AI waiter actions need server-side secrets,
auditing, permission checks, and controlled action execution. Placing those
workflows behind Supabase Edge Functions keeps the browser thin and ensures the
AI can only submit orders through the same validated action contract as manual
ordering.

**Alternatives considered**:

- Browser-direct AI calls: exposes sensitive credentials and weakens audit
  control.
- Full custom AI service: unnecessary until product usage proves the need for a
  separate service boundary.

**Reference**: Supabase Edge Functions docs:
https://supabase.com/docs/guides/functions

## Decision: Scope the MVP to dine-in ordering without payments

**Rationale**: The core validation question is whether restaurants can reduce
waiter order-taking work while customers still complete orders confidently
on-site. Payments, delivery, pickup, loyalty, and kitchen hardware integrations
increase scope without proving that central value proposition.

**Alternatives considered**:

- Include payments: useful later, but adds settlement, refund, compliance, and
  support complexity.
- Include remote ordering: conflicts with the spec's dine-in-only constraint.

## Decision: Test through focused unit, integration, and end-to-end flows

**Rationale**: Unit tests cover deterministic cart, status, and validation
rules. Integration tests cover Supabase access and AI action contracts.
Playwright tests cover the critical user journeys: manager import/review,
customer manual order, customer AI-assisted order, and staff dashboard updates.

**Alternatives considered**:

- Manual-only validation: too risky for order submission and AI action behavior.
- Broad test matrix before POC validation: unnecessary overhead before the
  product direction is proven.
