# Contract: Menu Management

## Scope

Owners and authorized managers can create, edit, preview, review import
warnings, resolve critical issues, and publish menus for their allowed
restaurant/location scope. Staff, customers, unauthenticated visitors, and
cross-tenant users cannot edit or publish menus.

## `loadMenuWorkspace`

**Caller**: manager menu workspace

**Input**:

- `restaurant_id`
- `location_id`
- `active_account_id`

**Output**:

- `drafts[]`
- `current_published_menu`
- `open_import_jobs[]`
- `permissions`
- `locale`

**Rules**:

- Owners can load all restaurant locations.
- Managers can load assigned locations only.
- Staff and unauthorized users receive no menu editing data.

## `saveMenuDraft`

**Caller**: owner or authorized manager editing menu content

**Input**:

- `menu_draft_id`
- `last_seen_version`
- `changes`
- `change_summary`

**Output**:

- `menu_draft_id`
- `new_version`
- `status`
- `conflict` when newer saved changes exist

**Rules**:

- If `last_seen_version` is older than the current draft version, reject the
  save as a conflict and return enough information for review.
- Do not silently overwrite newer saved changes.
- Save changes only within the user's restaurant/location scope.

## `resolveImportWarning`

**Caller**: owner or authorized manager from import review UI

**Input**:

- `import_warning_id`
- `resolution_action` (`resolved`, `accepted`)
- `updated_field_value` when applicable

**Output**:

- `import_warning_id`
- `status`
- `affected_draft_version`

**Rules**:

- Critical warnings require a field correction or explicit safe resolution.
- Non-critical warnings may be accepted and remain visible after publication.
- Every resolution records the resolving account and timestamp.

## `publishMenu`

**Caller**: owner or authorized manager

**Input**:

- `menu_draft_id`
- `last_seen_version`
- `location_id`

**Output**:

- `published_menu_snapshot_id`
- `published_at`
- `blocked_reasons[]`

**Rules**:

- Block publication when open critical warnings exist.
- Block publication when required orderable item fields are missing.
- Block publication when a newer draft version exists and has not been
  reviewed by the publisher.
- Mark the resulting published snapshot as current for the location.
- Existing active table links show the new current published menu when opened
  or refreshed.

## Required Tests

- Owner can create, edit, preview, and publish a menu.
- Assigned manager can manage menu for assigned location only.
- Staff cannot load editing data or publish.
- Cross-tenant user cannot load or mutate menu data.
- Stale draft save returns conflict before overwriting.
- Stale publish request is blocked before publishing.
- Open critical import warning blocks publication.
- Only non-critical warnings allow publication after review.
- Customer table link sees current published menu, not drafts.
