---
phase: 35
slug: moodboard-multi-upload-composer-and-profile-polish
status: complete
created: 2026-05-01
sources:
  - .planning/ROADMAP.md
  - .planning/REQUIREMENTS.md
  - .planning/phases/35-moodboard-multi-upload-composer-and-profile-polish/35-UI-SPEC.md
  - .planning/phases/33-profile-community-media-upload-contract/33-CONTEXT.md
  - .planning/phases/34-moment-device-upload-composer/34-UI-SPEC.md
---

# Phase 35 Research — Moodboard Multi-Upload Composer And Profile Polish

## Phase Goal

Let profile owners create moodboards from multiple uploaded media items, choose cover/order metadata, and verify the full profile media creation experience with Orders-aligned UI polish.

Phase 35 must satisfy PMED-07, PMED-08, PMED-09, PMED-10, and PMED-11.

## Key Findings

### Backend Contract Is Partially Ready

- `FE/artium-web/src/@shared/apis/profileMediaUploadApi.ts` already exposes `uploadProfileMoodboardMedia({ files, durationSecondsByFileName }, options)` and enforces the locked Phase 33 limits: 1 to 10 files, image MIME types, video MIME types, image size, video size, and optional duration validation.
- `FE/artium-web/src/@shared/apis/profileApis.ts` already defines `CreateMoodboardInput` with `mediaIds?: string[]` and `coverMediaId?: string`.
- `BE/apps/api-gateway/src/presentation/http/controllers/community/uploads.controller.ts` exposes `POST /community/uploads/moodboard-media` with `FilesInterceptor('files', 10)` and authenticated owner context.
- `BE/apps/api-gateway/src/presentation/http/controllers/community/moodboards.controller.ts` accepts `mediaIds` and `coverMediaId` on create and injects `userId` from the authenticated request.
- `BE/apps/community-service/src/application/commands/moodboards/handlers/CreateMoodboard.command.handler.ts` validates max 10 media IDs, duplicate IDs, owner, context, pending status, `coverMediaId` membership, ordered media persistence, and consumed pending media.
- `BE/apps/community-service/src/domain/entities/moodboard-media.entity.ts` persists ordered uploaded media rows with cover flag and thumbnail/duration metadata.

### Backend Query/DTO Gap Remains

- `BE/apps/community-service/src/domain/dtos/moodboards/moodboard.object.ts` defines `media?: MoodboardMediaObject[]`, so the public response shape already has a place for ordered uploaded media.
- `BE/apps/community-service/src/application/queries/moodboards/handlers/GetMoodboard.query.handler.ts` and `ListUserMoodboards.query.handler.ts` currently return `Moodboard` records from `IMoodboardRepository` only.
- `BE/apps/community-service/src/infrastructure/repositories/moodboard-media.repository.ts` has `findByMoodboardId`, but query handlers do not use `IMoodboardMediaRepository`.
- Frontend profile rendering cannot truthfully show uploaded moodboard galleries until list/detail responses include ordered `media` rows. Phase 35 should close this read-path gap rather than fake gallery state in the frontend.

### Frontend Creation Gap

- `FE/artium-web/src/@domains/profile/views/ProfilePage.tsx` still contains the old moodboard modal with `coverImageUrl`, a pasted URL input, and a create payload that submits `coverImageUrl`.
- Phase 34 added `MomentDeviceUploadComposer` and `useProfileMomentUpload`; these are strong analogs for modal structure, upload state, progress, retry/replace, copywriting, and `mediaId` gating.
- A Phase 35 moodboard composer should be separate from the moment composer because it needs a media queue, ordered media IDs, cover selection, item removal, and batch upload semantics.

### Frontend Rendering Gap

- `FE/artium-web/src/@shared/apis/profileApis.ts` has `MoodboardApiItem` without `media`.
- `FE/artium-web/src/@domains/profile/types/index.ts` has `ProfileMoodboard` with `coverUrl`, `secondaryCoverUrl`, and `artworkCoverUrls`, but no typed uploaded media rows.
- `FE/artium-web/src/@domains/profile/utils/profileApiMapper.ts` currently maps `coverUrl` from `coverImageUrl` and sets `artworkCoverUrls: []`.
- `FE/artium-web/src/@domains/profile/components/MoodboardsSection.tsx` uses `artworkCoverUrls`, `secondaryCoverUrl`, and `coverUrl` to render stacked covers. This can be extended to use uploaded moodboard media URLs without redesigning the card.
- `FE/artium-web/src/@domains/profile/views/ProfileMoodboardDetailPage.tsx` currently displays the profile's artworks as moodboard detail content. Phase 35 should replace or clearly separate this fallback from uploaded moodboard media rendering.

## Recommended Plan Shape

### Wave 1 — Backend Read Contract And Frontend Types

Close the query/DTO gap by returning ordered moodboard media on moodboard list/detail responses, then update frontend API types and mapper so uploaded media becomes available to the UI.

Key files:
- `BE/apps/community-service/src/application/queries/moodboards/handlers/GetMoodboard.query.handler.ts`
- `BE/apps/community-service/src/application/queries/moodboards/handlers/ListUserMoodboards.query.handler.ts`
- `BE/apps/community-service/src/app.module.ts` only if injection wiring needs adjustment
- `FE/artium-web/src/@shared/apis/profileApis.ts`
- `FE/artium-web/src/@domains/profile/types/index.ts`
- `FE/artium-web/src/@domains/profile/utils/profileApiMapper.ts`
- `FE/artium-web/src/@domains/profile/components/MoodboardsSection.tsx`

### Wave 2 — Moodboard Upload Composer

Create `useProfileMoodboardUpload` and `MoodboardDeviceUploadComposer` based on the Phase 34 composer pattern, adapted for batch upload, cover selection, item removal, ordering, and `CreateMoodboardInput`.

Key files:
- `FE/artium-web/src/@domains/profile/hooks/useProfileMoodboardUpload.ts`
- `FE/artium-web/src/@domains/profile/components/MoodboardDeviceUploadComposer.tsx`

### Wave 3 — Profile Integration And Final Verification

Replace the existing `ProfilePage.tsx` pasted-cover moodboard modal with the new composer, submit `mediaIds` and `coverMediaId`, preserve created moodboard list insertion, polish detail rendering, and run full verification.

Key files:
- `FE/artium-web/src/@domains/profile/views/ProfilePage.tsx`
- `FE/artium-web/src/@domains/profile/views/ProfileMoodboardDetailPage.tsx`
- `FE/artium-web/src/@domains/profile/components/MoodboardsSection.tsx`

## Implementation Pitfalls

- Do not let `coverImageUrl` remain in the Phase 35 creation UI or create payload.
- Do not assume backend response `media` exists until Wave 1 updates query handlers.
- Do not render frontend-only selected files as persisted gallery truth after create; use backend response mapping.
- Batch upload progress may be aggregate. If the API does not provide per-file progress, the UI should not pretend it does.
- Preserve metadata while uploads run or fail.
- Keep item order stable and submit ordered `mediaIds` matching the visible order.
- If selected cover is removed, deterministically choose the first remaining successfully uploaded item.
- Avoid adding a full drag-and-drop library. Native drag/drop or up/down icon buttons are sufficient for this phase.
- Existing full-project lint has unrelated debt; plans should include targeted lint for touched Phase 35 files and document full-project lint/build blockers if they remain unrelated.
- Next build may fail in restricted-network environments because `next/font` fetches Google Fonts. Document this as environment-related when it occurs.

## Validation Architecture

### Automated Checks

- Backend targeted tests:
  - `cd BE && yarn test --runInBand apps/community-service/src/application/commands/moodboards/handlers/CreateMoodboard.command.handler.spec.ts`
  - Add or update query-handler/repository tests if response media assembly is changed.
- Frontend structural checks:
  - `rg -n "uploadProfileMoodboardMedia|PROFILE_MAX_MOODBOARD_FILES|mediaIds|coverMediaId|Set as cover|Drag to reorder|Create moodboard" FE/artium-web/src/@domains/profile FE/artium-web/src/@shared/apis/profileApis.ts`
  - `! rg -n "Cover image URL|coverImageUrl|Paste|mediaUrl|thumbnailUrl" FE/artium-web/src/@domains/profile/views/ProfilePage.tsx FE/artium-web/src/@domains/profile/components/MoodboardDeviceUploadComposer.tsx`
- Frontend type/lint:
  - `cd FE/artium-web && npx tsc --noemit`
  - `cd FE/artium-web && npx eslint src/@domains/profile/views/ProfilePage.tsx src/@domains/profile/components/MoodboardDeviceUploadComposer.tsx src/@domains/profile/hooks/useProfileMoodboardUpload.ts src/@domains/profile/components/MoodboardsSection.tsx src/@domains/profile/views/ProfileMoodboardDetailPage.tsx src/@domains/profile/utils/profileApiMapper.ts src/@shared/apis/profileApis.ts`
- Build:
  - `cd FE/artium-web && npm run build` when Google Fonts network access is available. If blocked by `next/font`, record the exact error as environment-related.

### Manual Verification

- Open owner profile, create a moodboard with multiple uploaded files, choose a non-first cover, reorder items, remove one item, and submit.
- Confirm profile overview and moodboard tab show uploaded cover/secondary media, not pasted URL placeholders.
- Confirm moodboard detail page renders uploaded media in backend order.
- Confirm failed uploads can be retried or removed without losing metadata.

## Open Decisions Resolved By Existing Artifacts

- Device-upload only: locked by `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, Phase 33 context, and Phase 35 UI-SPEC.
- Batch limit: 10 files, locked by Phase 33 and `profileMediaUploadApi.ts`.
- Visual style: reuse Phase 34/Orders-style composer, locked by Phase 35 UI-SPEC.
- Cover source: selected uploaded media item, submitted as `coverMediaId`, locked by backend DTO and UI-SPEC.
