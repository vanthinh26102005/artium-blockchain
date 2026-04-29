# Phase 28 Backend Contract Audit

## Route

The audited browser route is `/artworks/upload?draftArtworkId=6f2c4075-4892-4e09-ba4e-e24101b262f9`.

The route parameter is now treated as the backend artwork draft id. When the parameter is absent, `UploadPage` generates a draft id, updates the URL, and calls the backend create draft path. When the parameter is present from an external link, `UploadPage` loads the backend draft instead of silently continuing with local-only state.

## Frontend Calls

`FE/artium-web/src/@shared/apis/artworkApis.ts` defines the JSON draft contract:

- `createUploadDraft(draftArtworkId)` calls `POST /artwork/drafts/:draftArtworkId`.
- `getUploadDraft(draftArtworkId)` calls `GET /artwork/drafts/:draftArtworkId`.
- `saveUploadDraft(draftArtworkId, input)` calls `PUT /artwork/drafts/:draftArtworkId`.
- `submitUploadDraft(draftArtworkId, input)` calls `POST /artwork/drafts/:draftArtworkId/submit`.

`FE/artium-web/src/@domains/inventory-upload/views/UploadPage.tsx` calls `createUploadDraft` only for locally generated draft ids and `getUploadDraft` for URL-provided ids. 403/404 draft load failures set a visible hydration error and block continuation.

`FE/artium-web/src/@domains/inventory-upload/services/artworkUploadService.ts` saves the draft payload, uploads images against the same `draftArtworkId`, attaches uploaded image metadata to that draft, then submits the draft. It no longer creates a separate artwork after uploading to a temporary id.

## Gateway Routes

`BE/apps/api-gateway/src/presentation/http/controllers/artwork/artwork.controller.ts` exposes the authenticated draft routes:

- `POST /artwork/drafts/:draftArtworkId` forwards `create_artwork_upload_draft`.
- `GET /artwork/drafts/:draftArtworkId` forwards `get_artwork_upload_draft`.
- `PUT /artwork/drafts/:draftArtworkId` forwards `save_artwork_upload_draft`.
- `POST /artwork/drafts/:draftArtworkId/submit` forwards `submit_artwork_upload_draft`.

All four draft routes are protected by `JwtAuthGuard` and forward `req.user` to the artwork service.

`BE/apps/api-gateway/src/presentation/http/controllers/artwork/upload.controller.ts` exposes media routes:

- `POST /artwork/uploads/artwork-image` forwards `upload_artwork_image`.
- `POST /artwork/uploads/artwork-images` forwards `upload_artwork_images`.

The media routes no longer require multipart `sellerId`. They inject `sellerId: req.user.id` into the RPC payload.

## Artwork-Service RPC

`BE/apps/artwork-service/src/presentation/microservice/artworks.microservice.controller.ts` receives:

- `create_artwork_upload_draft`
- `get_artwork_upload_draft`
- `save_artwork_upload_draft`
- `submit_artwork_upload_draft`

Those message patterns delegate to the Phase 28 CQRS command/query handlers created in Plan 28-01.

`BE/apps/artwork-service/src/presentation/microservice/upload.microservice.controller.ts` receives:

- `upload_artwork_image`
- `upload_artwork_images`

Before writing to GCS, it loads the target artwork draft through `IArtworkRepository`.

## Ownership Rules

The backend owns seller identity:

- Gateway draft routes forward `user: req.user`.
- Gateway upload routes forward `sellerId: req.user.id`.
- Draft command/query handlers require the draft to belong to the authenticated user.
- Upload microservice checks `artwork.sellerId !== dto.sellerId` and rejects mismatches.
- Upload microservice checks `artwork.status !== ArtworkStatus.DRAFT` and rejects non-draft artwork ids.

Wrong-owner draft reads and mutations use not-found semantics in the draft handlers to avoid leaking draft existence. Media upload ownership failures are rejected before storage path construction.

## Payload Mapping

The frontend draft save payload maps upload form state to backend draft fields:

- `title`
- `description`
- `creationYear`
- `editionRun`
- `dimensions`
- `weight`
- `materials`
- `location`
- `price`
- `currency`
- `quantity`
- `tagIds`

The final submit payload maps listing state into `SubmitArtworkDraftInput` with `listingStatus`, optional `price`, optional `quantity`, and `isPublished`.

## Media Rules

Artwork image uploads use `/artwork/uploads/artwork-image` with multipart fields:

- `file`
- `artworkId`
- optional `altText`
- optional `isPrimary`
- optional `order`

The frontend no longer appends `sellerId` to artwork image upload `FormData`. The service uploads to `artworks/{sellerId}/{artworkId}` only after it verifies that the draft exists, belongs to the authenticated seller, and is still `DRAFT`.

The stale temporary id pattern `temp-${Date.now()}` is removed from the upload service. Uploaded media targets the backend draft id from the route.

## Verification Results

Task 1 structural audit:

- Route/API trace confirmed for `/artworks/upload?draftArtworkId=6f2c4075-4892-4e09-ba4e-e24101b262f9`.
- Draft gateway routes confirmed for `/artwork/drafts/:draftArtworkId` and `/artwork/drafts/:draftArtworkId/submit`.
- Draft RPC patterns confirmed for `create_artwork_upload_draft`, `get_artwork_upload_draft`, `save_artwork_upload_draft`, and `submit_artwork_upload_draft`.
- Media RPC pattern confirmed for `upload_artwork_image`.
Task 2 command results:

- `cd BE && npx jest apps/artwork-service/src/application/commands/artworks/handlers/SaveArtworkDraft.command.handler.spec.ts apps/artwork-service/src/application/commands/artworks/handlers/SubmitArtworkDraft.command.handler.spec.ts apps/artwork-service/src/presentation/microservice/upload.microservice.controller.spec.ts --runInBand` - passed; 3 suites and 15 tests.
- `cd BE && yarn build:gateway` - passed; webpack compiled successfully.
- `cd BE && yarn build:artwork` - passed; webpack compiled successfully.
- `cd FE/artium-web && npx eslint src/@domains/inventory-upload src/@shared/apis/artworkApis.ts src/@shared/apis/artworkUploadApi.ts` - exited 0 with 5 warnings from existing `<img>` usage in `MediaPreviewCard.tsx`, `Step1Layout.tsx`, and `VideoPicker.tsx`.
- `cd FE/artium-web && npx tsc --noEmit --pretty false` - passed.

No verification blocker references a Phase 28 modified file.

## Remaining Risks

- Browser-level verification still requires an authenticated local session and a seeded draft row for `6f2c4075-4892-4e09-ba4e-e24101b262f9`.
- Free-form custom tags are still mapped into `tagIds`; this preserves existing upload form behavior but may need a later tag creation/selection contract if product wants typed custom tag creation.
