# Contract: Menu Import Agent

## Scope

Owners and authorized managers can upload a PDF/image menu source. The product
stores the uploaded resource, extracts OCR text, and calls a server-side AI
import agent with the resource reference plus OCR text to produce a structured
reviewable `MenuDraft`.

Browser code never receives provider secrets and never calls the AI provider
directly.

## Import Flow

```text
upload source file
  -> create MenuImportJob(status=uploaded)
  -> store source resource in tenant-scoped storage
  -> extract OCR text
  -> update MenuImportJob(status=ocr_processing/ai_processing)
  -> call AI import agent with resource reference and OCR text
  -> normalize structured draft output
  -> create MenuDraft, MenuCategory, MenuItem, option records, ImportWarning
  -> update MenuImportJob(status=review_ready or failed)
```

## `createMenuImportJob`

**Caller**: owner or authorized manager from manager menu import UI

**Input**:

- `restaurant_id`
- `location_id`
- `source_file`
- `source_file_name`
- `source_file_type` (`pdf`, `png`, `jpg`, `jpeg`, `webp`)
- `source_file_size`
- `locale` (`en` or `es`)

**Output**:

- `menu_import_job_id`
- `status`
- `review_url` when immediately available
- `user_message`

**Rules**:

- Reject unsupported, empty, oversized, or unreadable files with user-facing
  guidance.
- Store source file under tenant-scoped storage.
- Only owners and authorized managers can create jobs.
- Creation succeeds before long-running OCR/AI processing completes.

## `processMenuImportJob`

**Caller**: server action, background worker, or Edge Function

**Input**:

- `menu_import_job_id`
- `restaurant_id`
- `location_id`

**OCR Output**:

- `ocr_text`
- `ocr_confidence_summary`
- `page_count`
- `detected_rotation`
- `warnings`

**AI Import-Agent Input**:

- `restaurant_id`
- `location_id`
- `source_resource_reference`
- `ocr_text`
- `ocr_confidence_summary`
- `target_currency`
- `locale`
- `expected_schema_version`
- `prompt_version`

**AI Import-Agent Output**:

- `categories[]`
- `items[]`
- `option_groups[]`
- `option_values[]`
- `warnings[]`
- `summary`
- `provider_metadata`

**Rules**:

- AI output must be validated against the expected schema before draft records
  are created.
- Provider failures, OCR failures, and schema failures must leave the job in
  `failed` with a non-technical user-facing message.
- Raw provider secrets and tokens must never be stored.
- Raw provider output may be summarized or redacted before persistence.

## Warning Classification

**Critical warnings block publication**:

- Missing item name for an orderable item
- Missing or ambiguous price for an orderable item
- Invalid or missing currency
- Required option group without valid choices
- Ambiguous item/category mapping that changes what can be ordered
- Uncertain allergen or safety claim extracted from the source

**Non-critical warnings may remain after publication**:

- Optional description uncertainty
- Category grouping uncertainty that does not change item orderability
- Formatting or display-order cleanup
- Low-confidence promotional text ignored from the orderable menu

## Required Tests

- Supported PDF upload creates a menu import job and stored source resource.
- Supported image upload creates a menu import job and stored source resource.
- OCR text is persisted and passed to the AI import agent.
- Source resource reference is passed to the AI import agent.
- Invalid AI schema output fails safely without creating a publishable draft.
- Critical warnings block publication.
- Non-critical warnings do not block publication after owner/manager review.
- Cross-tenant users cannot read import jobs, source files, OCR text, or drafts.
- Provider timeout/failure shows manual menu entry fallback.
