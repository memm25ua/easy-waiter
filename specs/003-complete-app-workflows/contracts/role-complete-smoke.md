# Contract: Role-Complete Smoke Flow

## Scope

The production-ready app must support the primary workflows for owner,
manager, staff, and customer without demo-only data or developer intervention.
This contract defines the cross-role smoke test expected before release.

## Required Fixtures

- One restaurant
- One active location
- Two restaurant tables with stable customer links
- One owner account
- One manager account assigned to the location
- One staff account assigned to the location
- One representative PDF menu source
- One representative image menu source
- English and Spanish product locale coverage

## Smoke Flow

### Owner

1. Sign up or sign in.
2. Complete restaurant and first location setup.
3. Invite a manager and a staff user.
4. Upload a PDF or image menu source.
5. Review OCR/AI import output.
6. Resolve critical warnings.
7. Publish a menu.
8. Create or verify stable customer links for tables.

### Manager

1. Accept invitation.
2. Open assigned manager menu workspace.
3. Edit imported or manually created menu content.
4. Trigger and review a conflict scenario.
5. Publish allowed changes.
6. Open or verify active table sessions.
7. Monitor incoming orders and operational summaries.

### Staff

1. Accept invitation.
2. Open assigned order dashboard.
3. Confirm staff cannot access menu publication or staff-management actions.
4. Receive customer orders.
5. Update order status.

### Customer

1. Open a stable table link without signing in.
2. View the current published menu.
3. Add items and options.
4. Submit a manual order.
5. Build an AI-assisted order and confirm exact details before submission.
6. View order status updates for the active table session.
7. See a blocked state after staff close/reset the table session.

## Success Conditions

- No demo-only state is used.
- Every submitted order is associated with the correct restaurant, location,
  table, table session, published menu snapshot, source, and status history.
- Staff see newly submitted orders within 5 seconds during validation.
- Customer interactions show visible feedback within 2 seconds for normal menu
  browsing, cart updates, and order submission.
- Role boundaries block unauthorized menu editing, publication, staff
  management, and cross-tenant data access.
- English and Spanish product copy can complete the smoke flow, excluding
  restaurant-provided menu content.

## Required Tests

- End-to-end role-complete smoke test.
- Owner/manager/staff permission regression tests.
- Customer table-link blocked-state tests.
- Menu import critical and non-critical warning publication tests.
- Concurrent menu edit conflict test.
- Manual and AI order submission tests.
