---
phase: 27-frontend-shared-api-definition-standardization-and-edge-case
plan: 01
subsystem: api
tags: [frontend, api-client, query-encoding, errors]
requires:
  - phase: 20
    provides: Completed seller auction lifecycle backend/API context.
provides:
  - Shared API URL, query, path, JSON body, error, and upload primitives.
  - API definition README with module conventions.
affects: [frontend-api, shared-client]
tech-stack:
  added: []
  patterns:
    - Shared URL/query/path helpers in apiClient.ts
    - Structured ApiError details
key-files:
  created:
    - FE/artium-web/src/@shared/apis/README.md
  modified:
    - FE/artium-web/src/@shared/services/apiClient.ts
key-decisions:
  - "Use NEXT_PUBLIC_API_URL as the single frontend gateway base URL; NEXT_PUBLIC_ARTWORK_API_URL is intentionally absent."
  - "Preserve 0 and false in shared query construction while omitting undefined, null, and empty strings."
patterns-established:
  - "Use withQuery for query construction."
  - "Use encodePathSegment for dynamic path values."
requirements-completed: []
duration: resumed
completed: 2026-04-29
---

# Phase 27 Plan 01: Shared API Client Contract Summary

**Shared frontend API client primitives for URL composition, query encoding, path encoding, JSON bodies, empty responses, and structured errors**

## Performance

- **Duration:** resumed from in-progress work
- **Started:** pre-existing unstaged Phase 27 progress
- **Completed:** 2026-04-29T14:12:47Z
- **Tasks:** 3/3
- **Files modified:** 2

## Accomplishments

- Added exported `buildApiUrl`, `buildQueryString`, `withQuery`, `encodePathSegment`, `jsonBody`, and `ApiError` primitives.
- Updated `apiFetch` to parse response text once, handle `204 No Content`, preserve backend error data/headers, and join string-array messages.
- Created the shared API README with module shape, helper rules, query/path rules, upload rules, mock rules, and verification guidance.

## Task Commits

Phase 27 was resumed from existing unstaged progress, then committed as one consolidated source commit:

- `531d6f18` feat(27): standardize shared API definitions

## Files Created/Modified

- `FE/artium-web/src/@shared/services/apiClient.ts` - Shared API primitives and structured response/error handling.
- `FE/artium-web/src/@shared/apis/README.md` - API module definition standard.

## Decisions Made

- `NEXT_PUBLIC_ARTWORK_API_URL` remains removed. Artwork APIs now use explicit gateway paths through `NEXT_PUBLIC_API_URL`.

## Deviations from Plan

The original plan mentioned an artwork-specific base URL compatibility helper. The user clarified during execution that `NEXT_PUBLIC_ARTWORK_API_URL` was removed intentionally, so the implementation documents and preserves a gateway-only API base instead.

**Total deviations:** 1 user-directed scope correction.
**Impact on plan:** Positive. It avoids reintroducing obsolete environment configuration while preserving the shared API standard.

## Issues Encountered

- Full `npm run lint` is blocked by unrelated existing lint errors outside `src/@shared/apis` and `src/@shared/services/apiClient.ts`.

## Verification

- `npx eslint src/@shared/services/apiClient.ts src/@shared/apis/*.ts` passed.
- `npm run build` passed after rerunning with network access for Google Fonts.
- Structural checks confirmed no `NEXT_PUBLIC_ARTWORK_API_URL` references remain.

## User Setup Required

None.

## Next Phase Readiness

Ready for JSON API module migration and final API audit.

---
*Phase: 27-frontend-shared-api-definition-standardization-and-edge-case*
*Completed: 2026-04-29*
