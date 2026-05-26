# Research: Complete App Workflows

## Decision: Use OCR plus AI import-agent normalization for PDF/image menus

**Rationale**: PDF and image menu files vary widely in layout, text quality,
orientation, language, and visual hierarchy. OCR provides a text baseline that
can be audited and retried, while an AI import agent can use both the uploaded
resource reference and OCR text to infer categories, items, descriptions,
prices, options, modifiers, and warnings into a structured draft. Keeping this
server-side protects provider secrets and keeps all import data tenant-scoped.

**Alternatives considered**:

- OCR-only parser: more deterministic but brittle for real restaurant menu
  layouts and multi-column design.
- Vision-only AI without persisted OCR: loses useful audit/retry data and
  makes review harder when extraction is wrong.
- Manual entry only: reliable but misses the product requirement for practical
  PDF/image conversion.

## Decision: Persist uploaded resource, OCR text, import prompt metadata, and normalized draft output

**Rationale**: Owners/managers need to review uncertain fields, developers need
to reproduce import failures, and staff must be able to retry or improve an
import without asking the restaurant to upload again. Persisting the source
resource, OCR text, prompt version, model metadata, warnings, and draft output
also supports audit and acceptance tests around critical warnings.

**Alternatives considered**:

- Store only the normalized draft: smaller data footprint but weak audit and
  poor debugging.
- Store raw provider responses only: exposes unnecessary provider shape to the
  domain and makes future provider changes harder.
- Store files without OCR: prevents deterministic review of what text was
  extracted from the source.

## Decision: Classify import warnings as critical or non-critical

**Rationale**: The clarification process established that publication must be
blocked only for unresolved critical fields required for accurate ordering.
Critical warnings include missing item name, missing or ambiguous price for an
orderable item, unresolved required option group, invalid currency, category or
item ambiguity that changes what customers can order, and allergen/safety
claims that cannot be represented safely. Non-critical warnings include
optional descriptions, low-confidence category grouping, formatting hints, and
staff-visible cleanup suggestions that do not change order accuracy.

**Alternatives considered**:

- Block on every warning: safer but likely too slow for real restaurant menu
  setup because OCR/AI will produce harmless uncertainty.
- Allow publication with all warnings: faster but risks inaccurate customer
  ordering.
- Require manual re-entry after import: removes import value.

## Decision: Treat AI import as draft creation, not publication

**Rationale**: Imported content may be wrong even when it looks plausible.
Owners/managers remain accountable for what customers see, so AI output must
land in a draft with review state, field-level warnings, and explicit publish
action. This matches the product's AI waiter rule: AI may assist, but
deterministic user-confirmed operations own the final state.

**Alternatives considered**:

- Auto-publish high-confidence imports: risky for customer prices and
  availability.
- Save imported content only as plain text: safer but does not produce a usable
  menu.

## Decision: Use optimistic conflict detection for menu edits

**Rationale**: Restaurants are small teams, and full locking creates stale-lock
recovery problems. Optimistic version checks detect when another owner or
manager saved newer content and require review before overwrite. This prevents
silent data loss while allowing parallel work most of the time.

**Alternatives considered**:

- Last saved change wins: simplest but violates the clarification around
  conflict review.
- Exclusive edit locks: prevents conflicts but creates operational friction
  when a browser tab is left open.
- Section-only parallel editing: useful later but more complex than needed for
  the first role-complete workflow.

## Decision: One stable table link resolves to the current active table session

**Rationale**: Restaurants prefer a QR/link that can stay physically attached
to a table. The stable table entry token should not itself represent a party;
instead, it resolves to the current active `TableSession` when staff open the
table and blocks ordering when staff close or reset that session. This keeps
customer UX simple while preventing old sessions from ordering after turnover.

**Alternatives considered**:

- New token per party: strong isolation but operationally awkward for printed
  QR codes.
- Fixed lifetime only: can close active parties too early or leave empty
  tables open too long.
- Single-order links: conflicts with normal dine-in behavior where a table may
  submit multiple orders.

## Decision: Validate submitted orders against the current published menu

**Rationale**: Customers may keep a page open while managers update menus.
Order submission must validate item availability, required options, prices,
and table session activity at submit time. AI-created orders use the same
deterministic order path after exact confirmation, avoiding separate AI order
rules.

**Alternatives considered**:

- Trust the customer cart payload: faster but unsafe for stale prices,
  unavailable items, or tampered data.
- Snapshot entire menu when the table session opens: stable for the customer
  but hides urgent availability changes from service.

## Decision: Extend the existing production-readiness architecture

**Rationale**: The current project already has SvelteKit routes, server
helpers, Supabase integration points, OpenRouter helpers, manager/customer
component areas, and production-readiness artifacts. Extending those boundaries
keeps implementation incremental and aligns with the constitution's code
quality principle.

**Alternatives considered**:

- Add a separate import microservice: unnecessary operational complexity for
  the first production release.
- Implement import entirely in the browser: cannot safely protect AI/provider
  secrets or tenant-scoped resources.
