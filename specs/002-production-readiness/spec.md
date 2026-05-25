# Feature Specification: Production Readiness

**Feature Branch**: `002-production-readiness`

**Created**: 2026-05-24

**Status**: Draft

**Input**: User description: "change currently mvp demo to fully working product with auth, supabase conection, integrate with openrouter for ai, landing page for marketing, and a plan for deployment"

## Clarifications

### Session 2026-05-25

- Q: What permission model should the first production release enforce for restaurant staff roles? → A: Owner manages restaurant, locations, staff, menus, analytics; manager manages assigned locations, menus, orders, analytics; staff handles assigned location orders only.
- Q: How should customers access table ordering in the first production release? → A: Customers use an unauthenticated QR/link with an unguessable session token scoped to one active table session that expires or closes when staff end the session.
- Q: Which staff-judgment actions must the AI escalate instead of completing automatically? → A: Allergens/safety uncertainty, unavailable items, substitutions outside menu options, complaints, refunds, discounts, and cancellation requests after submission.
- Q: What deployment target scope should this production-readiness feature guarantee? → A: One documented Coolify production deployment path plus local/staging validation and rollback guidance.
- Q: How should staff join an existing restaurant in the first production release? → A: Owners and managers invite staff by email, assign role/location scope, and the staff member accepts after sign-up or sign-in.
- Q: Which languages must the production-ready product support in the first release? → A: English and Spanish, with language selection available for public, customer, account, onboarding, staff, manager, and operational states.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Restaurant Accounts And Data (Priority: P1)

A restaurant owner signs up, creates or joins their restaurant account, signs in securely, and sees only the restaurant, location, menu, order, staff, and analytics data they are allowed to access.

**Why this priority**: The demo cannot become a real product until restaurant data is persisted, authenticated, and isolated between customers.

**Independent Test**: Create two restaurant accounts with separate staff users and verify each user can complete staff workflows for their own restaurant while being unable to view or modify the other restaurant's data.

**Acceptance Scenarios**:

1. **Given** a new restaurant owner has no account, **When** they create an account and verify access, **Then** they can create a restaurant profile, first location, and first staff assignment.
2. **Given** a staff member has been invited by email with a role and location scope, **When** they accept after sign-up or sign-in and open the manager area, **Then** they only see locations, menus, orders, and analytics for their active assignment.
3. **Given** an unauthenticated visitor attempts to open staff-only pages, **When** the page loads, **Then** they are directed to sign in and no staff data is displayed.
4. **Given** one restaurant has active orders and menu data, **When** a user from a different restaurant signs in, **Then** none of that data is visible or actionable.

---

### User Story 2 - Replace Demo Data With Persistent Operations (Priority: P1)

Restaurant staff manage real menus, table sessions, orders, AI conversations, and operational summaries that persist across browser sessions and deployments.

**Why this priority**: A working product must use durable restaurant data instead of in-memory demo records.

**Independent Test**: Set up a restaurant, publish a menu, open a table session, submit orders, update order statuses, reload the app, and verify all records and permissions remain correct.

**Acceptance Scenarios**:

1. **Given** a manager publishes a menu, **When** customers open an active table session, **Then** they see the current published menu for that restaurant location.
2. **Given** a customer submits a manual order, **When** staff reload the order dashboard, **Then** the order remains visible with the correct table, items, notes, source, status, and timestamps.
3. **Given** staff update order status, **When** the customer views their table order state, **Then** the customer sees the current status for their own submitted order.
4. **Given** a restaurant closes or expires a table session, **When** a customer uses that tokenized table entry point, **Then** ordering is blocked with clear guidance.

---

### User Story 3 - Production AI Waiter And Menu Assistance (Priority: P1)

Customers and managers use AI assistance backed by restaurant-approved data, with clear confirmation, audit, fallback, and escalation behavior.

**Why this priority**: AI is central to the product promise, but it must be safe, restaurant-specific, auditable, and reliable enough for real service.

**Independent Test**: Configure an AI provider, ask menu questions, request recommendations, build an AI cart, confirm an order, trigger fallback cases, and verify all AI actions are logged and scoped to the correct restaurant and table.

**Acceptance Scenarios**:

1. **Given** a customer asks about dishes, allergens, recommendations, or options, **When** the answer can be derived from the restaurant-approved menu, **Then** the AI waiter answers without inventing unsupported facts.
2. **Given** a customer asks the AI waiter to order, **When** the AI proposes a cart, **Then** the order is not submitted until the customer confirms the exact restaurant, table, items, quantities, options, and notes.
3. **Given** the AI provider is unavailable, slow, or returns an unusable response, **When** a customer or manager is using AI assistance, **Then** the product shows a useful fallback and preserves manual ordering or review.
4. **Given** a request involves allergens or safety uncertainty, unavailable items, substitutions outside menu options, complaints, refunds, discounts, or cancellation after submission, **When** the AI detects the limit, **Then** it escalates or declines the action and records the reason.

---

### User Story 4 - Marketing Landing And Conversion (Priority: P2)

Restaurant owners visiting the public site understand the product value, review proof points, and start sign-up or contact flow from a polished marketing landing page.

**Why this priority**: A fully working product needs a credible public entry point, but it depends on the core product being secure and usable first.

**Independent Test**: A prospective restaurant owner can visit the public page, understand the product in under one minute, view core benefits and supported workflows, and start account creation or request contact.

**Acceptance Scenarios**:

1. **Given** a visitor lands on the public home page, **When** they scan the first viewport, **Then** they understand this is dine-in AI menu ordering for restaurants and can start the primary conversion action.
2. **Given** a visitor wants evidence of value, **When** they continue down the page, **Then** they see concise explanations of menu import, table ordering, AI waiter support, staff order monitoring, and workload reduction metrics.
3. **Given** a visitor is not ready to sign up, **When** they choose a contact option, **Then** the product captures enough information for follow-up without exposing staff-only product pages.

---

### User Story 5 - Deployment Readiness And Operations (Priority: P2)

The product team can deploy, configure, monitor, and recover the application using documented production readiness checks.

**Why this priority**: The product is not fully usable by real restaurants until deployment, configuration, rollback, and operational expectations are defined and validated.

**Independent Test**: Follow the Coolify deployment readiness guide from a clean environment and verify production configuration, database setup, AI provider configuration, health checks, smoke tests, and rollback instructions are complete.

**Acceptance Scenarios**:

1. **Given** a Coolify production environment is being prepared, **When** the deployment checklist is followed, **Then** required secrets, public configuration, database migrations, storage, auth settings, and AI provider access are verified before launch.
2. **Given** a deployment completes, **When** smoke tests run, **Then** sign-up, sign-in, menu publication, table ordering, AI assistance, staff order updates, and public landing conversion are validated.
3. **Given** a deployment fails or introduces a severe issue, **When** the operator follows recovery guidance, **Then** they can identify the failed step and roll back or disable affected capabilities.

---

### User Story 6 - English And Spanish Product Experience (Priority: P2)

Restaurant owners, staff, and customers can use the product in English or Spanish across public, account, ordering, AI, staff, manager, and operational flows.

**Why this priority**: The product targets restaurants where staff and guests may reasonably expect either English or Spanish; production readiness requires a complete and understandable experience in both supported languages.

**Independent Test**: Switch between English and Spanish on public, customer, and staff/manager journeys and verify all visible navigation, forms, actions, validation messages, empty states, AI fallback guidance, and operational status messages are understandable in the selected language.

**Acceptance Scenarios**:

1. **Given** a public visitor prefers Spanish, **When** they open the landing page and start sign-up or contact, **Then** the marketing copy, form labels, actions, validation messages, and success states appear in Spanish.
2. **Given** a customer opens a table ordering link, **When** they choose English or Spanish, **Then** the menu browsing, order submission, AI waiter guidance, confirmation states, and order status messages use the chosen language.
3. **Given** a staff member or manager signs in, **When** they choose English or Spanish, **Then** dashboard navigation, order controls, menu review, staff invitations, analytics, no-access states, and operational errors use the chosen language.
4. **Given** a supported translation is missing or incomplete, **When** the user reaches that state, **Then** the product shows a safe, understandable fallback without exposing implementation details or mixing staff-only data into public/customer contexts.

### Edge Cases

- A user signs in with a valid account but no active restaurant staff assignment.
- A staff invitation is sent to the wrong email, expires, is accepted by an already-authenticated account, or conflicts with an existing assignment.
- A restaurant owner loses access to the email or identity method used for the owner account.
- Two restaurants use similar names, slugs, table labels, or menu item names.
- A customer opens an old table entry point after the session is closed or after a different party is seated.
- A customer or automated client attempts to guess, reuse, or alter a table-session token.
- A table has multiple active customer devices submitting overlapping orders.
- The persistent data service is temporarily unavailable during staff dashboard or customer order submission.
- The AI provider is unavailable, rate-limited, too slow, or returns content that does not match restaurant data.
- A customer asks the AI to handle an allergen or safety uncertainty, unavailable item, unsupported substitution, complaint, refund, discount, or cancellation after submission.
- A deployment has missing or incorrect secrets, public configuration, storage policies, or auth redirect settings.
- A marketing visitor uses the public page on a phone with slow network conditions.
- Search engines or unauthenticated visitors attempt to access private restaurant pages.
- A visitor, customer, or staff member has a browser language that is neither English nor Spanish.
- A user changes language in the middle of sign-up, table ordering, AI confirmation, staff order update, or manager menu review.
- A restaurant menu item, staff-entered note, or customer-entered note is written in only one language.
- A translated label is longer than the English version and risks overflowing compact mobile controls.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow restaurant owners and staff to sign up, sign in, sign out, and recover account access through a secure account flow.
- **FR-002**: The system MUST support restaurant owner onboarding that creates a restaurant profile, first location, and owner staff assignment.
- **FR-003**: The system MUST enforce role-based access where owners manage restaurant profiles, locations, staff, menus, and analytics; managers manage assigned locations, menus, orders, and analytics; and staff handle assigned-location orders only.
- **FR-004**: The system MUST isolate data so users can only access restaurants and locations where they have an active assignment, including assignments accepted through owner or manager email invitations with explicit role and location scope.
- **FR-005**: The system MUST replace demo-only menu, table session, order, AI conversation, and analytics records with durable records that persist across reloads and deployments.
- **FR-006**: The system MUST support menu publication, item availability, table sessions, manual orders, AI-assisted orders, order status changes, and operational summaries using durable restaurant data.
- **FR-007**: The system MUST preserve customer ordering and staff dashboard behavior when persistent records are reloaded from a new browser session.
- **FR-008**: The system MUST let customers access ordering through unauthenticated QR/link table-session tokens that are unguessable, scoped to one active table session, and blocked after the session expires or staff close it.
- **FR-009**: The system MUST connect AI waiter and menu assistance to a configurable AI provider for production use.
- **FR-010**: The AI waiter MUST answer using restaurant-approved menu and policy context and MUST not invent prices, ingredients, availability, or restaurant policies.
- **FR-011**: The AI waiter MUST require explicit customer confirmation before submitting any AI-created order.
- **FR-012**: The system MUST record AI messages, proposed actions, confirmations, submitted order IDs, fallback reasons, and escalations for audit.
- **FR-013**: The system MUST provide fallback behavior when AI assistance is unavailable and MUST escalate allergens or safety uncertainty, unavailable items, substitutions outside menu options, complaints, refunds, discounts, and cancellation requests after submission to staff review.
- **FR-014**: The public landing page MUST explain the product value for restaurants, show the primary workflows, and provide clear sign-up or contact actions.
- **FR-015**: The public landing page MUST keep unauthenticated visitors separate from staff-only product data and routes.
- **FR-016**: The system MUST include a Coolify deployment readiness guide covering environment configuration, secrets, database setup, storage setup, auth setup, AI provider setup, smoke tests, rollback, and launch validation.
- **FR-017**: The system MUST expose a practical production health or smoke-test process that validates sign-up, sign-in, menu publication, customer ordering, AI assistance, order updates, and public landing conversion.
- **FR-018**: The system MUST preserve established user experience conventions for customer ordering, staff workflows, account flows, AI fallback states, and public marketing pages.
- **FR-019**: The customer-facing product MUST avoid implementation jargon in errors, loading states, empty states, and AI fallback messages.
- **FR-020**: Staff-only data MUST never appear on public marketing pages, unauthenticated pages, search previews, or unauthorized restaurant contexts.
- **FR-021**: The product MUST maintain visible customer feedback for normal ordering and AI interactions within the agreed service expectations for small and medium restaurants.
- **FR-022**: The product MUST provide enough production configuration documentation for a new operator to deploy without relying on private knowledge from the original developer.
- **FR-023**: The system MUST support English and Spanish as selectable languages across public marketing, account, onboarding, customer ordering, AI waiter, staff orders, manager menus, analytics, staff invitations, access states, health or smoke-test states, and operational guidance.
- **FR-024**: The system MUST remember a user's selected language where appropriate and apply a reasonable default when no selection exists, while allowing the user to change between English and Spanish without losing their current workflow state.
- **FR-025**: The system MUST keep user-facing labels, actions, validation messages, empty states, error states, success states, AI fallback or escalation guidance, and status messages understandable in the selected language, with safe fallback behavior when a translation is unavailable.
- **FR-026**: The system MUST allow restaurant-provided content such as menu item names, menu descriptions, staff notes, and customer notes to remain as entered, while translating product interface text around that content.

### Key Entities *(include if feature involves data)*

- **Account**: A person who can authenticate, recover access, and hold one or more restaurant staff assignments.
- **Restaurant**: A business tenant with isolated menus, locations, staff, table sessions, orders, AI conversations, and analytics.
- **Location**: A physical venue belonging to a restaurant with its own tables, published menu, staff access, and order activity.
- **Staff Assignment**: A relationship between an account and a restaurant or location, including role, active status, invitation acceptance state, and permission scope; owner scope covers restaurant profiles, locations, staff, menus, and analytics, manager scope covers assigned locations, menus, orders, and analytics, and staff scope covers assigned-location orders only.
- **Table Session**: A time-bound dine-in ordering context tied to a restaurant table, unguessable customer access token, customer ordering state, AI conversation, and orders.
- **AI Provider Configuration**: Production settings and secrets required for the product to request AI assistance without exposing sensitive credentials to users.
- **AI Audit Event**: A record of AI messages, proposed actions, confirmations, fallback states, escalations, and final outcomes.
- **Deployment Environment**: A configured Coolify production runtime target with required secrets, public settings, database state, storage policies, auth redirects, health checks, local/staging validation, and rollback expectations.
- **Marketing Lead**: A prospective restaurant owner or manager who starts sign-up or requests contact through the public landing page.
- **Language Preference**: A user's selected product language, limited to English or Spanish for the first production release, used to present interface text and user-facing system messages consistently across supported flows.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of staff-only routes require authenticated access and an active assignment in authorization tests.
- **SC-002**: In cross-tenant tests, users from one restaurant cannot view or modify another restaurant's menus, table sessions, orders, AI conversations, analytics, or staff assignments.
- **SC-003**: A new restaurant owner can create an account, create a restaurant, create a first location, and reach the manager dashboard in under 5 minutes.
- **SC-004**: A manager can publish a menu, open a table session, submit a customer order, update order status, reload the app, and see all records preserved with correct status.
- **SC-005**: 95% of normal customer ordering interactions show visible feedback or confirmation within 2 seconds during validation with representative restaurant data.
- **SC-006**: Staff see newly submitted orders within 5 seconds during validation with representative restaurant activity.
- **SC-007**: At least 90% of representative AI waiter answers are either accurate to restaurant-approved data or clearly escalated without unsupported claims.
- **SC-008**: 100% of AI-created orders in tests require an explicit matching customer confirmation before submission.
- **SC-009**: A prospective restaurant owner can identify the product's value proposition and primary conversion action within the first viewport during usability review.
- **SC-010**: Coolify deployment readiness documentation enables a clean-environment smoke test to validate account creation, sign-in, menu publication, table ordering, AI assistance, staff order updates, and public landing conversion without missing prerequisite steps.
- **SC-011**: All production-blocking configuration failures discovered during smoke testing have documented detection and recovery guidance.
- **SC-012**: Public and customer-facing flows contain no staff-only operational jargon or implementation details in visible error and empty states.
- **SC-013**: 100% of public, account, onboarding, customer ordering, AI waiter, staff order, manager menu, analytics, staff invitation, and access-state journeys included in acceptance tests can be completed in both English and Spanish.
- **SC-014**: During bilingual usability review, users can switch between English and Spanish in under 10 seconds without losing their current task state.
- **SC-015**: 95% of reviewed user-facing product text appears in the selected language, excluding restaurant-provided content such as menu names, menu descriptions, staff notes, and customer notes.

## Assumptions

- This feature upgrades the existing MVP into a production-ready product increment; it does not add delivery, pickup, payments, loyalty, or kitchen hardware integrations.
- The selected technical plan will continue using the existing application direction unless planning identifies a documented reason to change it.
- The product will use a managed authentication and persistence provider, with provider-specific details documented during planning rather than in this product specification.
- The production AI provider will be configured server-side and will not expose private keys to browsers or unauthenticated users.
- The public marketing page is part of the same product experience but must not disclose private restaurant data.
- Initial deployment readiness targets one Coolify production deployment path and one local or staging validation path.
- Billing, subscriptions, invoicing, and customer payment processing are outside this feature unless a later specification adds them.
- English and Spanish are the only required product interface languages for this production-readiness increment.
- Restaurant-provided content is not automatically translated in this feature; staff may enter menu content and notes in the language they choose.
- If no language has been selected, the product may use the visitor's browser preference when it is English or Spanish and otherwise default to English.
