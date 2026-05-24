# Data Model: AI Menu Ordering SaaS

## Entity Overview

### Restaurant

Represents a subscribed restaurant business.

**Fields**:

- `id`
- `name`
- `slug`
- `owner_user_id`
- `created_at`
- `updated_at`

**Relationships**:

- Has many `Location`
- Has many `StaffMember`

**Validation Rules**:

- `name` is required.
- `slug` is unique and URL-safe.
- Owner must have administrator access.

### Location

Represents one physical venue.

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
- Has many `RestaurantTable`
- Has many `Menu`
- Has many `Order`

**Validation Rules**:

- `restaurant_id`, `name`, `timezone`, and `currency` are required.
- Inactive locations cannot create new table sessions.

### StaffMember

Represents a restaurant user with location permissions.

**Fields**:

- `id`
- `restaurant_id`
- `location_id`
- `user_id`
- `role` (`owner`, `manager`, `staff`)
- `is_active`
- `created_at`

**Relationships**:

- Belongs to `Restaurant`
- Optionally scoped to one `Location`

**Validation Rules**:

- Active staff can only access restaurants and locations assigned to them.
- Owners can manage staff; managers can manage menus and orders; staff can
  monitor and update orders.

### RestaurantTable

Represents a dine-in table that can start customer ordering sessions.

**Fields**:

- `id`
- `location_id`
- `label`
- `session_code`
- `is_active`
- `created_at`
- `updated_at`

**Relationships**:

- Belongs to `Location`
- Has many `TableSession`

**Validation Rules**:

- `label` is unique within a location.
- Inactive tables cannot start new sessions.
- `session_code` must be hard to guess.

### Menu

Represents a restaurant-approved menu version.

**Fields**:

- `id`
- `location_id`
- `title`
- `status` (`draft`, `published`, `archived`)
- `source_import_id`
- `published_at`
- `created_at`
- `updated_at`

**Relationships**:

- Belongs to `Location`
- Has many `MenuSection`
- May originate from `MenuImport`

**Validation Rules**:

- Only one published menu per location for the POC.
- A menu cannot be published while it has unresolved import review flags.

### MenuImport

Represents a PDF or scan ingestion attempt.

**Fields**:

- `id`
- `location_id`
- `uploaded_by`
- `source_file_path`
- `status` (`uploaded`, `processing`, `needs_review`, `approved`, `failed`)
- `confidence_summary`
- `error_message`
- `created_at`
- `updated_at`

**Relationships**:

- Belongs to `Location`
- Created by `StaffMember`
- Can create or update a `Menu`

**State Transitions**:

- `uploaded` -> `processing`
- `processing` -> `needs_review`
- `processing` -> `failed`
- `needs_review` -> `approved`
- `needs_review` -> `processing` for re-run

**Validation Rules**:

- Only managers and owners can approve imports.
- Failed imports keep the source file and error reason for review.

### MenuSection

Groups menu items.

**Fields**:

- `id`
- `menu_id`
- `name`
- `description`
- `sort_order`

**Relationships**:

- Belongs to `Menu`
- Has many `MenuItem`

**Validation Rules**:

- `name` is required.
- `sort_order` controls display order.

### MenuItem

Represents a sellable dish or drink.

**Fields**:

- `id`
- `section_id`
- `name`
- `description`
- `price`
- `currency`
- `dietary_tags`
- `allergen_notes`
- `is_available`
- `sort_order`
- `created_at`
- `updated_at`

**Relationships**:

- Belongs to `MenuSection`
- Has many `MenuItemOption`

**Validation Rules**:

- `name`, `price`, and `currency` are required.
- `price` cannot be negative.
- Unavailable items cannot be added to new carts.

### MenuItemOption

Represents choices such as size, side, cooking point, or modifiers.

**Fields**:

- `id`
- `menu_item_id`
- `name`
- `is_required`
- `min_choices`
- `max_choices`
- `sort_order`

**Relationships**:

- Belongs to `MenuItem`
- Has many `MenuItemOptionValue`

**Validation Rules**:

- Required option groups must have at least one selected value.
- `max_choices` must be greater than or equal to `min_choices`.

### MenuItemOptionValue

Represents a selectable modifier value.

**Fields**:

- `id`
- `option_id`
- `name`
- `price_delta`
- `is_available`
- `sort_order`

**Validation Rules**:

- Unavailable option values cannot be selected for new orders.

### TableSession

Represents one active on-site customer ordering context.

**Fields**:

- `id`
- `table_id`
- `location_id`
- `session_code`
- `status` (`active`, `closed`, `expired`)
- `opened_at`
- `closed_at`

**Relationships**:

- Belongs to `RestaurantTable`
- Has many `Order`
- Has many `AIConversation`

**Validation Rules**:

- Only active sessions can submit orders.
- Session code must resolve to exactly one active table context.

### AIConversation

Represents a customer's interaction with the AI waiter.

**Fields**:

- `id`
- `table_session_id`
- `status` (`active`, `escalated`, `closed`)
- `last_message_at`
- `created_at`

**Relationships**:

- Belongs to `TableSession`
- Has many `AIMessage`
- Can propose `CartProposal`

**Validation Rules**:

- Conversations can only access menu and policy data for their location.
- Escalated conversations remain visible to staff.

### AIMessage

Stores customer, assistant, and system-visible conversation messages.

**Fields**:

- `id`
- `conversation_id`
- `sender` (`customer`, `assistant`, `system`)
- `content`
- `action_type`
- `action_payload`
- `created_at`

**Validation Rules**:

- Order-submission action payloads must not execute until customer confirmation.

### CartProposal

Represents a cart assembled manually or by the AI before submission.

**Fields**:

- `id`
- `table_session_id`
- `conversation_id`
- `status` (`draft`, `awaiting_confirmation`, `submitted`, `abandoned`)
- `items`
- `notes`
- `created_at`
- `updated_at`

**Validation Rules**:

- Cart totals are calculated from current menu item and option prices.
- Submission requires explicit confirmation of item, quantity, options, notes,
  and table context.

### Order

Represents a submitted table order.

**Fields**:

- `id`
- `location_id`
- `table_session_id`
- `source` (`manual`, `ai_waiter`)
- `status` (`new`, `accepted`, `preparing`, `ready`, `served`, `cancelled`, `needs_attention`)
- `items`
- `customer_notes`
- `staff_notes`
- `created_at`
- `updated_at`

**Relationships**:

- Belongs to `Location`
- Belongs to `TableSession`
- May reference `AIConversation`

**State Transitions**:

- `new` -> `accepted`
- `new` -> `needs_attention`
- `new` -> `cancelled`
- `accepted` -> `preparing`
- `accepted` -> `cancelled`
- `preparing` -> `ready`
- `preparing` -> `needs_attention`
- `ready` -> `served`
- `needs_attention` -> `accepted`
- `needs_attention` -> `cancelled`

**Validation Rules**:

- Orders cannot include unavailable items or option values.
- Status updates require staff access to the order's location.
- Customer-visible status must stay consistent with staff dashboard status.

### OperationalSummary

Represents aggregated activity for owner review.

**Fields**:

- `location_id`
- `period_start`
- `period_end`
- `total_orders`
- `ai_assisted_orders`
- `manual_orders`
- `staff_interventions`
- `average_order_submission_seconds`

**Validation Rules**:

- Summaries are derived from orders, table sessions, and AI escalation events.
- Owners and managers can view summaries for their assigned restaurants.
