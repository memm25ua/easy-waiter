# Feature Specification: Complete App Workflows

**Feature Branch**: `003-complete-app-workflows`

**Created**: 2026-05-26

**Status**: Draft

**Input**: User description: "i want that production readinness involves that all features work, lets tackle how to handle the pdf/image to menu conversion and that the menu is editable by managers and owner , also the way customers access a link where can view menus and put and order. The goal of spec is fully app working for all roles"

## Clarifications

### Session 2026-05-26

- Q: What level of menu import warnings must be resolved before an owner or manager can publish an imported menu? → A: Critical fields must be resolved; non-critical warnings may remain.
- Q: Should customer links be one per table, and when should they stop accepting orders? → A: One table link stays active until staff close/reset the table session.
- Q: How should the system handle concurrent owner or manager edits to the same menu content? → A: Detect conflicting edits and require review before overwriting.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Import Menu From PDF Or Image (Priority: P1)

An owner or manager uploads a restaurant menu PDF or image, reviews the extracted menu structure, corrects any mistakes, and saves it as a draft menu that can be edited before publication.

**Why this priority**: Restaurants need a practical path from their existing menu materials into the product before customers can browse or order from accurate menu data.

**Independent Test**: Upload representative PDF and image menu files, review extracted categories and items, correct errors, save the draft, and verify the draft can be opened later with all reviewed content intact.

**Acceptance Scenarios**:

1. **Given** an owner or manager has permission to manage a restaurant menu, **When** they upload a supported PDF or image menu, **Then** the system creates a reviewable draft with detected categories, item names, descriptions, prices, options, and availability where identifiable.
2. **Given** the extraction cannot confidently read part of the menu, **When** the draft is shown for review, **Then** the uncertain fields are clearly flagged and require manager or owner review before publication.
3. **Given** an uploaded file is unsupported, too low quality, empty, duplicated, or too large for normal processing, **When** the user attempts to import it, **Then** the system explains the issue and preserves the user's ability to manually create or edit a menu.
4. **Given** an owner or manager edits the imported draft, **When** they save progress and return later, **Then** the reviewed fields, unresolved warnings, and source import history remain available.
5. **Given** an imported draft has unresolved warnings, **When** an owner or manager attempts to publish it, **Then** publication is blocked only for unresolved critical fields required for accurate ordering and non-critical warnings may remain visible after publication.

---

### User Story 2 - Owner And Manager Edit Published Menus (Priority: P1)

Owners and managers maintain accurate menus by creating, editing, organizing, previewing, and publishing menu content for the restaurant locations they are allowed to manage.

**Why this priority**: Customer ordering depends on accurate, staff-approved menu content, and production readiness requires owners and managers to control what customers see.

**Independent Test**: Sign in as owner and manager users, update menu sections and items, publish changes, verify customer-facing links show the new menu, and verify users outside the role or location scope cannot edit it.

**Acceptance Scenarios**:

1. **Given** an owner manages the restaurant, **When** they create or edit categories, items, prices, descriptions, options, modifiers, availability, and publication status, **Then** the changes are saved and can be previewed before customers see them.
2. **Given** a manager is assigned to a location, **When** they manage that location's menu, **Then** they can edit menu content for their assigned scope and cannot edit menus outside that scope.
3. **Given** a staff user has order-handling access only, **When** they attempt to open menu editing actions, **Then** the actions are unavailable and no menu changes are accepted.
4. **Given** a published menu is changed, **When** customers open or refresh an active table ordering link, **Then** they see the current published content and not unpublished drafts.
5. **Given** two owners or managers edit the same menu content close together, **When** one tries to save over newer changes, **Then** the system detects the conflict and requires review before any changes are overwritten.

---

### User Story 3 - Customer Opens Table Link And Orders (Priority: P1)

A dine-in customer opens a table-specific link, views the current menu, builds an order manually or with AI assistance, confirms the order, and sees the order status for their table session.

**Why this priority**: The customer link is the core customer entry point and must work without requiring an account.

**Independent Test**: Create an active table session, open its customer link on a phone-sized viewport, browse the menu, add items, submit an order, and verify staff receive the order with the correct table and item details.

**Acceptance Scenarios**:

1. **Given** staff have opened an active table session for a table, **When** a customer opens that table's link or QR code, **Then** the customer can view the published menu for that restaurant location without signing in.
2. **Given** the customer chooses menu items, options, quantities, and notes, **When** they review and submit the order, **Then** the order is created for the correct restaurant, location, table, and active table session.
3. **Given** a customer uses AI assistance to build an order, **When** the AI proposes items, **Then** the customer must confirm the exact items, quantities, options, notes, table, and total before submission.
4. **Given** the table has no active session, staff have closed or reset the session, the link is invalid, or the restaurant has no published menu, **When** the customer opens the table link, **Then** ordering is blocked with clear guidance that does not expose private restaurant data.

---

### User Story 4 - Staff Receive And Manage Orders (Priority: P1)

Staff view incoming orders for their assigned location, understand each order's source and table, update fulfillment status, and keep customers informed.

**Why this priority**: Restaurant operations are only complete when submitted customer orders can be handled by the right staff in real time.

**Independent Test**: Submit orders from customer links for two tables, sign in as staff for the assigned location, update statuses, and verify customers see their own order status changes.

**Acceptance Scenarios**:

1. **Given** a customer submits an order from an active table link, **When** assigned staff open the order dashboard, **Then** they see the order with table, items, options, notes, source, time, and current status.
2. **Given** staff update an order status, **When** the customer views their table session, **Then** the customer sees the updated status for their own order.
3. **Given** staff are assigned to one location, **When** they view orders, **Then** they only see and update orders for that assigned location.
4. **Given** an order requires staff review because of AI escalation, item uncertainty, or customer notes, **When** staff open the order, **Then** the review reason is visible before fulfillment action.

---

### User Story 5 - Role-Complete Production Experience (Priority: P2)

Owners, managers, staff, and customers can each complete their expected production workflows without relying on demo data, developer intervention, or hidden manual steps.

**Why this priority**: The product is not production-ready unless every role has a complete path through their main responsibilities.

**Independent Test**: Run an end-to-end restaurant setup with one owner, one manager, one staff user, a published menu imported from a source file, active customer links, submitted orders, staff fulfillment updates, and role-based access checks.

**Acceptance Scenarios**:

1. **Given** a new owner signs up, **When** they complete onboarding, **Then** they can create restaurant and location records, invite managers or staff, import or create a menu, publish it, and open table links.
2. **Given** a manager accepts an invitation, **When** they manage assigned locations, **Then** they can maintain menus, monitor orders, review AI or import issues, and view operational summaries for their scope.
3. **Given** a staff user accepts an invitation, **When** they handle active service, **Then** they can view assigned orders, update statuses, and see relevant customer notes without gaining owner or manager permissions.
4. **Given** a customer completes an order from a table link, **When** they return to the same active session, **Then** they can view their submitted order status without accessing staff or manager areas.

### Edge Cases

- A menu PDF contains multiple pages, multiple languages, poor contrast, rotated pages, handwritten notes, or prices that are visually separated from item names.
- A menu image is blurry, cropped, duplicated, or contains promotional items that should not become orderable items.
- The importer extracts a price, allergen, modifier, or item name incorrectly.
- Two owners or managers edit the same draft or published menu content close together.
- A manager attempts to publish a menu with unresolved critical import warnings or missing required item details.
- A restaurant has no published menu when a table link is opened.
- A customer opens a table link after staff close or reset the table session or after a new party is seated.
- Multiple customer devices submit orders for the same active table session.
- A customer loses connection while reviewing or submitting an order.
- Staff update an order while a customer is viewing status from another device.
- An owner, manager, or staff user has no active assignment after sign-in.
- A user attempts to access another restaurant's menu import, menu editor, table links, or orders by changing the URL.
- Product interface text appears in English or Spanish, while restaurant-provided menu content remains exactly as entered by staff.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow owners and authorized managers to upload supported PDF and image files as menu import sources.
- **FR-002**: The system MUST convert uploaded menu sources into a reviewable draft containing detected categories, items, descriptions, prices, options, modifiers, availability, and source-confidence warnings where applicable.
- **FR-003**: The system MUST require owner or manager review before any imported menu content becomes visible to customers.
- **FR-003a**: The system MUST block publication of imported menus with unresolved critical fields required for accurate ordering, while allowing publication with non-critical warnings that remain visible to owners and managers.
- **FR-004**: The system MUST allow owners and authorized managers to manually create, edit, duplicate, reorder, archive, preview, and publish menu categories and menu items.
- **FR-005**: The system MUST allow owners and authorized managers to edit item names, descriptions, prices, option groups, modifiers, availability, dietary or allergen notes, and customer-facing ordering notes.
- **FR-006**: The system MUST maintain a distinction between unpublished drafts, reviewed imported content, and the currently published customer-facing menu.
- **FR-007**: The system MUST prevent staff-only users, customers, unauthenticated visitors, and users from other restaurants from editing or publishing menus.
- **FR-007a**: The system MUST detect conflicting owner or manager edits to the same menu content and require review before overwriting newer saved changes.
- **FR-008**: The system MUST allow owners and authorized managers to create one stable customer link or QR entry point per restaurant table.
- **FR-009**: Customer table links MUST open only the table's current active session, and ordering MUST be blocked when staff close or reset that table session.
- **FR-010**: Customers MUST be able to open an active table link without an account and view only the published menu for that table's restaurant location.
- **FR-011**: Customers MUST be able to select items, options, modifiers, quantities, and notes; review the order; and submit it for the active table session.
- **FR-012**: AI-assisted ordering MUST require explicit customer confirmation of the exact order details before submission.
- **FR-013**: Submitted orders MUST include restaurant, location, table session, source, items, quantities, selected options, notes, status, and submission time.
- **FR-014**: Staff assigned to the location MUST be able to view incoming orders, filter or group them by useful service states, and update order status.
- **FR-015**: Customers MUST be able to view status updates for orders submitted in their active table session without seeing orders from other sessions or private staff data.
- **FR-016**: Owners MUST be able to manage restaurant-level setup, locations, users, menus, table links, and operational visibility.
- **FR-017**: Managers MUST be able to manage menus, table links, orders, import reviews, and operational visibility only for assigned restaurant or location scope.
- **FR-018**: Staff MUST be able to handle assigned-location orders and related customer notes without menu-publishing, staff-management, or restaurant-configuration privileges.
- **FR-019**: The system MUST preserve durable menu, table session, order, import review, and role-assignment state across browser reloads and deployments.
- **FR-020**: The system MUST provide clear, non-technical guidance for import failures, invalid table links, unavailable menus, unavailable AI assistance, order submission failures, and unauthorized access.
- **FR-021**: The system MUST support the established English and Spanish product interface expectations while keeping restaurant-provided menu content, staff notes, and customer notes as entered.
- **FR-022**: The system MUST preserve established visual and interaction conventions for public, account, manager, staff, and customer ordering flows.
- **FR-023**: Normal customer menu browsing, cart updates, order submission feedback, and staff status updates MUST provide visible feedback within production service expectations for small and medium restaurants.
- **FR-024**: The system MUST provide testable role-based access outcomes for owner, manager, staff, customer, unauthenticated visitor, and cross-restaurant access attempts.

### Key Entities *(include if feature involves data)*

- **Menu Import Source**: An uploaded PDF or image used to create a reviewable menu draft, including file identity, upload owner, restaurant scope, processing state, extraction warnings, and review status.
- **Menu Draft**: Editable menu content that is not yet visible to customers, including imported or manually created categories, items, prices, options, modifiers, availability, and review warnings.
- **Published Menu**: The customer-facing version of a reviewed menu for a restaurant location, used by table links and AI assistance.
- **Menu Category**: A group of menu items with display order, name, description, visibility, and publication state.
- **Menu Item**: An orderable or informational item with name, description, price, options, modifiers, dietary or allergen notes, availability, and publication state.
- **Restaurant Role Assignment**: A user's owner, manager, or staff relationship to a restaurant or location, defining what setup, menu, table link, order, and operational actions they may perform.
- **Table Session**: A time-bound dine-in ordering context tied to a restaurant location and table, with an unguessable customer link, active or closed state, and submitted orders.
- **Customer Order**: A submitted request from a table session, including selected menu items, options, quantities, notes, source, status, and service history.
- **AI Order Proposal**: A proposed order created through AI assistance that must be confirmed by the customer before becoming a submitted order.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Owners or managers can import a representative PDF or image menu, review extracted content, correct flagged issues, and save a draft in under 10 minutes during validation.
- **SC-002**: 100% of imported menu drafts require owner or manager review before publication in acceptance tests.
- **SC-002a**: 100% of publication attempts with unresolved critical import fields are blocked, while publication with only non-critical warnings succeeds after owner or manager review.
- **SC-003**: Owners and managers can manually create, edit, preview, and publish a menu that becomes visible from an active customer table link without developer intervention.
- **SC-003a**: 100% of tested concurrent menu edit conflicts are detected before newer saved changes are overwritten.
- **SC-004**: 100% of role-based access tests block staff, customers, unauthenticated visitors, and cross-restaurant users from menu editing and publication actions they are not allowed to perform.
- **SC-005**: A customer can open an active table link, browse the published menu, submit an order, and see confirmation in under 3 minutes during end-to-end validation.
- **SC-006**: 95% of normal customer menu browsing, cart update, and order submission interactions show visible feedback within 2 seconds using representative restaurant data.
- **SC-007**: Staff assigned to the location see newly submitted customer orders within 5 seconds during validation.
- **SC-008**: 100% of submitted orders in tests are associated with the correct restaurant, location, table session, item details, source, and status history.
- **SC-009**: 100% of AI-created orders in tests require explicit matching customer confirmation before submission.
- **SC-010**: A full role-complete smoke test covers owner onboarding, manager invitation, staff invitation, menu import, menu editing, publication, table link access, customer order submission, and staff fulfillment updates without demo-only data.
- **SC-011**: Public and customer-facing errors for invalid links, unavailable menus, import limitations, order submission failure, and unavailable AI assistance use clear user language with no implementation details.
- **SC-012**: English and Spanish acceptance journeys cover owner, manager, staff, and customer workflows, excluding restaurant-provided content from translation expectations.

## Assumptions

- This feature refines the broader production-readiness goal by defining the complete operational workflows needed for all primary roles.
- Owners have full restaurant-level control; managers have scoped menu, table link, order, import review, and operational permissions; staff handle assigned-location orders only.
- Customer ordering uses unauthenticated table-specific links or QR codes with unguessable active-session tokens.
- Imported menu content is assistive and must be reviewed by a human owner or manager before publication.
- Restaurant-provided menu names, descriptions, notes, and customer notes remain as entered and are not automatically translated.
- Delivery, pickup, payments, loyalty, and kitchen hardware integrations remain outside this feature unless added by a later specification.
- Existing production-readiness requirements for authentication, persistent storage, tenant isolation, AI confirmation, English/Spanish product UI, and deployment validation remain applicable.
