# Contract: Production Routes

## Public Routes

All public, auth, onboarding, manager, customer, and health/operator routes
must resolve product language using the i18n contract and render product copy
in English or Spanish. Restaurant-provided content remains as entered.

### `/`

**Purpose**: Marketing landing page for restaurant owners and managers.

**States**:

- First viewport communicates dine-in AI menu ordering for restaurants.
- Primary conversion action starts sign-up.
- Secondary conversion action captures contact lead.
- Signed-in staff can still navigate to manager dashboard.
- Language selector allows English or Spanish.

**Rules**:

- No staff-only restaurant data appears on the public page.
- Copy avoids implementation jargon.
- Mobile layout must keep value proposition and conversion action visible.
- English and Spanish variants must keep first-viewport value and conversion
  action visible.

### `/contact` or landing form action

**Purpose**: Capture marketing leads for visitors who do not sign up.

**Rules**:

- Email is required.
- Lead submission does not create restaurant access.
- Success and validation states remain public and non-technical.
- Validation and success states render in the selected language.

## Auth Routes

### `/auth/sign-up`

**Purpose**: Create owner account and start restaurant onboarding.

**Required fields**:

- Email
- Credential or provider identity
- Restaurant name
- First location name

**Rules**:

- Language selection and default user/browser locale apply before validation
  messages render.
- Switching language preserves non-secret form values.

### `/auth/sign-in`

**Purpose**: Authenticate existing owners, managers, and staff.

**Rules**:

- Existing active assignment redirects to `/manager`.
- No assignment redirects to onboarding or no-access state.
- Validation and recovery guidance render in the selected language.

### `/auth/invite/[token]`

**Purpose**: Let invited staff accept restaurant access after sign-up or
sign-in.

**Rules**:

- Valid invitation token resolves intended restaurant, role, and location
  scope without exposing tenant data to unauthenticated visitors.
- Expired, revoked, accepted, altered, wrong-email, or conflicting invitations
  show a safe no-access/retry state.
- Acceptance creates an active assignment only for the invitation scope.
- Invitation acceptance copy and errors render in the selected language without
  exposing tenant data.

### `/auth/sign-out`

**Purpose**: End session and clear staff context.

## Onboarding Routes

### `/onboarding`

**Purpose**: Complete restaurant, location, and owner assignment setup for new
accounts.

**States**:

- Missing restaurant profile
- Missing first location
- Complete and ready for dashboard
- Failed setup with retry
- English/Spanish translated labels, validation, and completion guidance

## Manager Routes

### `/manager`

**Purpose**: Production dashboard backed by persistent restaurant data.

**Requires**: Active staff assignment.

**Rules**:

- Manager navigation, cards, empty states, access states, and operational
  errors render in the selected language.
- Switching language preserves current filters and form edits where applicable.

### `/manager/menus`

**Purpose**: Persistent menu import, list, publish state, and availability
management.

### `/manager/menus/[menuId]`

**Purpose**: Tenant-scoped menu review and publish flow.

**Rules**:

- Product controls and validation render in the selected language.
- Menu names, descriptions, and imported restaurant content remain as entered.

### `/manager/orders`

**Purpose**: Realtime staff order board backed by persistent orders.

**Rules**:

- Order status labels, controls, empty states, and realtime connection messages
  render in the selected language.

### `/manager/analytics`

**Purpose**: Tenant-scoped operational summaries.

### `/manager/staff`

**Purpose**: Manage staff invitations and assignments within the actor's
authorized role/location scope.

**Rules**:

- Owners can manage managers and staff across the restaurant.
- Managers can invite or manage staff only for assigned locations.
- Staff cannot access staff management.
- Invitation form labels, statuses, success, validation, and no-access states
  render in the selected language.

## Customer Routes

### `/table/[sessionCode]`

**Purpose**: Active table session ordering from persistent published menu data
through an unauthenticated QR/link token.

**Rules**:

- Invalid, guessed, altered, closed, expired, reused, or unauthorized session
  tokens block ordering.
- Manual ordering works without AI provider availability.
- AI proposals require confirmation before order submission.
- Customer can see status only for orders tied to their session.
- Language selector allows English or Spanish for customer product UI.
- Default locale comes from explicit choice, anonymous session preference,
  browser/user locale when supported, then English fallback.
- Menu item names and descriptions remain as entered by the restaurant.

## Health Routes

### `/health`

**Purpose**: Lightweight production health check.

**Checks**:

- App runtime responds.
- Required public configuration exists.
- Optional shallow Supabase connectivity check where safe.

### `/health/deployment-smoke`

**Purpose**: Protected smoke-test endpoint or documented flow for operators.

**Rules**:

- Must not expose secrets or tenant data.
- May require owner/operator access.
- Reports pass/fail for auth, database, storage, AI configuration, and route
  availability checks.
- Operator-visible health/smoke copy renders in English or Spanish when a
  locale is provided; English is the default for automated checks.
