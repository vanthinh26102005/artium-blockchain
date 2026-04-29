# Phase 27: Frontend shared API definition standardization and edge-case audit - Patterns

## Pattern Map

| Target | Role | Closest Existing Analog | Pattern to Preserve |
|--------|------|-------------------------|---------------------|
| `FE/artium-web/src/@shared/services/apiClient.ts` | Shared request core | Existing `apiFetch` and `apiPost` | Keep auth default true, auth hydration, JSON content-type detection, and typed return shape. |
| `FE/artium-web/src/@shared/apis/artworkApis.ts` | Domain API object with response normalizers | `normalizeArtworkList`, `normalizeArtworkPage` | Preserve local backend-shape normalization while moving URL/query helpers to shared client. |
| `FE/artium-web/src/@shared/apis/artworkFolderApis.ts` | Domain API object with base compatibility | `normalizeBaseForFolders` | Replace duplicated base compatibility with shared artwork base helper. |
| `FE/artium-web/src/@shared/apis/auctionApis.ts` | Query-driven public and seller endpoints | `buildQueryString` local helper | Migrate to shared query helper and keep explicit `auth: false` for public reads. |
| `FE/artium-web/src/@shared/apis/orderApis.ts` | Authenticated state transitions | Local `buildQueryString` plus `apiPost` | Migrate query helper; preserve PATCH body conventions. |
| `FE/artium-web/src/@shared/apis/artworkUploadApi.ts` | XHR upload/progress | `uploadWithProgress` | Move reusable upload behavior to shared service layer without losing progress and abort support. |
| `FE/artium-web/src/@shared/apis/messagingApis.ts` | Messaging JSON + file upload | Direct `fetch` upload | Replace direct upload fetch with shared upload helper while preserving response type. |
| `FE/artium-web/src/@shared/apis/invoiceApis.ts` | API object with dev mock branch | Local mock functions | Isolate mock implementation and keep `NEXT_PUBLIC_USE_MOCK_API` behavior. |

## Existing Client Excerpts

From `apiClient.ts`, preserve the default auth behavior:

```ts
export const apiFetch = async <T>(path: string, options?: ApiFetchOptions): Promise<T> => {
  const { auth = true, baseUrl, ...init } = options ?? {}
```

From `apiClient.ts`, preserve JSON body detection for non-FormData bodies:

```ts
if (isJsonBody(init.body) && !headers.has('Content-Type')) {
  headers.set('Content-Type', 'application/json')
}
```

From `artworkApis.ts`, preserve list/page response compatibility:

```ts
const normalizeArtworkList = (
  response: ArtworkApiItem[] | ArtworkListResponse,
): ArtworkApiItem[] => {
```

From `artworkUploadApi.ts`, preserve progress support:

```ts
xhr.upload.addEventListener("progress", (e) => {
  if (e.lengthComputable) {
```

## Migration Order

1. Extend shared client helpers and documentation.
2. Migrate JSON API modules that already use `apiFetch` and local/manual query strings.
3. Migrate artwork/folder base URL handling.
4. Migrate upload and mock-special cases.
5. Run lint/build and update roadmap/state.

## Non-Patterns to Remove

- Manual query string interpolation like ``?userId=${userId}``.
- Per-file query builders that duplicate filtering rules.
- Raw dynamic path params in template literals.
- Direct `fetch` from API modules when shared client helpers can support the use case.
- Console-heavy mock branches mixed directly into production endpoint definitions.
