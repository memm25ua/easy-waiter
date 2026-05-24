# Data Model: Production Readiness

## Entity Overview

### Account

Represents a person who can authenticate and operate one or more restaurant
assignments.

**Fields**:

- `id`
- `email`
- `display_name`
- `created_at`
- `last_sign_in_at`

**Relationships**:

- Has many `StaffAssignment`
- Creates `MarketingLead` only when requesting contact before sign-up

**Validation Rules**:

- Email must be unique through the authentication provider.
- Staff routes require an account with at least one active assignment.
- Account recovery follows the configured auth provider flow.

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
- `created_at`

**Relationships**:

- Belongs to `Account`
- Belongs to `Restaurant`
- Optionally belongs to one `Location`

**Validation Rules**:

- Owners may administer restaurant setup and staff assignments.
- Managers may manage menus, tables, orders, and analytics for assigned
  locations.
- Staff may monitor and update orders for assigned locations.
- Inactive assignments cannot access staff routes.

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
- `status` (`active`, `closed`, `expired`)
- `opened_at`
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
- Session codes must be scoped to the table and hard to guess.

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
- `last_message_at`
- `created_at`

**Relationships**:

- Belongs to `TableSession` for customer AI waiter flows
- Has many `AIMessage`
- Has many `AIActionAudit`

**Validation Rules**:

- Customer conversations are scoped to active table sessions.
- Staff-visible escalations require active staff assignment.

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

### MarketingLead

Represents a public visitor who requests contact instead of signing up.

**Fields**:

- `id`
- `restaurant_name`
- `contact_name`
- `email`
- `phone`
- `message`
- `source`
- `created_at`

**Relationships**:

- May later be converted into an `Account` and `Restaurant`

**Validation Rules**:

- Email is required.
- Lead capture must not create staff access.
- Public lead submission must be rate-limited or protected from abuse.

### DeploymentEnvironment

Represents documented production or staging runtime configuration.

**Fields**:

- `name`
- `app_url`
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

## State Transitions

### StaffAssignment

- `active` -> `inactive`
- `inactive` -> `active` only by owner or authorized manager

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
