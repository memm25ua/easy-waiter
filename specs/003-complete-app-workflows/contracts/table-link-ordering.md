# Contract: Table Link Ordering

## Scope

Each restaurant table has one stable customer link or QR entry point. The
stable entry point resolves to the current active `TableSession`. Customers do
not need accounts. Ordering is blocked when staff close or reset the session or
when no published menu is available.

## `openTableSession`

**Caller**: owner, manager, or assigned staff with table-session permission

**Input**:

- `restaurant_table_id`
- `location_id`
- `opened_by_account_id`

**Output**:

- `table_session_id`
- `stable_customer_url`
- `status`
- `opened_at`

**Rules**:

- A table may have at most one active session.
- Opening a session for a table with an existing active session returns the
  current active session instead of creating a duplicate.
- The stable customer URL does not expose restaurant, location, or session
  internals.

## `closeTableSession`

**Caller**: owner, manager, or assigned staff with table-session permission

**Input**:

- `table_session_id`
- `closed_by_account_id`

**Output**:

- `table_session_id`
- `status` (`closed`)
- `closed_at`

**Rules**:

- Closed sessions reject new orders.
- Closed sessions remain available for staff audit and customer status where
  appropriate, but must not allow continued ordering.

## `resolveCustomerTableLink`

**Caller**: unauthenticated customer route

**Input**:

- `stable_entry_token`
- `locale`

**Output**:

- `table_label`
- `location_name`
- `published_menu`
- `active_table_session_id`
- `customer_visible_orders[]`
- `blocked_reason` when unavailable

**Rules**:

- Resolve only the current active session for the table.
- Return customer-visible menu and order data only for that active session.
- If no active session exists, return a blocked state with clear guidance.
- If no current published menu exists, return a blocked state with clear
  guidance.
- Never return staff notes, private staff data, or cross-tenant data.

## `submitCustomerOrder`

**Caller**: unauthenticated customer route for an active table session

**Input**:

- `stable_entry_token`
- `table_session_id`
- `items[]`
- `selected_options[]`
- `quantities`
- `customer_notes`
- `source` (`manual`, `ai`)
- `ai_order_proposal_id` when source is `ai`

**Output**:

- `customer_order_id`
- `status`
- `submitted_at`
- `customer_message`

**Rules**:

- Validate the table session is active at submit time.
- Validate items and selected options against the current published menu.
- Reject unavailable items, missing required options, invalid quantities, or
  stale AI proposals.
- AI-created orders require exact customer confirmation before submission.
- Staff assigned to the location see the order within the service visibility
  budget.

## Required Tests

- One stable link per table resolves to the current active session.
- Link with no active session blocks ordering.
- Closed/reset session blocks new orders.
- Customer sees published menu without signing in.
- Customer cannot see drafts, staff notes, or another table's orders.
- Manual order submission creates an order for the correct table session.
- AI proposal submission requires exact confirmation.
- Staff status update is visible to the originating table session.
- Cross-tenant or altered token attempts do not reveal private data.
