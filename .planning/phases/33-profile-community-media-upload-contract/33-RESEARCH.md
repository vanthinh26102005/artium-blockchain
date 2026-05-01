# Phase 33 Research: Profile Community Media Upload Contract

## RESEARCH COMPLETE

## Planning Question

What do we need to know to plan Phase 33 well?

Phase 33 must add an authenticated media upload contract for profile community content. It should let future moment and moodboard composers use device-uploaded files through backend-issued media IDs instead of trusting pasted URLs.

## Current Code Facts

### Existing Upload Transport

- Gateway upload routes currently live in `BE/apps/api-gateway/src/presentation/http/controllers/artwork/upload.controller.ts`.
- Existing upload routes use `JwtAuthGuard`, `FileInterceptor('file')`, `FilesInterceptor('files', 10)`, `@ApiConsumes('multipart/form-data')`, and `sendRpc`.
- Existing artwork upload RPC commands are `upload_artwork_image`, `upload_artwork_images`, and `upload_avatar`.
- `BE/apps/artwork-service/src/domain/services/gcs-storage.service.ts` owns current GCS upload behavior. It validates image MIME types through `ALLOWED_IMAGE_TYPES`, enforces `MAX_FILE_SIZE_MB`, uploads buffers to GCS, returns `publicId`, `url`, `secureUrl`, `path`, `format`, `size`, `bucket`, and `createdAt`, and sets metadata.
- Current `GcsStorageService.getContentType` supports image extensions only. Phase 33 needs video MIME support for `video/mp4` and `video/webm`.

### Existing Community Creation Contract

- `BE/apps/api-gateway/src/presentation/http/controllers/community/moments.controller.ts` currently accepts `mediaUrl`, `mediaType`, optional `thumbnailUrl`, optional `durationSeconds`, and derives `userId` from `req.user?.id`.
- `BE/apps/api-gateway/src/presentation/http/controllers/community/moodboards.controller.ts` currently accepts `coverImageUrl` and derives `userId` from `req.user?.id`.
- `BE/apps/community-service/src/domain/dtos/moments/create-moment.input.ts` and `BE/apps/community-service/src/domain/dtos/moodboards/create-moodboard.input.ts` mirror the URL-driven public bodies.
- `BE/apps/community-service/src/application/commands/moments/handlers/CreateMoment.command.handler.ts` persists moment URL fields directly.
- `BE/apps/community-service/src/application/commands/moodboards/handlers/CreateMoodboard.command.handler.ts` persists moodboard cover URL directly and does not persist uploaded media items.

### Existing Community Persistence

- `Moment` already has fields compatible with a consumed upload: `mediaUrl`, `mediaType`, `thumbnailUrl`, and `durationSeconds`.
- `Moodboard` only stores `coverImageUrl` and counters. It does not represent uploaded media galleries.
- `MoodboardArtwork` represents artwork references and can coexist with uploaded moodboard media, but it should not be repurposed for uploaded file records because its primary key and fields are artwork-specific.
- `CommunityServiceModule` registers TypeORM entities, repositories, CQRS handlers, and microservice controllers in arrays. New media entities and repositories should follow this pattern.

### Frontend API Pattern

- `FE/artium-web/src/@shared/services/apiClient.ts` exports `apiUpload`, progress events, abort support, timeout, auth hydration, and structured upload errors. It intentionally does not set multipart `Content-Type`.
- `FE/artium-web/src/@shared/apis/artworkUploadApi.ts` shows the local pattern for typed upload helpers, client-side file validation, `FormData`, stable default exports, and max-count validation.
- `FE/artium-web/src/@shared/apis/profileApis.ts` currently exposes `CreateMomentInput` with URL fields and `CreateMoodboardInput` with `coverImageUrl`.
- `FE/artium-web/src/@domains/profile/types/index.ts` has profile display types that future phases can extend after this upload contract exists.

## Recommended Architecture

### Backend Domain Ownership

Use `/community/uploads/...` as the public gateway boundary, backed by community-service records.

Recommended routes:

- `POST /community/uploads/moment-media`
- `POST /community/uploads/moodboard-media`

Recommended RPC commands:

- `upload_community_moment_media`
- `upload_community_moodboard_media`

Recommended response shape:

- `mediaId`
- `url`
- `secureUrl`
- `mediaType`
- `mimeType`
- `originalFilename`
- `size`
- `status`
- `durationSeconds`
- `thumbnailUrl`
- `createdAt`

The community service should persist pending media records before any moment or moodboard content is created. Future creation commands should consume `mediaId` values and verify owner, media type, pending/usable status, and allowed use.

### Storage Boundary

The cleanest implementation is a community-domain storage adapter in community-service that uses the same GCS package/config conventions as the existing artwork storage service but stores files under community paths:

- `community/{userId}/moments`
- `community/{userId}/moodboards`

This keeps pending media ownership and storage metadata in the same service that enforces community creation. It avoids a gateway-level distributed transaction between artwork-service storage and community-service records. The adapter should reuse the existing `GcsStorageService` behavior and naming, but it should not couple to artwork IDs or `artworks/{sellerId}/{artworkId}` paths.

### Media Validation

Locked rules from context:

- Moment uploads accept exactly one file.
- Moodboard upload batches accept 1 to 10 files.
- Images: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, max 10MB.
- Videos: `video/mp4`, `video/webm`, max 100MB.
- Video duration max target is 60 seconds when backend can cheaply verify it. The backend may accept optional frontend-provided `durationSeconds`, but it must treat it as metadata unless actual duration verification exists.

Implement validation in the community upload command/service, not only frontend helpers.

### Creation Proof

Moment creation should transition from arbitrary URL proof to `mediaId` proof:

- Gateway body should accept `mediaId` instead of `mediaUrl`.
- Gateway should still derive `userId` from `req.user?.id`.
- Community command should load the media row by `mediaId`, require `ownerId === userId`, require status `pending`, require allowed context `moment`, map URL/type/thumbnail/duration onto `Moment`, and mark media `consumed`.

Moodboard creation should prepare a true multi-media contract:

- Gateway body should accept `mediaIds?: string[]`, `coverMediaId?: string`, and may keep artwork reference inputs separate for future phases.
- Community command should verify each uploaded media row belongs to the current user, is pending/usable, and is allowed for moodboards.
- Add a moodboard uploaded-media join/entity rather than overloading `MoodboardArtwork`.
- `coverImageUrl` should be derived from the selected media row where possible, not trusted from request body.

### Schema Impact

This phase requires TypeORM entity changes:

- A pending media entity, e.g. `CommunityMedia`
- A moodboard uploaded media item entity, e.g. `MoodboardMedia`

The project currently uses `DynamicDatabaseModule` with `DB_SYNCHRONIZE` defaulting to true outside production. There is no generic project `data-source.ts` migration runner. Plans should include a blocking schema synchronization verification step:

- Register entities in `CommunityServiceModule`.
- Build community-service.
- In local/dev DB environments with `DB_SYNCHRONIZE=true`, boot or restart community-service so TypeORM creates the new tables.
- In production-like environments with `DB_SYNCHRONIZE=false`, flag manual migration creation/application before verification.

## Validation Architecture

Use focused backend Jest tests plus structural checks and builds.

Recommended targeted commands:

- `cd BE && npx jest apps/community-service/src/application/commands/community-media/handlers/UploadCommunityMedia.command.handler.spec.ts apps/community-service/src/application/commands/moments/handlers/CreateMoment.command.handler.spec.ts apps/community-service/src/application/commands/moodboards/handlers/CreateMoodboard.command.handler.spec.ts --runInBand`
- `cd BE && yarn build:community`
- `cd BE && yarn build:gateway`
- `cd FE/artium-web && npx tsc --noEmit`
- Structural checks with `rg` for routes, RPC commands, DTO fields, and frontend helper exports.

Test cases to include:

- Reject missing moment file.
- Reject moodboard file count above 10.
- Reject unsupported MIME type.
- Reject image over 10MB.
- Reject video over 100MB.
- Persist pending media with owner, path, URL, MIME, size, status, and original filename.
- Moment create rejects media owned by another user.
- Moment create rejects arbitrary URL-only creation.
- Moment create consumes one pending media row.
- Moodboard create rejects media owned by another user.
- Moodboard create persists ordered uploaded media items and derives cover URL from selected media.

## Planning Decomposition

Recommended plan split:

- Plan 33-01: backend upload endpoints, shared DTOs, pending media records, and storage adapter.
- Plan 33-02: moment and moodboard creation consume `mediaId` proof and moodboard uploaded media items.
- Plan 33-03: frontend profile upload helpers and typed create request shapes reuse `apiUpload` and structured upload errors.

## Risks and Constraints

- Do not accept `userId`, `mediaUrl`, or `coverImageUrl` from the frontend as proof of ownership.
- Do not store community media under artwork paths or require artwork IDs.
- Do not require a heavyweight FFmpeg/transcoding pipeline in this phase.
- Do not build the composer UI; that belongs to Phases 34 and 35.
- Keep response DTOs stable for downstream composer work.
