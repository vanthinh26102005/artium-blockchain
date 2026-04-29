# Phase 27: Frontend shared API definition standardization and edge-case audit - Context

**Gathered:** 2026-04-29
**Status:** Ready for planning
**Source:** Inline audit of `FE/artium-web/src/@shared/apis` and `FE/artium-web/src/@shared/services/apiClient.ts`

<domain>
## Phase Boundary

This phase standardizes the frontend shared API definition layer under `FE/artium-web/src/@shared/apis` and the shared request primitives in `FE/artium-web/src/@shared/services/apiClient.ts`.

In scope:
- A single URL/query/path/error contract for JSON API calls.
- Stable API module exports so current domain imports do not need a broad rewrite.
- Consistent handling of base URLs, auth defaults, JSON request bodies, empty responses, path params, query params, response normalization, mock responses, and upload/progress requests.
- Edge-case documentation for future API modules.

Out of scope:
- Backend endpoint redesign.
- UI layout or component changes.
- Adding a new test runner unless the executor explicitly chooses to do so after checking project constraints.
- Replacing every consumer import with a new domain client abstraction.
</domain>

<decisions>
## Implementation Decisions

### D-01 Stable Public API Module Surface
- Keep existing default exports such as `artworkApis`, `auctionApis`, `paymentApis`, `orderApis`, `profileApis`, `followersApis`, `messagingApis`, `eventsApis`, `usersApi`, `invoiceApis`, `artworkFolderApis`, and `artworkUploadApi` stable.
- Do not require call sites outside `FE/artium-web/src/@shared/apis` to change unless a type error proves a caller is relying on broken behavior.

### D-02 Shared Request Core
- Extend `FE/artium-web/src/@shared/services/apiClient.ts` into the single source of truth for JSON request behavior.
- The shared core must expose or support these concrete behaviors: `buildApiUrl`, `buildQueryString`, `encodePathSegment`, `jsonBody`, `apiFetch`, `apiPost`, and a structured `ApiError`.
- `ApiError` must preserve `status`, parsed response `data`, and a user-readable `message`.

### D-03 URL and Base URL Rules
- Default JSON API calls use `NEXT_PUBLIC_API_URL`.
- Artwork-domain calls may use `NEXT_PUBLIC_ARTWORK_API_URL`, but base/path normalization must be centralized instead of duplicated in `artworkApis.ts`, `artworkFolderApis.ts`, and `artworkUploadApi.ts`.
- Paths passed to `apiFetch` should be service-relative paths like `/artworks`, `/auction`, `/identity/users/me`, or `/messaging/messages`.
- Base URLs must be trimmed of trailing slashes; paths must be normalized to exactly one leading slash.
- Existing environment compatibility for `NEXT_PUBLIC_ARTWORK_API_URL` ending in `/artwork`, `/artworks`, or the gateway root must be preserved.

### D-04 Query String Rules
- Use one shared query builder for all query strings.
- The query builder must omit `undefined`, `null`, and empty string values.
- The query builder must preserve `0`, `false`, and non-empty strings.
- Array values must be encoded as repeated keys, e.g. `tagIds=a&tagIds=b`, if needed by future modules.
- Manual query interpolation should be removed from API modules except where a native URL object is used through the shared helper.

### D-05 Path Param Rules
- All dynamic path parameters must pass through `encodePathSegment`.
- Current risky interpolations include invoice code, user IDs, folder IDs, message IDs, conversation IDs, order IDs, event IDs, artwork IDs, and profile IDs.
- Encoded path segments must not double-encode already-normal strings; callers pass raw IDs and the helper encodes once.

### D-06 Response Normalization Rules
- Existing list/page normalization in `artworkApis.ts` and `artworkFolderApis.ts` is valid and should be preserved.
- Empty success responses such as HTTP `204 No Content` must not throw during parsing.
- Non-JSON success responses should be returned as text only when the caller requested `T` compatible with text or `void`.
- Backend error payloads with string or string-array `message` must produce a readable `ApiError.message`.

### D-07 Auth and Cache Defaults
- Keep `auth: true` as the default for `apiFetch`.
- Public endpoints must continue to pass `auth: false`.
- Read endpoints that already use `cache: 'no-store'` should keep that behavior.
- Auth hydration and token attachment must stay centralized in the shared client rather than repeated across JSON modules.

### D-08 Upload Transport
- Multipart uploads with progress may continue using `XMLHttpRequest`, but the implementation must be formalized as a shared upload helper rather than ad hoc per module behavior.
- Upload requests must share auth token lookup, abort handling, timeout handling, JSON error extraction, and typed error creation with the API client contract.
- Upload helpers must not set `Content-Type` for `FormData`.

### D-09 Mock API Isolation
- `NEXT_PUBLIC_USE_MOCK_API` invoice behavior should be isolated behind a small mock adapter or clearly separated module block so production API definitions remain readable.
- Mock code must not leak console-heavy behavior into production branches.

### D-10 Verification Without New Tooling
- Prefer verification with existing commands: `cd FE/artium-web && npm run lint` and `cd FE/artium-web && npm run build`.
- If executor adds tests, it must first add an explicit package script and keep the dependency change intentional.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Shared Client
- `FE/artium-web/src/@shared/services/apiClient.ts` - current auth, header, JSON parsing, and error behavior.

### API Modules
- `FE/artium-web/src/@shared/apis/artworkApis.ts` - artwork base URL normalization, list/page normalization, CRUD endpoints.
- `FE/artium-web/src/@shared/apis/artworkFolderApis.ts` - folder base URL normalization and response normalization.
- `FE/artium-web/src/@shared/apis/artworkUploadApi.ts` - XHR upload/progress/abort implementation.
- `FE/artium-web/src/@shared/apis/auctionApis.ts` - auction query builder and seller auction lifecycle endpoints.
- `FE/artium-web/src/@shared/apis/orderApis.ts` - order query builder and state transition endpoints.
- `FE/artium-web/src/@shared/apis/paymentApis.ts` - Stripe and Ethereum quote/payment endpoints.
- `FE/artium-web/src/@shared/apis/profileApis.ts` - identity/community mixed endpoints and query builder.
- `FE/artium-web/src/@shared/apis/followersApis.ts` - manual query builder.
- `FE/artium-web/src/@shared/apis/invoiceApis.ts` - quick-sell invoice endpoints and mock branch.
- `FE/artium-web/src/@shared/apis/messagingApis.ts` - messaging base URL and manual fetch upload.
- `FE/artium-web/src/@shared/apis/eventsApis.ts` - event CRUD endpoints.
- `FE/artium-web/src/@shared/apis/usersApi.ts` - auth/user endpoints and response normalization.

### Project Verification
- `FE/artium-web/package.json` - available scripts are `dev`, `build`, `start`, and `lint`.
- `FE/artium-web/tsconfig.json` - strict TypeScript, `@shared/*`, `@domains/*`, and `@/*` path aliases.
</canonical_refs>

<specifics>
## Specific Ideas

- Add a small `ApiQueryValue` type: `string | number | boolean | readonly (string | number | boolean)[] | null | undefined`.
- Add `buildQueryString(params?: Record<string, ApiQueryValue>): string`.
- Add `withQuery(path: string, params?: Record<string, ApiQueryValue>): string`.
- Add `encodePathSegment(value: string | number): string`.
- Add `getArtworkApiBaseUrl()` to resolve `NEXT_PUBLIC_ARTWORK_API_URL` compatibility once.
- Add `apiUpload<T>()` or `uploadWithProgress<T>()` to centralize XHR behavior.
- Add `FE/artium-web/src/@shared/apis/README.md` documenting module conventions and edge cases.
</specifics>

<deferred>
## Deferred Ideas

- Generating API clients from OpenAPI contracts.
- Adding React Query or SWR.
- Adding a full mock service worker layer.
- Moving every API type into `@shared/types`.
</deferred>

---

*Phase: 27-frontend-shared-api-definition-standardization-and-edge-case*
*Context gathered: 2026-04-29 via inline audit*
