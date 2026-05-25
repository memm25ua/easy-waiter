# Contract: OpenRouter AI

## Scope

Production AI assistance uses a server-only adapter for OpenRouter. Browser
code never receives provider secrets. All AI outputs are normalized into the
product's waiter/menu assistance contract before any user-visible action is
taken.

## Provider Request

### `createChatCompletion`

**Caller**:

- Customer AI waiter action
- Manager menu assistance action
- Menu import post-processing where applicable

**Input**:

- `restaurant_id`
- `location_id`
- `table_session_id` when customer-scoped
- `conversation_id`
- `messages`
- `approved_menu_context`
- `allowed_actions`
- `current_cart`
- `customer_confirmed_action`
- `locale` (`en` or `es`)
- `model`
- `timeout_ms`

**Server-only configuration**:

- OpenRouter API key
- Base URL
- Default model
- Optional site/app metadata headers
- Timeout and retry policy

**Output**:

- `reply`
- `recommended_items`
- `cart_proposal`
- `requires_confirmation`
- `escalation_reason`
- `provider_metadata`
- `submitted_order_id` only after deterministic confirmation path succeeds

## AI Action Rules

- AI may answer only from restaurant-approved menu and policy context.
- AI may propose cart changes, but proposal validation uses current menu data.
- AI-created orders require exact customer confirmation.
- AI may not submit orders directly from model text alone.
- AI may not invent prices, ingredients, availability, policies, or staff
  promises.
- AI must escalate allergens or safety uncertainty, unavailable items,
  substitutions outside menu options, complaints, refunds, discounts,
  cancellation requests after submission, or any unsupported request.
- Provider failures must return fallback copy and keep manual ordering usable.
- User-visible AI replies, fallback copy, confirmation guidance, and
  escalation/decline guidance should use the selected locale.
- Locale must not change approved menu context, tenant scope, or deterministic
  confirmation validation.

## Audit Contract

Every AI action attempt writes an audit event with:

- Conversation ID
- Table session ID when applicable
- Restaurant and location scope
- Action type
- Proposed payload
- Confirmation state
- Provider status or fallback reason
- Result or escalation reason
- Submitted order ID when created
- Locale used for user-visible copy
- Timestamp

Audit records must not include API keys, raw auth tokens, or secrets.

## Required Tests

- Provider key is never present in browser bundles or client-visible payloads.
- AI answer uses approved menu context for a known menu question.
- Unsupported menu question escalates or declines without unsupported claims.
- AI order proposal does not submit until exact confirmation is posted.
- Modified confirmation payload is rejected.
- Provider timeout or error returns manual-order fallback and audit event.
- Allergens or safety uncertainty, unavailable items, unsupported
  substitutions, complaints, refunds, discounts, and post-submission
  cancellation requests escalate without automatic completion.
- Cross-tenant request cannot use another restaurant's menu context.
- English and Spanish AI waiter fallback, escalation, and confirmation flows
  are covered in customer tests.
