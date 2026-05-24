# Contract: UI Routes

## Public Landing

### `/`

**Purpose**: Minimal product entry for restaurant staff sign-in and demo table
ordering access.

**States**:

- Signed-out restaurant user sees sign-in action.
- Signed-in staff user is directed to manager dashboard.
- Demo table link is available in local/demo environments.

## Manager And Staff Routes

### `/manager`

**Purpose**: Dashboard overview for active orders, menu status, table activity,
and quick links.

**Requires**: Active staff membership.

**States**:

- Loading assigned restaurant/location.
- Empty state when no active orders exist.
- Needs-attention state when orders require staff review.
- Error state when the user has no active staff assignment.

### `/manager/menus`

**Purpose**: List menus and import status.

**Actions**:

- Start PDF/scan upload.
- Open import review.
- Publish approved menu.
- Mark item availability.

**States**:

- No menu exists.
- Import processing.
- Import needs review.
- Import failed with retry guidance.
- Published menu ready.

### `/manager/menus/[menuId]`

**Purpose**: Review and edit menu sections, items, prices, options, and AI
improvement suggestions.

**Actions**:

- Edit section and item fields.
- Accept, edit, or reject AI suggestions.
- Resolve low-confidence extraction flags.
- Publish menu when all required fields are valid.

**Validation**:

- Item name, price, and currency are required.
- Unresolved extraction flags block publishing.
- Price changes require explicit manager save.

### `/manager/orders`

**Purpose**: Staff order monitor.

**Actions**:

- View incoming orders by status.
- Move orders through accepted, preparing, ready, served, cancelled, and
  needs-attention states.
- Add staff notes.

**States**:

- New order notification.
- Empty state for no active orders.
- Needs-attention highlight.
- Realtime disconnected warning with manual refresh option.

### `/manager/analytics`

**Purpose**: POC operational summary for owner validation.

**Content**:

- Total orders by period.
- AI-assisted orders.
- Manual orders.
- Staff intervention count.
- Average time from table open to order submission.

## Customer Routes

### `/table/[sessionCode]`

**Purpose**: Table-specific customer ordering experience.

**Access**: Active table session only.

**Content**:

- Published menu sections and items.
- Manual cart.
- AI waiter conversation.
- Submitted order status.

**Actions**:

- Browse, search, and filter menu items.
- Add available items and option values to cart.
- Submit manual order after confirmation.
- Ask AI waiter menu questions.
- Accept an AI-generated cart proposal and submit after confirmation.

**States**:

- Invalid or expired table session.
- No published menu.
- Item unavailable.
- Required option missing.
- AI answer available.
- AI escalation required.
- Order submitted.
- Order status updated.

## UX Consistency Requirements

- All destructive or final actions require clear confirmation.
- AI-submitted orders use the same visible confirmation summary as manual
  orders.
- Loading states preserve layout and do not hide current cart contents.
- Error states explain the next useful action.
- Customer-facing text avoids operational jargon such as RLS, function, row,
  migration, or policy.
