# Phase 34 - Research: Moment Device Upload Composer

**Phase:** 34 - Moment device upload composer  
**Date:** 2026-05-01  
**Status:** Complete

## Research Question

What do we need to know to plan a profile-owner moment composer that accepts exactly one uploaded device image or video, uploads immediately, and creates the moment from backend-issued `mediaId` proof?

## Source Context

- `.planning/phases/34-moment-device-upload-composer/34-CONTEXT.md` locks the upload timing, metadata preservation, exactly-one-file behavior, and Orders-style composer direction.
- `.planning/phases/34-moment-device-upload-composer/34-UI-SPEC.md` locks the visual and interaction contract.
- `.planning/phases/33-profile-community-media-upload-contract/33-02-SUMMARY.md` confirms backend moment creation now consumes owner-scoped pending `mediaId`.
- `.planning/phases/33-profile-community-media-upload-contract/33-03-PLAN.md` defines the frontend upload helper and create request type direction.
- `FE/artium-web/src/@shared/apis/profileMediaUploadApi.ts` already exposes `uploadProfileMomentMedia`, accepted MIME constants, size constants, upload progress support, and typed upload responses.
- `FE/artium-web/src/@shared/apis/profileApis.ts` now defines `CreateMomentInput` with required `mediaId`; `mediaUrl`, `mediaType`, and `thumbnailUrl` are no longer valid create request fields.
- `FE/artium-web/src/@domains/profile/views/ProfilePage.tsx` still contains the old URL-based modal and therefore is the main integration target.

## Current Implementation Findings

### Profile Page Composer

`ProfilePage.tsx` owns the current moment modal inline. It stores `momentForm.mediaUrl`, `mediaType`, `thumbnailUrl`, `durationSeconds`, caption, location, hashtags, and pin state. `handleCreateMoment` still validates `mediaUrl` and posts URL/type fields to `profileApis.createMoment`, which conflicts with the Phase 33 frontend type contract and Phase 34's no-pasted-link requirement.

The page already maintains:

- `isMomentDialogOpen`
- `momentSubmitting`
- `momentError`
- `momentSuccess`
- `createdMoments`

Those page-level creation states can remain, but the file upload and composer metadata state should move into a focused component/hook so the already-large page does not grow further.

### Upload Helper Contract

`uploadProfileMomentMedia` accepts `{ file, durationSeconds? }` and uses `apiUpload` with:

- `onProgress`
- `signal`
- auth by default
- typed upload errors from the shared upload client

The helper performs client-side MIME/size validation for:

- image: JPEG, PNG, WEBP, GIF, max 10 MB
- video: MP4, WEBM, max 100 MB, optional max duration 60 seconds when duration is supplied

The UI should call this helper directly and not rebuild multipart request handling inside the profile domain.

### Shared UI Primitives

Useful existing primitives:

- `Dialog`, `DialogContent`, `DialogTitle`, `DialogDescription`
- `Button`
- `Input`
- `Textarea`
- `Switch`
- `Progress`
- `cn`

`DropZone` exists but is based on `react-aria-components` and adds a heavier API surface. Phase 34 can implement native drag/drop and hidden file input inside the composer to keep behavior direct and predictable.

### Orders Visual Reference

Orders surfaces use restrained white panels, slate text, clear state rows, and compact status language. The Phase 34 composer should replace the current dark gradient preview with sibling white panels: upload/status first, metadata second.

## Recommended Implementation Approach

### Component Boundaries

Create:

- `FE/artium-web/src/@domains/profile/hooks/useProfileMomentUpload.ts`
- `FE/artium-web/src/@domains/profile/components/MomentDeviceUploadComposer.tsx`

Then update:

- `FE/artium-web/src/@domains/profile/views/ProfilePage.tsx`

This boundary keeps upload state out of `ProfilePage.tsx`, gives the composer local ownership of metadata preservation, and leaves page-level behavior focused on opening the modal, calling `profileApis.createMoment`, and prepending the mapped result.

### Upload State Model

Use an explicit local union state:

- `empty`
- `validating`
- `uploading`
- `uploaded`
- `validation-error`
- `upload-failed`
- `replacing`

Keep selected file, preview object URL, upload response, progress percentage, error text, and abort controller in the hook. A successful upload stores the full `ProfileMediaUploadResponse`, with `mediaId` as the publish gate.

### Metadata State

The composer should own metadata fields:

- caption
- location
- hashtags
- isPinned

Metadata stays editable during upload and is preserved across failed upload, retry, and replace. Closing the modal resets metadata and upload state.

### Publish Contract

The composer submits `CreateMomentInput`:

- required `mediaId`
- optional `caption`
- optional `location`
- optional `hashtags`
- optional `isPinned`
- optional `durationSeconds`

Do not include `mediaUrl`, `mediaType`, `thumbnailUrl`, or any pasted URL fallback.

### Preview Contract

Use object URLs for immediate preview. Revoke object URLs when replacing files, resetting, unmounting, or closing the dialog. For video, attempt duration extraction through `loadedmetadata`; backend validation still remains authoritative.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Object URLs leak across replace/close | Centralize URL creation and cleanup in `useProfileMomentUpload`; include cleanup in reset and `useEffect` unmount. |
| Stale upload response publishes after a later replacement | Track the current selected file and clear `uploadedMedia`/`mediaId` before every new upload. Ignore aborted uploads. |
| Upload failure loses user-written metadata | Keep metadata state in the composer, separate from upload state reset/retry. |
| UI accidentally keeps URL creation path | Remove media URL, thumbnail URL, and media type toggle controls from the moment composer JSX. Add structural grep checks. |
| Video duration validation is unreliable client-side | Treat duration extraction as best effort and send it only when available; backend remains authoritative. |
| Large `ProfilePage.tsx` becomes harder to maintain | Extract upload hook and composer component; page imports a single composer. |

## Validation Architecture

### Automated Structural Checks

Use grep-level checks to prove the URL path is gone and the upload path is present:

- `rg -n "uploadProfileMomentMedia|ProfileMediaUploadResponse|mediaId|Retry upload|Replace file|Drop one image or video" FE/artium-web/src/@domains/profile`
- `rg -n "mediaUrl|thumbnailUrl|Paste a media URL|Media URL|Thumbnail URL" FE/artium-web/src/@domains/profile/views/ProfilePage.tsx` should return no matches for the moment composer path after integration.
- `rg -n "profileApis.createMoment\\(input\\)|mediaId" FE/artium-web/src/@domains/profile/views/ProfilePage.tsx FE/artium-web/src/@domains/profile/components/MomentDeviceUploadComposer.tsx`

### Automated Type And Lint Checks

Use existing frontend commands:

- `cd FE/artium-web && npx tsc --noemit`
- `cd FE/artium-web && npm run lint`
- `cd FE/artium-web && npm run build` when environment variables and Next build prerequisites are available

### Manual UI Checks

Manual verification remains useful for drag/drop, responsive layout, native file picker behavior, and object URL video preview because there is no existing browser automation harness for this profile composer.

Manual checklist:

- Open profile owner page and click `New moment`.
- Select one valid image; observe immediate upload/progress, preview, and enabled publish after success.
- Select one valid video; observe preview, status, duration handling when available, and no manual URL fields.
- Try unsupported file type and oversized file; observe inline validation without metadata loss.
- Replace a successful upload; observe old media proof cleared and publish disabled until replacement succeeds.
- Enter caption/location/hashtags/pin during upload; observe values preserved after upload failure or replacement.

## Plan Recommendation

Two plans are enough:

1. Build the extracted upload hook and composer component.
2. Integrate the composer into `ProfilePage.tsx`, remove the URL modal path, and run verification.

This split keeps Wave 1 focused on reusable UI/state mechanics and Wave 2 focused on page integration and regression checks.

## RESEARCH COMPLETE
