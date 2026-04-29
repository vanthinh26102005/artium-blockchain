---
phase: 27-frontend-shared-api-definition-standardization-and-edge-case
plan: 02
subsystem: api
tags: [frontend, api-modules, query-encoding, path-encoding]
requires:
  - phase: 27
    provides: Shared API client helpers from Plan 01.
provides:
  - JSON API modules migrated to shared query/path helpers.
  - Gateway-only artwork and folder API routing.
affects: [frontend-api, artwork, auctions, orders, payments, profile, followers, events, users]
tech-stack:
  added: []
  patterns:
    - withQuery for all shared API query strings
    - encodePathSegment for dynamic path values
key-files:
  created: []
  modified:
    - FE/artium-web/src/@shared/apis/artworkApis.ts
    - FE/artium-web/src/@shared/apis/artworkFolderApis.ts
    - FE/artium-web/src/@shared/apis/auctionApis.ts
    - FE/artium-web/src/@shared/apis/orderApis.ts
    - FE/artium-web/src/@shared/apis/paymentApis.ts
    - FE/artium-web/src/@shared/apis/profileApis.ts
    - FE/artium-web/src/@shared/apis/followersApis.ts
    - FE/artium-web/src/@shared/apis/eventsApis.ts
    - FE/artium-web/src/@shared/apis/usersApi.ts
key-decisions:
  - "Preserve existing default API exports while changing internal request construction."
  - "Use explicit `/artwork` gateway paths instead of artwork-specific base URL normalization."
patterns-established:
  - "API modules keep response normalizers locally but delegate request construction to apiClient helpers."
requirements-completed: []
duration: resumed
completed: 2026-04-29
---

# Phase 27 Plan 02: JSON API Module Migration Summary

**JSON API modules now use shared query and path helpers without changing their default exports**

## Performance

- **Duration:** resumed from in-progress work
- **Started:** pre-existing unstaged Phase 27 progress
- **Completed:** 2026-04-29T14:12:47Z
- **Tasks:** 3/3
- **Files modified:** 9

## Accomplishments

- Replaced local query builders and manual query interpolation with `withQuery`.
- Replaced raw dynamic route interpolation with `encodePathSegment` across JSON API modules.
- Removed artwork/folder local base URL helpers tied to `NEXT_PUBLIC_ARTWORK_API_URL`.

## Task Commits

Phase 27 was resumed from existing unstaged progress, then committed as one consolidated source commit:

- `531d6f18` feat(27): standardize shared API definitions

## Files Created/Modified

- `FE/artium-web/src/@shared/apis/artworkApis.ts` - Gateway artwork endpoints using shared helpers.
- `FE/artium-web/src/@shared/apis/artworkFolderApis.ts` - Gateway folder endpoints using shared helpers.
- `FE/artium-web/src/@shared/apis/auctionApis.ts` - Shared query/path helpers.
- `FE/artium-web/src/@shared/apis/orderApis.ts` - Shared query/path helpers.
- `FE/artium-web/src/@shared/apis/paymentApis.ts` - Shared query/path helpers.
- `FE/artium-web/src/@shared/apis/profileApis.ts` - Shared query/path helpers.
- `FE/artium-web/src/@shared/apis/followersApis.ts` - Shared query/path helpers.
- `FE/artium-web/src/@shared/apis/eventsApis.ts` - Shared path helpers.
- `FE/artium-web/src/@shared/apis/usersApi.ts` - Shared query/path helpers.

## Decisions Made

- Artwork and folder APIs use gateway routes (`/artwork`, `/artwork/artwork-folders`) and no longer resolve a separate artwork service base URL.

## Deviations from Plan

The planned `getArtworkApiBaseUrl` helper was not retained because the artwork-specific environment variable was intentionally removed.

**Total deviations:** 1 user-directed scope correction.
**Impact on plan:** JSON API standardization still completed; the obsolete environment compatibility path was avoided.

## Issues Encountered

None in the API layer.

## Verification

- `npx eslint src/@shared/services/apiClient.ts src/@shared/apis/*.ts` passed.
- Structural checks found no local `buildQuery`, `buildQueryString`, `new URLSearchParams`, direct `fetch(`, or `useAuthStore` under `src/@shared/apis`.
- `npm run build` passed after rerunning with network access for Google Fonts.

## User Setup Required

None.

## Next Phase Readiness

Ready for upload transport and invoice mock isolation.

---
*Phase: 27-frontend-shared-api-definition-standardization-and-edge-case*
*Completed: 2026-04-29*
