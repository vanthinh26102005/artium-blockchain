---
phase: 27-frontend-shared-api-definition-standardization-and-edge-case
plan: 03
subsystem: api
tags: [frontend, uploads, formdata, invoices, mocks]
requires:
  - phase: 27
    provides: Shared API client primitives from Plan 01.
provides:
  - Shared multipart upload transport.
  - Artwork, avatar, and messaging uploads migrated to apiUpload.
  - Invoice mock behavior isolated from production endpoint definitions.
affects: [frontend-api, uploads, messaging, invoices]
tech-stack:
  added: []
  patterns:
    - apiUpload for FormData requests with progress, auth, timeout, and abort support
    - Separate mock module for invoice mocks
key-files:
  created:
    - FE/artium-web/src/@shared/apis/invoiceMocks.ts
  modified:
    - FE/artium-web/src/@shared/services/apiClient.ts
    - FE/artium-web/src/@shared/apis/artworkUploadApi.ts
    - FE/artium-web/src/@shared/apis/messagingApis.ts
    - FE/artium-web/src/@shared/apis/invoiceApis.ts
key-decisions:
  - "Keep file validation local to upload modules while centralizing upload transport."
  - "Keep invoice mock mode explicit through NEXT_PUBLIC_USE_MOCK_API."
patterns-established:
  - "Use apiUpload for FormData transport; never set multipart Content-Type manually."
  - "Move mock-only behavior into separate mock modules."
requirements-completed: []
duration: resumed
completed: 2026-04-29
---

# Phase 27 Plan 03: Upload and Mock API Standardization Summary

**Shared upload transport now handles FormData progress/auth/timeout/abort, and invoice mocks are isolated from production endpoints**

## Performance

- **Duration:** resumed from in-progress work
- **Started:** pre-existing unstaged Phase 27 progress
- **Completed:** 2026-04-29T14:12:47Z
- **Tasks:** 3/3
- **Files modified:** 5

## Accomplishments

- Added `apiUpload`, `ApiUploadOptions`, `ApiUploadProgress`, and `ApiUploadError` to the shared client.
- Migrated artwork/avatar uploads and messaging uploads to `apiUpload`.
- Moved quick-sell invoice mock responses into `invoiceMocks.ts`, leaving production endpoint definitions clear in `invoiceApis.ts`.

## Task Commits

Phase 27 was resumed from existing unstaged progress, then committed as one consolidated source commit:

- `531d6f18` feat(27): standardize shared API definitions

## Files Created/Modified

- `FE/artium-web/src/@shared/services/apiClient.ts` - Shared upload transport.
- `FE/artium-web/src/@shared/apis/artworkUploadApi.ts` - Artwork/avatar upload calls via `apiUpload`.
- `FE/artium-web/src/@shared/apis/messagingApis.ts` - Messaging upload call via `apiUpload`.
- `FE/artium-web/src/@shared/apis/invoiceApis.ts` - Production invoice API definitions importing mocks.
- `FE/artium-web/src/@shared/apis/invoiceMocks.ts` - Mock invoice behavior.

## Decisions Made

- Upload modules retain local file validation because it is domain-specific, but all request transport behavior is centralized.

## Deviations from Plan

None beyond the consolidated source commit caused by resuming pre-existing Phase 27 progress.

## Issues Encountered

None in the API layer.

## Verification

- `npx eslint src/@shared/services/apiClient.ts src/@shared/apis/*.ts` passed.
- Structural checks confirmed `apiUpload` exists and upload modules no longer import `useAuthStore` or create local `XMLHttpRequest` upload transport.
- `npm run build` passed after rerunning with network access for Google Fonts.

## User Setup Required

None.

## Next Phase Readiness

Ready for final API audit, docs pass, and phase verification.

---
*Phase: 27-frontend-shared-api-definition-standardization-and-edge-case*
*Completed: 2026-04-29*
