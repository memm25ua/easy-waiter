# Contract: Supabase Backend

## Scope

Supabase is the backend boundary for the POC. The SvelteKit app reads and
writes through authenticated Supabase clients, server-only service clients, and
Supabase Edge Functions for AI workflows.

## Tables

### `restaurants`

- Columns: `id`, `name`, `slug`, `owner_user_id`, `created_at`, `updated_at`
- Access: owners can manage; assigned staff can read basic restaurant metadata.

### `locations`

- Columns: `id`, `restaurant_id`, `name`, `timezone`, `currency`, `is_active`,
  `created_at`, `updated_at`
- Access: assigned staff can read; owners/managers can update.

### `staff_members`

- Columns: `id`, `restaurant_id`, `location_id`, `user_id`, `role`,
  `is_active`, `created_at`
- Access: owners can manage; active staff can read their own assignment.

### `restaurant_tables`

- Columns: `id`, `location_id`, `label`, `session_code`, `is_active`,
  `created_at`, `updated_at`
- Access: staff can manage; public table access resolves only active session
  context and published menu data.

### `menu_imports`

- Columns: `id`, `location_id`, `uploaded_by`, `source_file_path`, `status`,
  `confidence_summary`, `error_message`, `created_at`, `updated_at`
- Access: owners/managers can create and approve; staff can read import status
  if assigned to the location.

### `menus`

- Columns: `id`, `location_id`, `title`, `status`, `source_import_id`,
  `published_at`, `created_at`, `updated_at`
- Access: staff can read drafts for assigned locations; table sessions can read
  only the published menu for their location.

### `menu_sections`

- Columns: `id`, `menu_id`, `name`, `description`, `sort_order`
- Access: follows parent menu access.

### `menu_items`

- Columns: `id`, `section_id`, `name`, `description`, `price`, `currency`,
  `dietary_tags`, `allergen_notes`, `is_available`, `sort_order`, `created_at`,
  `updated_at`
- Access: follows parent menu access; customers can read published available
  and unavailable states for context but cannot order unavailable items.

### `menu_item_options`

- Columns: `id`, `menu_item_id`, `name`, `is_required`, `min_choices`,
  `max_choices`, `sort_order`
- Access: follows parent menu item access.

### `menu_item_option_values`

- Columns: `id`, `option_id`, `name`, `price_delta`, `is_available`,
  `sort_order`
- Access: follows parent option access.

### `table_sessions`

- Columns: `id`, `table_id`, `location_id`, `session_code`, `status`,
  `opened_at`, `closed_at`
- Access: public table session can read its own active session; staff can read
  sessions for assigned locations.

### `ai_conversations`

- Columns: `id`, `table_session_id`, `status`, `last_message_at`, `created_at`
- Access: table session can read/write its own conversation through controlled
  actions; staff can read escalated conversations for assigned locations.

### `ai_messages`

- Columns: `id`, `conversation_id`, `sender`, `content`, `action_type`,
  `action_payload`, `created_at`
- Access: follows parent conversation access. Service role writes assistant and
  system messages.

### `cart_proposals`

- Columns: `id`, `table_session_id`, `conversation_id`, `status`, `items`,
  `notes`, `created_at`, `updated_at`
- Access: table session can create/update its own draft or confirmation state;
  submitted carts become orders.

### `orders`

- Columns: `id`, `location_id`, `table_session_id`, `source`, `status`,
  `items`, `customer_notes`, `staff_notes`, `created_at`, `updated_at`
- Access: table session can create and read its own orders; staff can read and
  update status for orders in assigned locations.

## Storage Buckets

### `menu-imports`

- Stores uploaded PDFs and scanned images.
- Owners/managers can upload for assigned locations.
- Service role can read files during import processing.
- Public access is disabled.

## Realtime Channels

- `orders:location:{location_id}`: Staff dashboard receives new orders and
  status changes.
- `orders:session:{table_session_id}`: Customer receives status changes for
  submitted orders.
- `ai:conversation:{conversation_id}`: Customer receives AI waiter responses.

## Row Level Security Expectations

- RLS enabled on all tenant-owned tables.
- Staff access is derived from active `staff_members` rows.
- Customer table access is limited to active `table_sessions` and published
  menu data for the session location.
- Service-role access is limited to server-only code paths and Edge Functions.

## Migration Acceptance

- Migration creates all tables, indexes, foreign keys, status constraints, and
  RLS policies.
- Seed data creates one demo restaurant, one location, three tables, one
  published sample menu, and staff users suitable for local validation.
