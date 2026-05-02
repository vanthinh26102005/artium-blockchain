# Shared API Definitions

## Module Shape

API modules in this directory keep stable default exports such as `artworkApis`, `auctionApis`, `paymentApis`, `orderApis`, `profileApis`, `followersApis`, `messagingApis`, `eventsApis`, `usersApi`, `invoiceApis`, `artworkFolderApis`, and `artworkUploadApi`.

Use this order for new modules:
1. Imports from `@shared/services/apiClient`.
2. Exported request and response types.
3. Small local response normalizers when backend shapes vary.
4. Endpoint object and default export.

## Shared Client Helpers

Use these helpers from `@shared/services/apiClient`:
- `buildApiUrl` for base URL and path joining.
- `buildQueryString` for query encoding.
- `withQuery` for appending query strings to paths.
- `encodePathSegment` for dynamic route segments.
- `jsonBody` for JSON request bodies.
- `apiFetch` for JSON/text requests.
- `apiPost` for simple POST requests.
- `apiUpload` for multipart uploads with progress.
- `ApiError` for structured request failures.

## URL Rules

All API calls use `NEXT_PUBLIC_API_URL` as the gateway base URL.

Artwork calls must use explicit gateway paths such as `/artwork`, `/artwork/artwork-folders`, and `/artwork/uploads`. Do not add resource-specific base URL environment variables. Legacy `/artworks` service paths should not be reintroduced into frontend API definitions.

## Query Rules

Use `withQuery(path, params)` or `buildQueryString(params)`.

The shared query builder omits `undefined`, `null`, and empty strings. It must preserve `0` and `false`. Array values are encoded as repeated keys.

## Path Parameter Rules

Every dynamic path segment must use `encodePathSegment`. Pass raw IDs, slugs, invoice codes, wallet addresses, and message IDs to the helper once.

Do not encode static route fragments such as `/identity/users/me` or `/events/discover`.

## Auth and Cache Defaults

`apiFetch` defaults to `auth: true`. Public endpoints must pass `auth: false`.

Read endpoints that need fresh data should continue using `cache: 'no-store'`.

## Response and Error Rules

`apiFetch` handles JSON, text, and empty `204 No Content` responses. Backend errors are thrown as `ApiError` with `status`, `data`, `headers`, and a readable `message`.

Backend `message` arrays are joined into one readable string.

## Upload Rules

Use `apiUpload` for `FormData` requests. Do not set `Content-Type` for `FormData`; the browser must set the multipart boundary.

Upload modules may keep local file validation, but transport, auth, timeout, abort, progress, and response parsing should come from the shared helper.

## Mock API Rules

Mock behavior must stay isolated from production endpoint definitions. Prefer a separate mock module when a feature needs `NEXT_PUBLIC_USE_MOCK_API`.

## Migration Examples

Query construction:

```ts
withQuery('/orders', { scope, status, skip, take })
```

Path construction:

```ts
`/orders/${encodePathSegment(id)}`
```

Upload construction:

```ts
apiUpload('/messaging/upload', formData, { baseUrl })
```

## Edge Case Checklist

- `204 No Content` responses return an empty typed value instead of forcing JSON parsing.
- Backend string-array messages are joined into one readable error message.
- Query value `0` is preserved.
- Query value `false` is preserved.
- Array query values are encoded as repeated keys.
- IDs containing `/`, `?`, `#`, or spaces are encoded with `encodePathSegment`.
- Artwork endpoints use gateway `/artwork` routes; legacy `/artworks` paths are treated as historical backend/service paths, not frontend API base URLs.
- `FormData` content-type boundaries are browser-owned; do not set `Content-Type` for uploads.

## Verification

Run these checks after changing shared API definitions:

```bash
cd FE/artium-web && npm run lint
cd FE/artium-web && npm run build
```
