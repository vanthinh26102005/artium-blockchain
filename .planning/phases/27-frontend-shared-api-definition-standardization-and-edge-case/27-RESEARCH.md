# Phase 27: Frontend shared API definition standardization and edge-case audit - Research

## Research Complete

This research answers: "What do I need to know to plan Phase 27 well?"

## Current State Audit

| Area | Current Evidence | Planning Implication |
|------|------------------|----------------------|
| Shared client | `apiClient.ts` centralizes auth headers, JSON `Content-Type`, fetch, and basic `ApiError.status`. | Extend this file rather than creating a parallel client. |
| Query strings | `artworkApis.ts`, `auctionApis.ts`, `profileApis.ts`, and `orderApis.ts` each define their own builder; `followersApis.ts`, `messagingApis.ts`, `usersApi.ts`, and `paymentApis.ts` manually interpolate. | Introduce one shared helper and migrate every API module. |
| Path params | Some modules use `encodeURIComponent`; many interpolate raw IDs directly. | Add `encodePathSegment` and use it for every dynamic route segment. |
| Base URLs | `artworkApis.ts`, `artworkFolderApis.ts`, `artworkUploadApi.ts`, and `messagingApis.ts` each normalize base URLs differently. | Centralize base URL resolution and preserve artwork env compatibility. |
| Uploads | `artworkUploadApi.ts` uses XHR for progress; `messagingApis.ts` uses direct `fetch` for file upload. | Keep XHR for progress but make upload transport a supported shared client path. |
| Mock data | `invoiceApis.ts` embeds mock invoice behavior, delays, and console logs in the API module. | Isolate mock behavior from production endpoint definitions. |
| Tests | `FE/artium-web/package.json` has no test script or test dependencies. | Use lint/build as required verification unless a plan explicitly adds test tooling. |

## Recommended API Definition Standard

### Module Shape

Each file in `FE/artium-web/src/@shared/apis` should follow this order:
1. Imports from `@shared/services/apiClient`.
2. Exported request/response types.
3. Small local response normalizers where the backend shape is known to vary.
4. Endpoint object with stable default export.

The endpoint object remains the public compatibility boundary. This avoids changing existing consumers such as inventory, auction, checkout, profile, events, and messaging domains.

### Shared Client Responsibilities

`FE/artium-web/src/@shared/services/apiClient.ts` should own:
- `buildApiUrl(path, baseUrl?)`
- `buildQueryString(params?)`
- `withQuery(path, params?)`
- `encodePathSegment(value)`
- `jsonBody(body)`
- `ApiError` with `status`, `data`, and `headers`
- JSON/text/empty-body response parsing
- Auth token hydration and `Authorization` attachment
- `apiFetch`, `apiPost`, and upload helper support

### Edge Cases and Solutions

| Edge Case | Risk | Solution |
|-----------|------|----------|
| `204 No Content` | `response.json()` or text parsing can produce unexpected values. | Return `undefined as T` when status is 204 or body text is empty. |
| Backend `message` as array | UI gets poor error text. | Join string arrays with `, ` in shared error extractor. |
| Query values `0` and `false` | Existing filters can drop valid values if using truthiness checks. | Omit only `undefined`, `null`, and `''`; preserve `0` and `false`. |
| Array query params | Future filters need multi-select support. | Encode arrays as repeated keys. |
| Raw path IDs | IDs with `/`, `?`, `#`, spaces, or email-like values break routes. | Use `encodePathSegment` for every dynamic segment. |
| Artwork base URL variants | Deployments may set gateway root, `/artwork`, or `/artworks`. | Centralize compatibility in one helper and use it from artwork/folder/upload modules. |
| FormData uploads | Setting JSON content type breaks multipart boundary. | `jsonBody` and upload helpers must not set `Content-Type` for `FormData`. |
| Direct upload fetch | Messaging upload bypasses shared error/auth conventions. | Route messaging upload through the shared upload helper. |
| Mock invoice behavior | Mock delays/logging can obscure production API definitions. | Move mock functions into `invoiceMocks.ts` or an internal mock adapter section with no production logs. |

## Validation Architecture

Phase verification should use existing frontend scripts:
- `cd FE/artium-web && npm run lint`
- `cd FE/artium-web && npm run build`

Recommended structural checks:
- `rg -n "new URLSearchParams|\\?userId=|\\?address=|\\?usdAmount=|\\$\\{[^}]+\\}" FE/artium-web/src/@shared/apis FE/artium-web/src/@shared/services/apiClient.ts`
- `rg -n "buildQueryString|withQuery|encodePathSegment|buildApiUrl|ApiError" FE/artium-web/src/@shared/services/apiClient.ts FE/artium-web/src/@shared/apis`
- `rg -n "XMLHttpRequest|uploadWithProgress|apiUpload" FE/artium-web/src/@shared/services FE/artium-web/src/@shared/apis`

The executor should not rely only on grep checks; lint and build are required because these API modules are heavily imported across domains.

## Risks

- A single helper change can affect every API call; migrate in small waves and run frontend build after migration.
- Artwork base URL handling is deployment-sensitive; preserve current compatibility before simplifying.
- Upload progress cannot be replaced with plain `fetch`; keep XHR where progress is needed.
- Adding a test runner would increase scope; do not add one unless the executor explicitly accepts the dependency and script change.

## RESEARCH COMPLETE
