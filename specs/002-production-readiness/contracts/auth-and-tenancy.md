# Contract: Auth And Tenancy

## Scope

Authentication and tenant isolation are production gates. Staff-only routes,
server actions, database reads/writes, storage access, realtime channels, and
AI audit records must all resolve an authenticated account and active
assignment before exposing restaurant data.

## Account Flow

### Sign Up

**Input**:

- Email
- Password or provider-backed identity
- Restaurant name
- First location name
- Timezone
- Currency

**Output**:

- Authenticated account
- Restaurant
- First location
- Owner staff assignment
- Redirect to manager onboarding or dashboard

**Rules**:

- Sign-up must not create partial staff access without a restaurant and owner
  assignment.
- Duplicate restaurant slugs must ask the owner to choose another slug.
- Failed sign-up keeps user-entered non-secret form data and explains recovery.

### Sign In

**Input**:

- Email and credential or configured identity provider response

**Output**:

- Authenticated session
- Active staff assignments
- Redirect to manager dashboard if assignment exists
- Redirect to onboarding if account has no assignment

**Rules**:

- Staff-only route loads must validate the server-side session.
- Inactive assignments must be treated as no access.
- Sign-out clears staff context from server and browser state.

## Role Permissions

| Capability                  | Owner      | Manager | Staff                          |
| --------------------------- | ---------- | ------- | ------------------------------ |
| Restaurant profile setup    | Yes        | No      | No                             |
| Staff assignment management | Yes        | No      | No                             |
| Location setup              | Yes        | Yes     | No                             |
| Menu import/review/publish  | Yes        | Yes     | No                             |
| Item availability           | Yes        | Yes     | Yes                            |
| Table session management    | Yes        | Yes     | Staff can read assigned tables |
| Order dashboard read        | Yes        | Yes     | Yes                            |
| Order status update         | Yes        | Yes     | Yes                            |
| Analytics                   | Yes        | Yes     | No                             |
| Deployment settings         | Owner only | No      | No                             |

## Tenant Isolation

Every staff operation must scope by:

1. Authenticated account ID
2. Active `StaffAssignment`
3. Restaurant ID
4. Location ID when the resource is location-specific

## Required Tests

- Unauthenticated user cannot access `/manager`, `/manager/menus`,
  `/manager/orders`, `/manager/analytics`, or onboarding completion routes.
- Account with no active assignment is directed to onboarding or no-access
  state.
- Restaurant A owner cannot read or mutate Restaurant B menus, table sessions,
  orders, analytics, AI conversations, or staff assignments.
- Staff role cannot access owner-only staff management or deployment settings.
- Customer table session access cannot read staff-only data.

## Error States

- No account: direct to sign-in.
- No active assignment: explain that the user needs restaurant access.
- Wrong restaurant/location: show not found or no access without revealing that
  another tenant owns the resource.
- Auth provider unavailable: show retry guidance and avoid partial writes.
