# Phase 28 Research: Artwork upload draft backend gap audit and contract cleanup

## RESEARCH COMPLETE

## Phase Summary

Phase 28 targets the existing route:

`/artworks/upload?draftArtworkId=6f2c4075-4892-4e09-ba4e-e24101b262f9`

The route currently treats `draftArtworkId` as a client-side store marker only. It does not fetch a backend draft, does not validate draft ownership, and final submission still creates a new artwork after uploading files to a temporary ID. The phase should convert this into a backend-accurate upload-draft flow without redesigning the page.

## Current Flow Observed

Frontend route:
- `FE/artium-web/src/pages/artworks/upload.tsx` dynamically renders `UploadPage`.
- `UploadPage` reads `router.query.draftArtworkId`.
- If missing, it generates a UUID and shallow-replaces the URL.
- If present, it only calls `hydrateFromQuery(draftArtworkIdParam)`.
- `hydrateFromQuery` only sets `draftId` and `isHydrated`; it does not fetch backend state.

Frontend submit:
- `useArtworkSubmit.submit(user.id)` passes the authenticated FE user ID as `sellerId`.
- `uploadArtworkWithImages` creates a `temp-${Date.now()}...` artwork ID for uploads.
- It uploads images to `/artwork/uploads/artwork-image` with form fields `sellerId` and `artworkId`.
- It creates the artwork with `/artwork`.
- It then calls `/artwork/:id/images` to attach uploaded images.

Backend route surfaces:
- API gateway `POST /artwork` uses `JwtAuthGuard`, but forwards body `sellerId` and `req.user`.
- API gateway `POST /artwork/uploads/artwork-image` uses `JwtAuthGuard`, but trusts form `sellerId` and `artworkId`.
- Artwork-service upload microservice stores files under `artworks/{sellerId}/{artworkId}` using payload values.
- Artwork-service create/update/add-images handlers do not currently enforce owner-scoped mutation from the `user` payload.

## Key Gaps

1. `draftArtworkId` is not backend-backed.
   - The provided draft ID cannot be loaded from the server.
   - The global persisted Zustand key `artium.inventoryUpload.state` is not draft-keyed.
   - Any user can open a URL with any UUID and the page silently treats it as local state.

2. Backend ownership is not authoritative enough for upload mutations.
   - Upload endpoints accept `sellerId` from multipart body.
   - Artwork create accepts `sellerId` from JSON body.
   - Add-images and update handlers receive `user` but do not enforce owner match.

3. Upload media can be orphaned or mis-keyed.
   - Files upload before final artwork creation.
   - File folder uses a temporary client-generated ID.
   - If create fails, files remain in storage without a durable artwork row.

4. Frontend payload mapping drops backend fields.
   - `dimensions`, `weight`, `allowOffers`, `hidePricePublic`, story tags, trivia, moment video, and location draft metadata are not represented in `CreateArtworkInput`.
   - `customTags` are sent as `tagIds`, but they are strings typed by the user, not necessarily backend tag IDs.

5. Status mapping is inconsistent.
   - Frontend sends `ACTIVE` for `sale` and `inquire`, `SOLD` for `sold`.
   - Backend status enum supports `DRAFT`, `ACTIVE`, `SOLD`, `RESERVED`, `INACTIVE`, `DELETED`, `PENDING_REVIEW`, `IN_AUCTION`.
   - Existing list query validation still documents lowercase legacy values in at least one controller path.

## Recommended Target Contract

Use an explicit authenticated draft contract over existing artwork data:

- `GET /artwork/drafts/:draftArtworkId`
  - returns a draft only when `artwork.id === draftArtworkId`, `artwork.sellerId === req.user.id`, and `artwork.status === DRAFT`.

- `PUT /artwork/drafts/:draftArtworkId`
  - updates a seller-owned draft only.
  - derives `sellerId` from `req.user.id`.
  - rejects body `sellerId` mismatches.

- `POST /artwork/drafts/:draftArtworkId/submit`
  - validates required upload fields, at least one primary image, status transition, and seller ownership.
  - transitions `DRAFT` to the intended lifecycle state.

- Upload image endpoints:
  - derive `sellerId` from `req.user.id`.
  - require `artworkId` to reference a seller-owned draft before storing under `artworks/{sellerId}/{artworkId}`.
  - reject missing files, unsupported image types, oversize files, non-draft artwork IDs, and owner mismatches.

This avoids a new draft table and keeps Phase 28 focused on contract accuracy rather than broad schema expansion. If a later product decision requires empty server-side drafts, introduce a dedicated draft entity in a separate phase.

## Validation Architecture

Use existing Jest infrastructure in `BE/package.json` and existing frontend TypeScript/ESLint commands.

Backend target tests:
- `BE/apps/artwork-service/src/application/commands/artworks/handlers/SaveArtworkDraft.command.handler.spec.ts`
- `BE/apps/artwork-service/src/application/commands/artworks/handlers/SubmitArtworkDraft.command.handler.spec.ts`
- `BE/apps/artwork-service/src/presentation/microservice/upload.microservice.controller.spec.ts`

Frontend target checks:
- `cd FE/artium-web && npx eslint src/@domains/inventory-upload src/@shared/apis/artworkApis.ts src/@shared/apis/artworkUploadApi.ts`
- `cd FE/artium-web && npx tsc --noEmit --pretty false`

Backend target checks:
- `cd BE && npx jest apps/artwork-service/src/application/commands/artworks/handlers/SaveArtworkDraft.command.handler.spec.ts apps/artwork-service/src/application/commands/artworks/handlers/SubmitArtworkDraft.command.handler.spec.ts apps/artwork-service/src/presentation/microservice/upload.microservice.controller.spec.ts --runInBand`
- `cd BE && yarn build:gateway`
- `cd BE && yarn build:artwork`

## Planning Recommendation

Plan in three waves:

1. Backend draft contract and owner-scoped command/query behavior.
2. Upload endpoint hardening and frontend draft hydration/submission mapping.
3. Contract audit documentation and targeted verification.

No new UI design contract is required because the route is already implemented and the phase changes backend/API behavior plus data mapping rather than visual layout.
