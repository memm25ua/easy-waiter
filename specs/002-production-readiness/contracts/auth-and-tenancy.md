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
- Language selection uses explicit choice or supported browser/user locale and
  must preserve user-entered non-secret form data when changed.

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
- Sign-in validation, no-assignment guidance, and recovery states render in the
  selected language.

### Staff Invitation Acceptance

**Input**:

- Invitation token from email
- Email and credential or existing authenticated account

**Output**:

- Authenticated account
- Active staff assignment with invitation role and location scope
- Redirect to assigned manager/staff area

**Rules**:

- Owners can invite managers or staff for their restaurant.
- Managers can invite staff for locations they manage.
- Invitations must specify email, role, and restaurant/location scope before
  sending.
- Expired, revoked, previously accepted, or mismatched invitations must not
  create staff access.
- Staff joining an existing restaurant must not self-select tenant, role, or
  location scope.
- Invitation copy and errors render in the selected language without exposing
  tenant data.

## Role Permissions

| Capability                  | Owner | Manager                         | Staff                  |
| --------------------------- | ----- | ------------------------------- | ---------------------- |
| Restaurant profile setup    | Yes   | No                              | No                     |
| Staff invitation management | Yes   | Staff invites for own locations | No                     |
| Staff assignment management | Yes   | Staff for own locations         | No                     |
| Location setup              | Yes   | Assigned locations              | No                     |
| Menu import/review/publish  | Yes   | Assigned locations              | No                     |
| Item availability           | Yes   | Assigned locations              | No                     |
| Table session management    | Yes   | Assigned locations              | No                     |
| Order dashboard read        | Yes   | Assigned locations              | Assigned location only |
| Order status update         | Yes   | Assigned locations              | Assigned location only |
| Analytics                   | Yes   | Assigned locations              | No                     |
| Deployment settings         | Yes   | No                              | No                     |

## Tenant Isolation

Every staff operation must scope by:

1. Authenticated account ID
2. Active `StaffAssignment`
3. Restaurant ID
4. Location ID when the resource is location-specific
5. Accepted invitation scope for non-owner staff joining existing restaurants

## Required Tests

- Unauthenticated user cannot access `/manager`, `/manager/menus`,
  `/manager/orders`, `/manager/analytics`, or onboarding completion routes.
- Account with no active assignment is directed to onboarding or no-access
  state.
- Restaurant A owner cannot read or mutate Restaurant B menus, table sessions,
  orders, analytics, AI conversations, or staff assignments.
- Staff role cannot access owner-only staff management or deployment settings.
- Manager invite cannot grant access outside the manager's assigned locations.
- Expired, revoked, accepted, wrong-email, or conflicting invitations do not
  create new active assignments.
- Customer table session access cannot read staff-only data.

## Error States

- No account: direct to sign-in.
- No active assignment: explain that the user needs restaurant access.
- Wrong restaurant/location: show not found or no access without revealing that
  another tenant owns the resource.
- Auth provider unavailable: show retry guidance and avoid partial writes.
- Unsupported locale: use English fallback and do not expose translation keys.
