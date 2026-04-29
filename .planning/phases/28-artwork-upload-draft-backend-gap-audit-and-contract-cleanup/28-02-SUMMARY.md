---
phase: 28-artwork-upload-draft-backend-gap-audit-and-contract-cleanup
plan: 02
subsystem: api
tags: [nestjs, react, upload, artwork-drafts, jest, typescript]
requires:
  - phase: 28-01
    provides: Authenticated owner-scoped artwork upload-draft backend contract
provides:
  - Draft-owned artwork image upload authorization before GCS writes
  - Frontend upload API calls that no longer submit client sellerId in multipart payloads
  - Upload flow submission through saveUploadDraft and submitUploadDraft
affects: [artwork-upload, inventory-upload, artwork-service, api-gateway]
tech-stack:
  added: []
  patterns:
    - Multipart artwork uploads derive seller identity from JwtAuthGuard user context
    - Frontend upload submission treats backend draft id as the only artwork upload target
key-files:
  created:
    - BE/apps/artwork-service/src/presentation/microservice/upload.microservice.controller.spec.ts
  modified:
    - BE/apps/api-gateway/src/presentation/http/controllers/artwork/upload.controller.ts
    - BE/apps/artwork-service/src/presentation/microservice/upload.microservice.controller.ts
    - FE/artium-web/src/@shared/apis/artworkUploadApi.ts
    - FE/artium-web/src/@shared/types/artwork.ts
    - FE/artium-web/src/@domains/inventory-upload/services/artworkUploadService.ts
    - FE/artium-web/src/@domains/inventory-upload/hooks/useArtworkSubmit.ts
    - FE/artium-web/src/@domains/inventory-upload/views/UploadPage.tsx
key-decisions:
  - "Client multipart payloads may provide artworkId only; sellerId is injected at the gateway from req.user.id."
  - "Artwork-service validates draft existence, owner, and DRAFT status before writing images to GCS."
  - "Frontend submission saves the backend draft, attaches uploaded images, then submits that same draft."
patterns-established:
  - "Upload service authorization happens before storage path construction."
  - "Inventory upload submission passes draftArtworkId through the whole media/save/submit pipeline."
requirements-completed: []
duration: 20 min
completed: 2026-04-29
---

# Phase 28 Plan 02: Draft-Aware Upload Wiring Summary

**Owner-verified draft media uploads with frontend submission routed through the backend upload-draft contract**

## Performance

- **Duration:** 20 min
- **Started:** 2026-04-29T15:13:30Z
- **Completed:** 2026-04-29T15:33:34Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- Hardened gateway and artwork-service upload handlers so image uploads use authenticated seller identity and validate draft ownership/status before GCS writes.
- Added focused Jest coverage for missing file, missing draft, wrong seller, non-DRAFT artwork, and successful upload metadata.
- Removed client `sellerId` from artwork image `FormData` and kept upload transport on `apiUpload`.
- Routed inventory upload submission through `saveUploadDraft`, image attachment, and `submitUploadDraft` using the backend draft id.

## Task Commits

1. **Task 1: Harden upload endpoints to derive seller identity and validate draft ownership** - `08148fed`
2. **Task 2: Add frontend draft API methods using shared helpers** - `5c365b09`
3. **Task 3: Hydrate the upload route from backend draft state and submit against the draft** - `2f87e568`

## Verification

- `cd BE && npx jest apps/artwork-service/src/presentation/microservice/upload.microservice.controller.spec.ts --runInBand` - passed, 5 tests.
- `cd FE/artium-web && npx eslint src/@domains/inventory-upload src/@shared/apis/artworkApis.ts src/@shared/apis/artworkUploadApi.ts` - passed with 5 existing `@next/next/no-img-element` warnings.
- `cd FE/artium-web && npx tsc --noEmit --pretty false` - passed.
- `! rg -n "temp-\\$\\{Date\\.now\\(\\)\\}|FormData\\(\\).*sellerId|formData\\.append\\('sellerId'" FE/artium-web/src/@domains/inventory-upload FE/artium-web/src/@shared/apis/artworkUploadApi.ts` - passed.

## Files Created/Modified

- `BE/apps/artwork-service/src/presentation/microservice/upload.microservice.controller.spec.ts` - Unit coverage for draft upload ownership/status checks.
- `BE/apps/api-gateway/src/presentation/http/controllers/artwork/upload.controller.ts` - Removes sellerId from artwork upload Swagger bodies and injects `req.user.id` into RPC payloads.
- `BE/apps/artwork-service/src/presentation/microservice/upload.microservice.controller.ts` - Validates draft owner and `ArtworkStatus.DRAFT` before storage writes.
- `FE/artium-web/src/@shared/apis/artworkUploadApi.ts` - Stops appending sellerId to artwork image upload FormData.
- `FE/artium-web/src/@shared/types/artwork.ts` - Makes upload request sellerId optional for compatibility while backend identity is authoritative.
- `FE/artium-web/src/@domains/inventory-upload/services/artworkUploadService.ts` - Uses backend draft id for image upload, save, image attachment, and final submit.
- `FE/artium-web/src/@domains/inventory-upload/hooks/useArtworkSubmit.ts` - Removes sellerId from the submit call contract.
- `FE/artium-web/src/@domains/inventory-upload/views/UploadPage.tsx` - Calls submit with the backend draft id.

## Decisions Made

- Kept `sellerId?: string` in the frontend upload request types temporarily so existing object-literal callers remain source-compatible, but the upload API ignores it and never serializes it.
- Replaced the upload microservice controller's `uuid` dependency with Node `randomUUID` to keep targeted Jest from loading the ESM-only `uuid` package.

## Deviations from Plan

### Auto-Fixed Issues

**1. [Rule 3 - Blocking] Adjusted upload controller imports for Jest compatibility**
- **Found during:** Task 1 verification
- **Issue:** The controller's existing `apps/artwork-service/src/domain` import could not resolve in the targeted Jest context, and the domain barrel pulled ESM `uuid` through `GcsStorageService`.
- **Fix:** Imported only the repository token/interface by relative path, used a type-only storage import, and replaced `uuidv4` with Node `randomUUID`.
- **Files modified:** `BE/apps/artwork-service/src/presentation/microservice/upload.microservice.controller.ts`
- **Verification:** Targeted upload microservice Jest passed.
- **Committed in:** `08148fed`

---

**Total deviations:** 1 auto-fixed blocking verification issue.
**Impact on plan:** No scope change; the fix made the planned unit coverage runnable and removed an avoidable runtime dependency from this controller.

## Issues Encountered

None beyond the auto-fixed Jest import/runtime issue above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Wave 3 can audit the final backend/frontend contract with concrete evidence that upload media ownership, frontend draft hydration, and final draft submission now use the backend draft contract.

## Self-Check: PASSED

---
*Phase: 28-artwork-upload-draft-backend-gap-audit-and-contract-cleanup*
*Completed: 2026-04-29*
