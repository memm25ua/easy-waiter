# Quickstart: Complete App Workflows

## Purpose

Validate the complete owner, manager, staff, and customer workflows for
PDF/image menu import, menu editing, stable table links, customer ordering, and
staff fulfillment.

## Prerequisites

- Install project dependencies.
- Configure the production-readiness environment described by
  `specs/002-production-readiness/quickstart.md`.
- Configure Supabase local/staging services.
- Configure server-side AI provider settings for import-agent and AI waiter
  calls.
- Prepare at least one representative PDF menu and one representative image
  menu for import validation.

## Local Validation Commands

```bash
npm run check
npm run test:unit
npm run test:integration
npm run test:rls
npm run build
```

Run the role-complete browser validation when the implementation is available:

```bash
npm run test:e2e
```

## Manual Smoke Path

1. Sign in as an owner.
2. Complete restaurant and location setup.
3. Invite one manager and one staff user.
4. Upload a PDF menu source from the manager menu workspace.
5. Confirm the import job stores the source file, extracts OCR text, and
   starts AI import-agent processing.
6. Review the generated draft.
7. Resolve all critical warnings.
8. Leave at least one non-critical warning visible and confirm publication is
   still allowed after review.
9. Publish the menu.
10. Sign in as the manager and edit a menu item.
11. Simulate a stale edit from another owner/manager and confirm a conflict is
    detected before overwrite.
12. Open or verify one stable customer link/QR per table.
13. Start an active table session.
14. Open the table link as an unauthenticated customer.
15. Browse the current published menu, add items/options, and submit a manual
    order.
16. Build an AI-assisted order and confirm the exact details before submission.
17. Sign in as staff and verify both orders appear for the assigned location.
18. Update order statuses and confirm the customer table session sees the
    updates.
19. Close/reset the table session and confirm the same table link blocks new
    ordering until a new active session is opened.
20. Repeat representative owner, manager, staff, and customer paths in English
    and Spanish product UI.

## Acceptance Checklist

- Owner and manager can import menu files into reviewable drafts.
- OCR text and AI import-agent structured output are persisted for review.
- Critical warnings block publication.
- Non-critical warnings can remain after publication.
- Owners and managers can edit, preview, and publish menus.
- Concurrent menu conflicts are detected before overwriting newer changes.
- Staff cannot edit or publish menus.
- One stable table link per table resolves to the current active session.
- Closed/reset table sessions block new orders.
- Customers can order without accounts.
- AI-created orders require exact customer confirmation.
- Staff see and update assigned-location orders.
- Cross-tenant and unauthorized access attempts fail safely.
