# Phase 34: Moment device upload composer - Context

**Gathered:** 2026-05-01T01:26:47Z
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 34 builds the profile-owner moment creation UI for exactly one uploaded device file: one image or one video. It replaces the current pasted URL moment composer with a device-file upload flow that uses the Phase 33 `uploadProfileMomentMedia` helper, waits for a backend-issued `mediaId`, then submits the existing moment metadata through `profileApis.createMoment`. It does not build the full moodboard composer, moodboard ordering/cover selection, or new moment social features.

</domain>

<decisions>
## Implementation Decisions

### Upload Timing And State
- **D-01:** Upload starts immediately when the user selects or drops a file, not when the user clicks publish.
- **D-02:** The composer stores the returned `mediaId` after upload succeeds and keeps Publish disabled until that `mediaId` exists.
- **D-03:** Users can edit caption, location, hashtags, and pinning while upload progress is running.
- **D-04:** Publish remains disabled during upload, failed upload, and replacement upload states.

### Composer Layout
- **D-05:** Use an Orders-style two-zone modal rather than the current dramatic dark split modal.
- **D-06:** The primary zone is upload preview/status; the secondary zone is metadata.
- **D-07:** Desktop can use a two-column layout; mobile should stack upload/status above metadata.
- **D-08:** Empty upload state is a dropzone with a file picker button, accepted type/limit copy, and exactly-one-file behavior. Drag/drop support is expected if straightforward through native browser events.

### Moment Metadata
- **D-09:** Only successful uploaded media is required before publish.
- **D-10:** Caption, location, hashtags, pinning, duration, and tagged artwork metadata are optional in Phase 34.
- **D-11:** Hashtags remain a comma-separated text input for Phase 34. Do not add a chip editor in this phase.
- **D-12:** Video duration may be sent when available, but backend validation remains authoritative.

### Failure, Retry, And Replace
- **D-13:** Upload failure preserves all metadata fields and only changes file/upload state.
- **D-14:** Failed upload state should expose retry and replace actions for the file.
- **D-15:** Replacing a successfully uploaded file preserves metadata, clears the old `mediaId`, starts upload for the replacement, and blocks Publish until the replacement upload succeeds.
- **D-16:** Closing/canceling the composer resets local composer state; do not attempt media cleanup in Phase 34 unless existing APIs already support it.

### the agent's Discretion
- Exact component boundaries, hook names, progress bar styling, file input implementation, focus management details, and local preview object URL cleanup approach are left to the planner/implementer.
- The planner may choose whether to keep the composer inside `ProfilePageView` or extract focused components/hooks, but should avoid making the already-large page harder to maintain.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope And Requirements
- `.planning/ROADMAP.md` §Phase 34 — Phase goal, PMED-05 and PMED-06, success criteria, dependency on Phase 33, and UI hint.
- `.planning/REQUIREMENTS.md` §Moment Device Upload Creation — PMED-05 and PMED-06 define the required upload composer behavior.
- `.planning/PROJECT.md` §Current Milestone / Current State / Key Decisions — device-upload requirement, no pasted-link creation UX, and Orders-aligned composer expectations.
- `.planning/STATE.md` §Decisions — active milestone decisions for exact-one moment media and Orders-inspired profile media UI.

### Upstream Upload Contract
- `.planning/phases/33-profile-community-media-upload-contract/33-CONTEXT.md` — locked upload/media rules, no pasted URL proof, and frontend upload helper direction.
- `.planning/phases/33-profile-community-media-upload-contract/33-01-SUMMARY.md` — backend upload route/entity behavior and noted schema validation skip.
- `.planning/phases/33-profile-community-media-upload-contract/33-02-SUMMARY.md` — moment creation now consumes owner-scoped pending `mediaId`.
- `FE/artium-web/src/@shared/apis/profileMediaUploadApi.ts` — `uploadProfileMomentMedia`, allowed MIME types, size/duration limits, progress options, and response shape.
- `FE/artium-web/src/@shared/apis/profileApis.ts` — `CreateMomentInput` now requires `mediaId` and posts to `/community/moments`.

### Existing Profile UI
- `FE/artium-web/src/@domains/profile/views/ProfilePage.tsx` — current owner studio tools and pasted-URL moment modal to replace.
- `FE/artium-web/src/@domains/profile/components/MomentsSection.tsx` — existing moment list/card rendering that should keep working after creation.
- `FE/artium-web/src/@domains/profile/utils/profileApiMapper.ts` — maps created `MomentApiItem` into profile moment cards/details.
- `FE/artium-web/src/@domains/profile/types/index.ts` — profile domain moment and uploaded-media types.

### Orders UI Reference
- `.planning/phases/31-orders-invoice-preview-and-extraction-ui/31-CONTEXT.md` — Orders workspace interaction quality and state handling reference.
- `FE/artium-web/src/@domains/orders/views/OrdersPageView.tsx` — restrained white-panel layout, sticky toolbar patterns, loading/error states.
- `FE/artium-web/src/@domains/orders/components/OrderListCard.tsx` — compact status chip/card language to borrow where useful.

### Shared Frontend API/Upload Patterns
- `.planning/phases/27-frontend-shared-api-definition-standardization-and-edge-case/27-CONTEXT.md` — shared API/upload transport decisions.
- `FE/artium-web/src/@shared/services/apiClient.ts` — `apiUpload`, progress, abort, timeout, auth, and structured upload errors.
- `FE/artium-web/src/@shared/apis/artworkUploadApi.ts` — client-side upload validation and typed upload helper precedent.
- `FE/artium-web/src/@shared/hooks/useArtworkUpload.ts` — reusable local upload state pattern for progress/error/reset ideas.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `uploadProfileMomentMedia` in `FE/artium-web/src/@shared/apis/profileMediaUploadApi.ts`: use for immediate upload and progress callbacks; response supplies `mediaId`, URL, type, status, duration, and thumbnail metadata.
- `profileApis.createMoment` in `FE/artium-web/src/@shared/apis/profileApis.ts`: submit created moments with `mediaId` plus optional metadata.
- `apiUpload` in `FE/artium-web/src/@shared/services/apiClient.ts`: already supports auth, progress, abort, timeout, and structured upload errors.
- `useArtworkUpload` in `FE/artium-web/src/@shared/hooks/useArtworkUpload.ts`: useful pattern for local upload progress/error state, but it is artwork-specific and should not be reused blindly if names would be misleading.
- `Dialog`, `Input`, `Switch`, `cn`, and lucide icons are already used by the current profile composer.

### Established Patterns
- Profile page currently uses local `useState` and inline submit handlers for owner studio tools; Phase 34 can either preserve that pattern or extract a focused moment composer component/hook.
- Current moment composer is a pasted-URL modal with dark gradient preview copy; this must be replaced with a device-upload dropzone and no pasted-link path.
- Orders workspace uses restrained white panels, slate typography, clear inline error panels, status chips, and disabled action states rather than decorative marketing-style surfaces.
- Frontend API modules use stable default exports and typed request/response shapes; avoid changing unrelated consumers.

### Integration Points
- Owner-only studio tools in `ProfilePageView` open the moment composer.
- Successful creation should continue prepending the mapped moment into `createdMoments` using `mapMomentToProfileMoment`.
- Moment preview should use local object URL while upload is pending/failed and backend URL metadata after upload succeeds when appropriate.
- Publish button should depend on authenticated owner, upload success, `mediaId`, and non-submitting state.

</code_context>

<specifics>
## Specific Ideas

- Empty upload state: single-file dropzone with file picker button and concise type/limit copy.
- Upload states: idle/empty, uploading with progress, uploaded with file summary/status, validation error, upload failure with retry/replace, replacement uploading, submitting.
- Preserve metadata across upload failure and file replacement to avoid losing user-written caption/location/hashtags.
- Keep hashtags as comma-separated text in Phase 34; richer chip editing can be deferred.

</specifics>

<deferred>
## Deferred Ideas

- Full moodboard multi-upload composer, cover selection, reordering, and profile polish belong to Phase 35.
- Hashtag chip editor is deferred; Phase 34 keeps comma-separated text.
- Uploaded-media cleanup/delete for abandoned pending media is not required unless an existing API already supports it.
- Heavy video processing, transcoding, or poster generation remains out of scope.

</deferred>

---

*Phase: 34-Moment device upload composer*
*Context gathered: 2026-05-01T01:26:47Z*
