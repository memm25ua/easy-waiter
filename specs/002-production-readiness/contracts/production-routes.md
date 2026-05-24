# Contract: Production Routes

## Public Routes

### `/`

**Purpose**: Marketing landing page for restaurant owners and managers.

**States**:

- First viewport communicates dine-in AI menu ordering for restaurants.
- Primary conversion action starts sign-up.
- Secondary conversion action captures contact lead.
- Signed-in staff can still navigate to manager dashboard.

**Rules**:

- No staff-only restaurant data appears on the public page.
- Copy avoids implementation jargon.
- Mobile layout must keep value proposition and conversion action visible.

### `/contact` or landing form action

**Purpose**: Capture marketing leads for visitors who do not sign up.

**Rules**:

- Email is required.
- Lead submission does not create restaurant access.
- Success and validation states remain public and non-technical.

## Auth Routes

### `/auth/sign-up`

**Purpose**: Create owner account and start restaurant onboarding.

**Required fields**:

- Email
- Credential or provider identity
- Restaurant name
- First location name

### `/auth/sign-in`

**Purpose**: Authenticate existing owners, managers, and staff.

**Rules**:

- Existing active assignment redirects to `/manager`.
- No assignment redirects to onboarding or no-access state.

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

## Manager Routes

### `/manager`

**Purpose**: Production dashboard backed by persistent restaurant data.

**Requires**: Active staff assignment.

### `/manager/menus`

**Purpose**: Persistent menu import, list, publish state, and availability
management.

### `/manager/menus/[menuId]`

**Purpose**: Tenant-scoped menu review and publish flow.

### `/manager/orders`

**Purpose**: Realtime staff order board backed by persistent orders.

### `/manager/analytics`

**Purpose**: Tenant-scoped operational summaries.

## Customer Routes

### `/table/[sessionCode]`

**Purpose**: Active table session ordering from persistent published menu data.

**Rules**:

- Invalid, closed, expired, or unauthorized sessions block ordering.
- Manual ordering works without AI provider availability.
- AI proposals require confirmation before order submission.
- Customer can see status only for orders tied to their session.

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
