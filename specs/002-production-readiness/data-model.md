# Data Model: Production Readiness

## Entity Overview

### Account

Represents a person who can authenticate and operate one or more restaurant
assignments.

**Fields**:

- `id`
- `email`
- `display_name`
- `preferred_locale`
- `created_at`
- `last_sign_in_at`

**Relationships**:

- Has many `StaffAssignment`
- Has one active `LanguagePreference`
- Creates `MarketingLead` only when requesting contact before sign-up

**Validation Rules**:

- Email must be unique through the authentication provider.
- Staff routes require an account with at least one active assignment.
- Account recovery follows the configured auth provider flow.
- Preferred locale must be `en` or `es` when present.

### Restaurant

Represents a business tenant.

**Fields**:

- `id`
- `name`
- `slug`
- `owner_account_id`
- `created_at`
- `updated_at`

**Relationships**:

- Has many `Location`
- Has many `StaffAssignment`
- Has many tenant-owned operational records through locations

**Validation Rules**:

- `name` and `slug` are required.
- `slug` must be unique and URL-safe.
- Owners can administer the restaurant; other roles are scoped by assignment.

### Location

Represents a physical restaurant venue.

**Fields**:

- `id`
- `restaurant_id`
- `name`
- `timezone`
- `currency`
- `is_active`
- `created_at`
- `updated_at`

**Relationships**:

- Belongs to `Restaurant`
- Has many `RestaurantTable`, `Menu`, `TableSession`, and `Order`
- Has many location-scoped `StaffAssignment`

**Validation Rules**:

- Inactive locations cannot create new table sessions.
- Currency and timezone must be present for customer-facing display.

### StaffAssignment

Represents account access to a restaurant or location.

**Fields**:

- `id`
- `account_id`
- `restaurant_id`
- `location_id`
- `role` (`owner`, `manager`, `staff`)
- `is_active`
- `invitation_id`
- `accepted_at`
- `created_at`

**Relationships**:

- Belongs to `Account`
- Belongs to `Restaurant`
- Optionally belongs to one `Location`
- May be created from one `StaffInvitation`

**Validation Rules**:

- Owners may administer restaurant profile, locations, staff, menus, and
  analytics.
- Managers may manage assigned locations, menus, orders, and analytics.
- Staff may handle assigned-location orders only.
- Inactive assignments cannot access staff routes.
- Non-owner assignments for existing restaurants are created through accepted
  owner or manager email invitations with explicit role and location scope.

### StaffInvitation

Represents an invitation for a person to join an existing restaurant.

**Fields**:

- `id`
- `restaurant_id`
- `location_id`
- `email`
- `role` (`manager`, `staff`)
- `status` (`pending`, `accepted`, `expired`, `revoked`)
- `token_hash`
- `invited_by_account_id`
- `accepted_by_account_id`
- `expires_at`
- `accepted_at`
- `created_at`

**Relationships**:

- Belongs to `Restaurant`
- Optionally belongs to one `Location`
- Created by an owner or authorized manager account
- Creates one `StaffAssignment` when accepted

**Validation Rules**:

- Invitation tokens are unguessable and stored hashed.
- Owners may invite managers or staff within their restaurant.
- Managers may invite staff only for locations they manage.
- Invitations cannot create access after expiry, revocation, or acceptance.
- Accepted invitation email must match the accepting account email unless an
  owner resolves the mismatch.

### RestaurantTable

Represents a physical table available for dine-in sessions.

**Fields**:

- `id`
- `location_id`
- `label`
- `qr_token`
- `is_active`
- `created_at`
- `updated_at`

**Relationships**:

- Belongs to `Location`
- Has many `TableSession`

**Validation Rules**:

- Label must be unique within a location.
- Inactive tables cannot open new sessions.
- QR/token values must not reveal tenant internals.

### TableSession

Represents a time-bound customer ordering context.

**Fields**:

- `id`
- `table_id`
- `location_id`
- `session_code`
- `access_token_hash`
- `status` (`active`, `closed`, `expired`)
- `opened_at`
- `expires_at`
- `closed_at`
- `created_by`

**Relationships**:

- Belongs to `RestaurantTable`
- Belongs to `Location`
- Has many `Order`
- Has many `AIConversation`

**Validation Rules**:

- Only active sessions can submit new orders.
- Closed or expired sessions remain readable for audit but block ordering.
- Customer access tokens must be unguessable, scoped to one active table
  session, stored hashed, and invalid after staff close or expiry.
- Token guessing, reuse across sessions, or token alteration must not reveal
  staff-only or cross-tenant data.

### PersistentMenu

Represents the published and draft menu state stored in Supabase.

**Fields**:

- Uses existing menu, section, item, option, and option value fields
- `status`
- `published_at`
- `updated_by`

**Relationships**:

- Belongs to `Location`
- May originate from `MenuImport`
- Is read by customer table sessions and AI context builders

**Validation Rules**:

- Only one published menu per location for the initial product.
- Drafts may be edited by owners/managers.
- Customers can read published menus for their active table session only.

### Order

Represents a customer-submitted order.

**Fields**:

- `id`
- `location_id`
- `table_session_id`
- `source` (`manual`, `ai`)
- `status`
- `items`
- `total`
- `currency`
- `customer_notes`
- `staff_notes`
- `created_at`
- `updated_at`

**Relationships**:

- Belongs to `Location`
- Belongs to `TableSession`
- May be linked from an `AIActionAudit`

**Validation Rules**:

- Items must be valid against the current published menu when submitted.
- AI-created orders require matching explicit customer confirmation.
- Status transitions follow the existing order status rules.

### AIProviderConfiguration

Represents server-side AI provider settings.

**Fields**:

- `provider_name`
- `model`
- `base_url`
- `timeout_ms`
- `enabled`
- secret reference stored outside user-visible data

**Relationships**:

- Used by `AIConversation` and menu import assistance

**Validation Rules**:

- Secrets must never be exposed to browser code.
- Disabled or missing configuration must trigger manual fallback states.
- Model changes require smoke-test validation.

### AIConversation

Represents customer or manager AI interaction state.

**Fields**:

- `id`
- `restaurant_id`
- `location_id`
- `table_session_id`
- `status` (`open`, `escalated`, `closed`)
- `locale`
- `last_message_at`
- `created_at`

**Relationships**:

- Belongs to `TableSession` for customer AI waiter flows
- Has many `AIMessage`
- Has many `AIActionAudit`

**Validation Rules**:

- Customer conversations are scoped to active table sessions.
- Staff-visible escalations require active staff assignment.
- Locale must be `en` or `es` and should match the product language selected
  for the customer or staff interaction.

### AIActionAudit

Records AI proposals, confirmations, fallbacks, and outcomes.

**Fields**:

- `id`
- `conversation_id`
- `table_session_id`
- `action_type`
- `proposed_payload`
- `confirmed_payload`
- `result`
- `escalation_reason`
- `submitted_order_id`
- `created_at`

**Relationships**:

- Belongs to `AIConversation`
- May reference `Order`

**Validation Rules**:

- Every AI order proposal and confirmation must be auditable.
- Failed provider calls record fallback reason without storing secrets.
- Allergens or safety uncertainty, unavailable items, substitutions outside
  menu options, complaints, refunds, discounts, and cancellation requests after
  submission record escalation reason and do not complete automatically.

### MarketingLead

Represents a public visitor who requests contact instead of signing up.

**Fields**:

- `id`
- `restaurant_name`
- `contact_name`
- `email`
- `phone`
- `locale`
- `message`
- `source`
- `created_at`

**Relationships**:

- May later be converted into an `Account` and `Restaurant`

**Validation Rules**:

- Email is required.
- Lead capture must not create staff access.
- Public lead submission must be rate-limited or protected from abuse.
- Locale records the product language used when the visitor submitted the
  lead.

### LanguagePreference

Represents a user's selected product interface language.

**Fields**:

- `id`
- `account_id`
- `anonymous_session_id`
- `locale` (`en`, `es`)
- `source` (`explicit`, `browser`, `default`)
- `created_at`
- `updated_at`

**Relationships**:

- May belong to an `Account` after sign-up or sign-in
- May belong to an anonymous marketing or table-ordering browser session before
  authentication
- Is read by public, account, onboarding, customer, staff, manager, AI, and
  operational flows to choose translated product copy

**Validation Rules**:

- Locale is limited to English (`en`) and Spanish (`es`) in this production
  increment.
- Explicit user choice overrides browser/user locale detection.
- Unsupported browser/user locales fall back to English.
- Language changes must preserve the current workflow state for sign-up, table
  ordering, AI confirmation, staff order update, and manager menu review.
- Restaurant-provided content is not automatically translated.

### DeploymentEnvironment

Represents documented Coolify production or staging runtime configuration.

**Fields**:

- `name`
- `app_url`
- `coolify_project_id`
- `coolify_service_id`
- `supabase_project_ref`
- `auth_redirect_urls`
- `ai_provider_enabled`
- `last_smoke_test_at`
- `last_smoke_test_result`

**Relationships**:

- Owns smoke-test records and deployment notes

**Validation Rules**:

- Required secrets and public values must be present before launch.
- Failed smoke tests block production release.
- Production deployment documentation must target Coolify and include
  local/staging validation plus rollback instructions.

## State Transitions

### StaffAssignment

- `invited` -> `active` when invitation is accepted
- `active` -> `inactive`
- `inactive` -> `active` only by owner or authorized manager

### StaffInvitation

- `pending` -> `accepted`
- `pending` -> `expired`
- `pending` -> `revoked`
- `accepted`, `expired`, and `revoked` are terminal for that invitation

### TableSession

- `active` -> `closed`
- `active` -> `expired`
- `closed` and `expired` are terminal for ordering

### AIConversation

- `open` -> `escalated`
- `open` -> `closed`
- `escalated` -> `closed`

### Deployment Smoke Test

- `pending` -> `running`
- `running` -> `passed`
- `running` -> `failed`
- `failed` -> `running` for retry after remediation

### LanguagePreference

- `default` -> `explicit` when a user manually selects English or Spanish
- `browser` -> `explicit` when a user manually selects English or Spanish
- `explicit` -> `explicit` when switching between English and Spanish
