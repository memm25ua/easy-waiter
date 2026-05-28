# Coolify Deployment Guide

This guide is the production launch path for Easy Waiter on Coolify with the
SvelteKit Node adapter.

## Environment

Configure `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`,
`OPENROUTER_BASE_URL`, `PUBLIC_APP_URL`, `DEPLOYMENT_ENVIRONMENT`,
`COOLIFY_APP_URL`, `COOLIFY_PROJECT_ID`, `COOLIFY_SERVICE_ID`, and
`SMOKE_TEST_OPERATOR_TOKEN` in Coolify. Public values may be exposed to the
browser; service-role, OpenRouter, and smoke-test values must remain
server-only.

Menu PDF/image import also requires server-only OCR and AI import-agent
configuration. Set `OCR_PROVIDER`, `OCR_ENDPOINT`, and `OCR_API_KEY` when an
external OCR provider is used. The AI import agent uses the same server-side
OpenRouter credentials as the AI waiter, but import processing must pass both
the tenant-scoped uploaded resource reference and persisted OCR text. Never
expose OCR provider keys, OpenRouter keys, uploaded menu resource paths, or OCR
text in public runtime variables.

## Database

Apply Supabase migrations, reset local seed data only in disposable
environments, enable RLS, and verify storage policies for menu imports before
accepting real restaurant data.

Before launch, verify that menu source files are stored in tenant-scoped
storage, OCR text is persisted only in tenant-owned records, critical import
warnings block publication, and non-critical warnings remain visible to owners
and managers after publication.

## Coolify Build And Deploy

Use the Node adapter build output.

1. Build command: `npm ci && npm run build`
2. Start command: `node build`
3. Health check path: `/health`
4. Pre-launch validation command: `npm run validate:deployment`
5. Smoke checklist: `docs/smoke-tests.md`

## Launch Blockers

Do not launch if a staff route is accessible without auth, cross-tenant data is
visible, staff invitations create access outside the explicit role/location
scope, table-session tokens can be guessed or reused after close/expiry, a
production secret is missing, migrations fail, AI can submit without exact
confirmation, AI completes a staff-judgment escalation case automatically,
manual ordering fails when AI is disabled, English or Spanish product copy is
missing from primary journeys, Spanish labels overflow covered mobile controls,
or smoke tests cannot be executed.

## Bilingual Validation

Before launch, validate English and Spanish on landing, sign-up, sign-in,
onboarding, staff invitation acceptance, customer table ordering, AI fallback
and escalation, manager dashboard, menu review, analytics, staff invitations,
staff order board, `/health`, and deployment smoke output. Unsupported browser
locales must fall back to English without exposing translation keys.

## Rollback

Restore the previous Coolify deployment, disable AI by removing
`OPENROUTER_API_KEY` or setting the provider disabled flag, pause new table
sessions if database configuration is unsafe, then verify landing, sign-in,
staff invitation acceptance, tokenized customer ordering, staff orders, and
`/health`.
