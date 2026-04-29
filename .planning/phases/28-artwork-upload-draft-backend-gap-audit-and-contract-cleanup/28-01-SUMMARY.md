---
phase: 28-artwork-upload-draft-backend-gap-audit-and-contract-cleanup
plan: 01
subsystem: api
tags: [nestjs, cqrs, artwork-service, api-gateway, jest]
requires:
  - phase: 27
    provides: Shared frontend API contract cleanup baseline
provides:
  - Authenticated gateway upload-draft routes
  - Owner-scoped artwork-service draft create/read/save/submit handlers
  - Focused Jest coverage for draft save and submit behavior
affects: [artwork-upload, inventory-upload, artwork-service, api-gateway]
tech-stack:
  added: []
  patterns:
    - Gateway sends authenticated UserPayload to artwork-service RPC handlers
    - Artwork-service handlers enforce owner-owned DRAFT state before mutation
key-files:
  created:
    - BE/libs/common/src/dtos/artworks/artwork/artwork-upload-draft.dto.ts
    - BE/apps/artwork-service/src/application/commands/artworks/CreateArtworkDraft.command.ts
    - BE/apps/artwork-service/src/application/commands/artworks/SaveArtworkDraft.command.ts
    - BE/apps/artwork-service/src/application/commands/artworks/SubmitArtworkDraft.command.ts
    - BE/apps/artwork-service/src/application/queries/artworks/GetArtworkUploadDraft.query.ts
    - BE/apps/artwork-service/src/application/commands/artworks/handlers/CreateArtworkDraft.command.handler.ts
    - BE/apps/artwork-service/src/application/commands/artworks/handlers/SaveArtworkDraft.command.handler.ts
    - BE/apps/artwork-service/src/application/commands/artworks/handlers/SubmitArtworkDraft.command.handler.ts
    - BE/apps/artwork-service/src/application/queries/artworks/handlers/GetArtworkUploadDraft.query.handler.ts
    - BE/apps/artwork-service/src/application/commands/artworks/handlers/SaveArtworkDraft.command.handler.spec.ts
    - BE/apps/artwork-service/src/application/commands/artworks/handlers/SubmitArtworkDraft.command.handler.spec.ts
  modified:
    - BE/apps/api-gateway/src/presentation/http/controllers/artwork/artwork.controller.ts
    - BE/apps/artwork-service/src/presentation/microservice/artworks.microservice.controller.ts
    - BE/apps/artwork-service/src/application/index.ts
    - BE/apps/artwork-service/src/app.module.ts
    - BE/libs/common/src/dtos/artworks/index.ts
    - BE/libs/common/src/index.ts
key-decisions:
  - "The route draftArtworkId is treated as the server draft artwork id."
  - "Draft save always preserves DRAFT/unpublished lifecycle state; only submit may transition status."
  - "Wrong-owner and non-DRAFT draft reads/mutations return not-found semantics to avoid leaking draft existence."
patterns-established:
  - "Draft RPC payloads use { draftArtworkId, data, user } with seller identity derived from UserPayload."
  - "Submit validation requires owner match, DRAFT status, title, sale price/quantity, and a primary image before lifecycle transition."
requirements-completed: []
duration: 14 min
completed: 2026-04-29
---

# Phase 28 Plan 01: Backend Upload-Draft Contract Summary

**Authenticated artwork upload drafts with owner-scoped CQRS handlers, submit lifecycle validation, and focused backend tests**

## Performance

- **Duration:** 14 min
- **Started:** 2026-04-29T14:58:47Z
- **Completed:** 2026-04-29T15:12:47Z
- **Tasks:** 3
- **Files modified:** 17

## Accomplishments

- Added shared upload-draft DTOs and four guarded gateway routes under `/artwork/drafts/:draftArtworkId`.
- Added artwork-service message patterns and CQRS handlers for create, read, save, and submit draft behavior.
- Added Jest coverage for save ownership/status checks and submit validation/lifecycle mapping.

## Task Commits

1. **Task 1: Shared draft DTOs and gateway routes** - `ef368e21`
2. **Task 2: Owner-scoped artwork-service handlers** - `d30c4dd2`
3. **Task 3: Draft lifecycle unit tests** - `a689d4cc`

## Verification

- `cd BE && npx jest apps/artwork-service/src/application/commands/artworks/handlers/SaveArtworkDraft.command.handler.spec.ts apps/artwork-service/src/application/commands/artworks/handlers/SubmitArtworkDraft.command.handler.spec.ts --runInBand` - passed, 10 tests.
- `cd BE && yarn build:gateway` - passed.
- `cd BE && yarn build:artwork` - passed.
- `rg -n "create_artwork_upload_draft|get_artwork_upload_draft|save_artwork_upload_draft|submit_artwork_upload_draft" ...` - passed.

## Deviations from Plan

### Auto-Fixed Issues

**1. [Rule 3 - Blocking] Narrowed new handler imports for Jest compatibility**
- **Found during:** Task 3 verification
- **Issue:** Importing the artwork-service domain barrel loaded `GcsStorageService`, which pulled ESM `uuid` into Jest and blocked targeted handler specs.
- **Fix:** New draft handlers import only the direct repository interface and entity files they need.
- **Files modified:** New draft handler files.
- **Verification:** Targeted Jest command passed.
- **Committed in:** `a689d4cc`

---

**Total deviations:** 1 auto-fixed blocking verification issue.
**Impact on plan:** No scope change; the import narrowing keeps tests focused and avoids loading unrelated storage dependencies.

## Issues Encountered

Repository-wide `npx tsc --noEmit --pretty false --project tsconfig.json` still reports pre-existing CRM e2e test type errors outside Phase 28 scope. The plan-specific gateway/artwork builds pass.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Wave 2 can build on the authenticated draft RPC contract and harden upload/media behavior against the server-owned draft id and authenticated seller identity.

## Self-Check: PASSED

---
*Phase: 28-artwork-upload-draft-backend-gap-audit-and-contract-cleanup*
*Completed: 2026-04-29*
