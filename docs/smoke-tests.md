# Smoke Tests

Run these checks after every staging or production deployment.

1. Open `/` and verify the public landing page shows restaurant ordering value
   and sign-up/contact actions without staff data.
2. Create or sign in as an owner and reach `/manager`.
3. Invite a staff member by email, accept the invitation after sign-up or
   sign-in, and verify the role/location scope.
4. Publish a menu from `/manager/menus`.
5. Open an active table session through its unguessable QR/link token and
   submit a manual order.
6. Try an invalid or expired table token and verify ordering is blocked without
   staff data.
7. Ask the AI waiter a menu question, review the cart proposal, and confirm the
   exact proposed order.
8. Ask the AI for an allergen/safety-uncertain action, unavailable item,
   unsupported substitution, complaint, refund, discount, or post-submission
   cancellation and verify it escalates or declines.
9. Confirm the staff order board shows the order and status updates.
10. Verify the customer route shows the updated order status.
11. Verify cross-tenant records are blocked.
12. Call `/health` and confirm it reports safe configuration status without
    secrets.
13. Repeat the public, customer, staff, manager, AI fallback, and health checks
    with `?lang=es` and verify Spanish product copy appears while menu content
    and notes remain as entered.
14. Open the public page with an unsupported browser locale and verify English
    is used by default with no raw translation keys.
15. On a phone viewport, verify Spanish language selector, CTA buttons, order
    controls, staff invitation controls, and status labels do not overflow.

If any step fails, stop launch, capture the failing route and environment, and
follow the rollback section in `docs/deployment.md`.
