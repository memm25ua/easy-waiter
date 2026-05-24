# Easy Waiter

Lean SvelteKit and Supabase POC for dine-in restaurant ordering.

## What Is Included

- Manager menu import and review flow with publish validation.
- Customer table ordering from `/table/DEMO-1`.
- AI waiter proposal and explicit confirmation flow.
- Staff order board with status transitions.
- Owner analytics summary for workload reduction signals.
- Supabase migrations, storage bucket setup, RLS policies, Edge Function scaffolds, and seed data.

## Local Setup

```bash
npm install
npm run dev
```

Open:

- `http://127.0.0.1:5173/manager`
- `http://127.0.0.1:5173/manager/menus`
- `http://127.0.0.1:5173/manager/orders`
- `http://127.0.0.1:5173/table/DEMO-1`

Supabase environment values are documented in `.env.example`. The app uses demo data when local Supabase keys are not present so product flows remain runnable before backend linking.

## Validation

```bash
npm run check
npm run test
npm run test:e2e
```

For database validation with Supabase CLI:

```bash
supabase start
supabase db reset
```

The POC intentionally excludes delivery, pickup, and payment flows.
