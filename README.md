# Easy Waiter

Production-oriented SvelteKit and Supabase app for dine-in restaurant ordering.

## What Is Included

- Public marketing landing page with owner sign-up and lead capture.
- Supabase Auth-backed owner/staff access with email invitations, scoped
  assignments, and active assignment guards.
- Tenant-scoped menu, table session, order, analytics, AI audit, and smoke-test schema.
- Unguessable tokenized table-session links for customer ordering.
- Server-only OpenRouter adapter with deterministic order confirmation and manual fallback.
- English and Spanish product interface with explicit language selection,
  supported browser-locale defaults, and English fallback.
- Staff order board, manager menu review, customer table ordering, and health endpoints.
- Coolify deployment guide, smoke-test checklist, RLS test scaffolding, and
  explicit SvelteKit Node adapter.

## Local Setup

```bash
npm install
npm run check
npm run test
npm run dev
```

Open:

- `http://127.0.0.1:5173/`
- `http://127.0.0.1:5173/auth/sign-up`
- `http://127.0.0.1:5173/health`

Supabase, OpenRouter, and Coolify environment values are documented in
`.env.example`. Staff, invitation, customer, AI, and persistence flows require
real Supabase configuration; public landing, auth protection, and health checks
remain runnable without secrets for local validation.

## Language Support

Easy Waiter supports English (`en`) and Spanish (`es`) for product interface
copy. Locale resolution uses explicit user choice first, then persisted account
or browser-session preference, then supported browser locale (`en-*` or
`es-*`), then English. Restaurant-provided menu content and free-form notes
remain as entered.

## Validation

```bash
npm run check
npm run lint
npm run test
npm run test:rls
npm run test:e2e
npm run build
```

For database validation with Supabase CLI:

```bash
supabase start
supabase db reset
```

The POC intentionally excludes delivery, pickup, and payment flows.
