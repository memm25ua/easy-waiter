# Data Model: Complete App Workflows

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
- `updated_at`

**Relationships**:

- Has many `RestaurantRoleAssignment`
- Creates `MenuImportJob`, `MenuDraftVersion`, `PublishedMenuSnapshot`, and
  `TableSession` records when authorized

**Validation Rules**:

- Staff, manager, and owner routes require an authenticated account with an
  active assignment.
- Preferred locale must be `en` or `es` when present.

### Restaurant

Represents a business tenant with isolated operational data.

**Fields**:

- `id`
- `name`
- `slug`
- `created_at`
- `updated_at`

**Relationships**:

- Has many `Location`
- Has many `RestaurantRoleAssignment`
- Owns menu import, menu draft, published menu, table session, and order data
  through locations

**Validation Rules**:

- Tenant-owned records must never be readable or writable from another
  restaurant context.
- Slug must be unique and URL-safe.

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
- Has many `RestaurantTable`, `MenuImportJob`, `MenuDraft`, `PublishedMenu`,
  `TableSession`, and `CustomerOrder`
- Has many location-scoped manager and staff assignments

**Validation Rules**:

- Inactive locations cannot open new table sessions.
- Currency is required before menu publication and order submission.

### RestaurantRoleAssignment

Represents owner, manager, or staff access.

**Fields**:

- `id`
- `account_id`
- `restaurant_id`
- `location_id`
- `role` (`owner`, `manager`, `staff`)
- `is_active`
- `accepted_at`
- `created_at`
- `updated_at`

**Relationships**:

- Belongs to `Account`
- Belongs to `Restaurant`
- Optionally belongs to `Location`

**Validation Rules**:

- Owners manage restaurant setup, locations, users, menus, table links, and
  operational visibility.
- Managers manage menus, import reviews, table links, orders, and operational
  visibility only for assigned scope.
- Staff handle assigned-location orders only.
- Customers and unauthenticated visitors have no staff assignment permissions.

### MenuImportJob

Represents a PDF/image menu conversion attempt.

**Fields**:

- `id`
- `restaurant_id`
- `location_id`
- `uploaded_by_account_id`
- `source_file_path`
- `source_file_name`
- `source_file_type`
- `source_file_size`
- `status` (`uploaded`, `ocr_processing`, `ai_processing`, `review_ready`, `failed`, `cancelled`)
- `ocr_text`
- `ocr_confidence_summary`
- `ai_prompt_version`
- `ai_model`
- `ai_resource_reference`
- `ai_response_summary`
- `failure_reason`
- `created_at`
- `updated_at`
- `completed_at`

**Relationships**:

- Belongs to `Restaurant` and `Location`
- Created by an owner or authorized manager
- Produces one `MenuDraft` when successful
- Has many `ImportWarning`

**Validation Rules**:

- Only owners and authorized managers may create or view import jobs.
- Uploaded source files and OCR text are tenant-scoped.
- Failed jobs preserve user-facing failure reason and allow manual menu entry.
- AI/provider secrets and raw auth tokens are never stored in import records.

### ImportWarning

Represents field-level uncertainty from OCR or AI normalization.

**Fields**:

- `id`
- `menu_import_job_id`
- `menu_draft_id`
- `target_type` (`draft`, `category`, `item`, `option_group`, `option_value`)
- `target_id`
- `severity` (`critical`, `non_critical`)
- `field_name`
- `message`
- `source_excerpt`
- `status` (`open`, `resolved`, `accepted`)
- `created_at`
- `resolved_by_account_id`
- `resolved_at`

**Relationships**:

- Belongs to `MenuImportJob`
- May point to a draft, category, item, option group, or option value

**Validation Rules**:

- Critical warnings block publication until resolved.
- Non-critical warnings may remain after publication but stay visible to
  owners and managers.
- Warning messages must be understandable in product UI copy and must not
  expose provider internals.

### MenuDraft

Represents editable menu content that is not automatically customer-visible.

**Fields**:

- `id`
- `restaurant_id`
- `location_id`
- `source_import_job_id`
- `name`
- `status` (`draft`, `review_ready`, `ready_to_publish`, `published`, `archived`)
- `base_version`
- `current_version`
- `created_by_account_id`
- `updated_by_account_id`
- `created_at`
- `updated_at`

**Relationships**:

- Belongs to `Restaurant` and `Location`
- May originate from `MenuImportJob`
- Has many `MenuCategory`
- Has many `MenuDraftVersion`
- Can create one or more `PublishedMenuSnapshot`

**Validation Rules**:

- Only owners and authorized managers may edit.
- Publication requires no open critical warnings.
- Saves must include the version last seen by the editor; stale saves trigger a
  conflict review instead of overwriting newer changes.

### MenuDraftVersion

Represents a saved draft revision used for audit and conflict detection.

**Fields**:

- `id`
- `menu_draft_id`
- `version_number`
- `change_summary`
- `changed_by_account_id`
- `created_at`

**Relationships**:

- Belongs to `MenuDraft`

**Validation Rules**:

- Version numbers increase monotonically within a draft.
- Conflict detection compares the editor's last seen version against the
  current draft version.

### MenuCategory

Represents a section of a menu.

**Fields**:

- `id`
- `menu_draft_id`
- `name`
- `description`
- `display_order`
- `is_visible`
- `created_at`
- `updated_at`

**Relationships**:

- Belongs to `MenuDraft`
- Has many `MenuItem`

**Validation Rules**:

- Name is required for visible categories.
- Display order is unique within the draft.

### MenuItem

Represents an orderable or informational item.

**Fields**:

- `id`
- `menu_category_id`
- `name`
- `description`
- `price`
- `currency`
- `is_orderable`
- `is_available`
- `dietary_notes`
- `allergen_notes`
- `customer_notes`
- `display_order`
- `created_at`
- `updated_at`

**Relationships**:

- Belongs to `MenuCategory`
- Has many `MenuOptionGroup`
- May have field-level `ImportWarning`

**Validation Rules**:

- Orderable items require name, price, currency, and availability state.
- Required option groups must have at least one available option value.
- Allergen or safety claims from import must be reviewed before publication
  when uncertain.

### MenuOptionGroup

Represents a choice set for a menu item.

**Fields**:

- `id`
- `menu_item_id`
- `name`
- `is_required`
- `min_select`
- `max_select`
- `display_order`

**Relationships**:

- Belongs to `MenuItem`
- Has many `MenuOptionValue`

**Validation Rules**:

- Required groups must define valid minimum and maximum selections.
- Maximum selections cannot be lower than minimum selections.

### MenuOptionValue

Represents a selectable option or modifier.

**Fields**:

- `id`
- `menu_option_group_id`
- `name`
- `price_delta`
- `is_available`
- `display_order`

**Relationships**:

- Belongs to `MenuOptionGroup`

**Validation Rules**:

- Name is required.
- Price delta defaults to zero when no additional cost is entered.

### PublishedMenuSnapshot

Represents the customer-visible menu version for a location.

**Fields**:

- `id`
- `restaurant_id`
- `location_id`
- `menu_draft_id`
- `menu_draft_version`
- `published_by_account_id`
- `published_at`
- `is_current`
- `snapshot_payload`

**Relationships**:

- Belongs to `Location`
- Reads from `MenuDraft`
- Used by `TableSession`, `CustomerOrder`, and AI context builders

**Validation Rules**:

- Only one current published menu may exist per location.
- Publication is blocked when the source draft has open critical warnings.
- Customers can read only the current published snapshot for an active table
  session.

### RestaurantTable

Represents a physical table with one stable customer entry point.

**Fields**:

- `id`
- `location_id`
- `label`
- `stable_entry_token_hash`
- `is_active`
- `created_at`
- `updated_at`

**Relationships**:

- Belongs to `Location`
- Has many `TableSession`

**Validation Rules**:

- Label must be unique within a location.
- One stable customer link/QR maps to one restaurant table.
- Stable entry tokens are unguessable and stored hashed.

### TableSession

Represents the current party/order context for a table.

**Fields**:

- `id`
- `restaurant_table_id`
- `location_id`
- `status` (`active`, `closed`)
- `opened_by_account_id`
- `closed_by_account_id`
- `opened_at`
- `closed_at`
- `current_published_menu_id`

**Relationships**:

- Belongs to `RestaurantTable`
- Belongs to `Location`
- Has many `CustomerOrder`

**Validation Rules**:

- A table may have at most one active session at a time.
- The stable table link resolves only to the current active session.
- Ordering is blocked when no active session exists or staff close/reset the
  session.

### CustomerOrder

Represents a submitted request from an active table session.

**Fields**:

- `id`
- `restaurant_id`
- `location_id`
- `table_session_id`
- `published_menu_snapshot_id`
- `source` (`manual`, `ai`)
- `status` (`submitted`, `accepted`, `preparing`, `ready`, `served`, `cancelled`)
- `items`
- `currency`
- `total`
- `customer_notes`
- `staff_notes`
- `created_at`
- `updated_at`

**Relationships**:

- Belongs to `TableSession`
- Belongs to `PublishedMenuSnapshot`
- Has many `OrderStatusEvent`
- May originate from `AIOrderProposal`

**Validation Rules**:

- Submitted items must match the current published menu and selected options.
- Orders can be created only for active table sessions.
- Customers may view status for orders in their active table session only.

### OrderStatusEvent

Represents a staff-visible and customer-visible status transition.

**Fields**:

- `id`
- `customer_order_id`
- `from_status`
- `to_status`
- `changed_by_account_id`
- `created_at`

**Relationships**:

- Belongs to `CustomerOrder`

**Validation Rules**:

- Staff may update only assigned-location orders.
- Customer-visible status must not expose private staff notes.

### AIOrderProposal

Represents an AI-created cart proposal awaiting customer confirmation.

**Fields**:

- `id`
- `table_session_id`
- `published_menu_snapshot_id`
- `proposal_payload`
- `status` (`proposed`, `confirmed`, `rejected`, `expired`)
- `created_order_id`
- `created_at`
- `confirmed_at`

**Relationships**:

- Belongs to `TableSession`
- May create one `CustomerOrder`

**Validation Rules**:

- Exact customer confirmation is required before order creation.
- Modified or stale proposals are rejected and must be regenerated or edited
  manually.

## State Transitions

### MenuImportJob

```text
uploaded -> ocr_processing -> ai_processing -> review_ready
uploaded -> ocr_processing -> failed
ocr_processing -> failed
ai_processing -> failed
uploaded|ocr_processing|ai_processing|review_ready -> cancelled
```

### MenuDraft

```text
draft -> review_ready -> ready_to_publish -> published
draft|review_ready|ready_to_publish -> archived
published -> draft (when editing a new revision)
```

### TableSession

```text
active -> closed
```

### CustomerOrder

```text
submitted -> accepted -> preparing -> ready -> served
submitted|accepted|preparing -> cancelled
```
