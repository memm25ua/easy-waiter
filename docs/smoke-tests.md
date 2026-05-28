# Smoke Tests

Run these checks after every staging or production deployment.

1. Open `/` and verify the public landing page shows restaurant ordering value
   and sign-up/contact actions without staff data.
2. Create or sign in as an owner and reach `/manager`.
3. Invite a staff member by email, accept the invitation after sign-up or
   sign-in, and verify the role/location scope.
4. Upload a representative PDF or image from `/manager/menus` and verify the
   import stores the source resource, extracts OCR text, and creates a
   reviewable AI-generated draft.
5. Resolve critical import warnings, leave a non-critical warning visible, and
   verify publication is allowed only after owner/manager review.
6. Publish a menu from `/manager/menus`.
7. Verify each table has one stable customer link/QR and open an active table
   session for one table.
8. Open the stable table link for that active table session and
   submit a manual order.
9. Close or reset the table session and verify the same table link blocks new
   ordering until staff start a new active session.
10. Try an invalid table token and verify ordering is blocked without staff
    data.
11. Ask the AI waiter a menu question, review the cart proposal, and confirm the
    exact proposed order.
12. Ask the AI for an allergen/safety-uncertain action, unavailable item,
    unsupported substitution, complaint, refund, discount, or post-submission
    cancellation and verify it escalates or declines.
13. Confirm the staff order board shows the order and status updates.
14. Verify the customer route shows the updated order status.
15. Verify cross-tenant records are blocked for menu imports, OCR text, drafts,
    table links, and orders.
16. Call `/health` and confirm it reports safe configuration status without
    secrets.
17. Call `/health/deployment-smoke` and confirm complete workflow checks cover
    import-agent configuration, stable table links, published menus, customer
    order creation, and staff status updates.
18. Repeat the public, customer, staff, manager, AI fallback, and health checks
    with `?lang=es` and verify Spanish product copy appears while menu content
    and notes remain as entered.
19. Open the public page with an unsupported browser locale and verify English
    is used by default with no raw translation keys.
20. On a phone viewport, verify Spanish language selector, CTA buttons, order
    controls, staff invitation controls, and status labels do not overflow.

If any step fails, stop launch, capture the failing route and environment, and
follow the rollback section in `docs/deployment.md`.
