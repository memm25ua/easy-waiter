# Contract: AI Actions

## Menu Import Function

### `import-menu`

**Purpose**: Convert a manager-uploaded PDF or scan into a structured draft
menu and improvement suggestions.

**Caller**: Manager menu import flow.

**Input**:

- `menu_import_id`
- `location_id`
- `source_file_path`
- `requested_by`

**Output**:

- `status`: `needs_review` or `failed`
- `draft_menu`: sections, items, prices, options, dietary notes, allergen notes
- `confidence_flags`: fields requiring manager review
- `suggestions`: optional description, grouping, and upsell improvements
- `error_message`: present only on failure

**Rules**:

- The function only processes files owned by the caller's assigned location.
- Price changes are never auto-applied as AI suggestions.
- Customer-visible content is not changed until a manager publishes the menu.
- Low-confidence extraction flags block publishing until resolved.

## AI Waiter Function

### `ai-waiter`

**Purpose**: Answer customer menu questions, recommend items, build cart
proposals, and execute confirmed order submission for an active table session.

**Caller**: Customer table ordering route.

**Input**:

- `table_session_id`
- `conversation_id`
- `message`
- `current_cart`
- `customer_confirmed_action`

**Output**:

- `reply`
- `recommended_items`
- `cart_proposal`
- `requires_confirmation`
- `escalation_reason`
- `submitted_order_id`

**Allowed Actions**:

- Answer menu, ingredient, allergen, availability, and recommendation questions
  using restaurant-approved data.
- Add available items and valid option values to a cart proposal.
- Remove or change items in a cart proposal.
- Submit an order only when `customer_confirmed_action` matches the current
  proposal exactly.
- Escalate requests requiring staff judgment.

**Blocked Actions**:

- Submit an order without explicit confirmation.
- Invent ingredients, prices, policies, or availability not present in approved
  restaurant data.
- Override unavailable item restrictions.
- Cancel or refund orders after preparation starts.
- Access another restaurant, location, table, or conversation.

## Confirmation Contract

Before any AI-created order is submitted, the customer must see and confirm:

- Restaurant and table context
- Item names
- Quantities
- Selected options and modifiers
- Customer notes
- Any unavailable or unresolved items removed from the proposal

If the confirmed payload differs from the current proposal, submission is
rejected and the customer is asked to review the updated cart.

## Audit Contract

Every AI action writes an auditable message or event containing:

- Conversation ID
- Table session ID
- Action type
- Proposed payload
- Confirmation state
- Result or escalation reason
- Timestamp
