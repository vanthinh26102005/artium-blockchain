# Phase 35 - Pattern Map

**Phase:** 35 - Moodboard multi-upload composer and profile polish
**Date:** 2026-05-01
**Status:** Complete

## Target Files And Closest Analogs

| Target | Role | Closest analog | Pattern to follow |
|--------|------|----------------|-------------------|
| `BE/apps/community-service/src/application/queries/moodboards/handlers/GetMoodboard.query.handler.ts` | Detail read contract | `CreateMoodboard.command.handler.ts` media repository usage | Inject `IMoodboardMediaRepository`, load ordered persisted media rows, and attach them to returned moodboard DTOs. |
| `BE/apps/community-service/src/application/queries/moodboards/handlers/ListUserMoodboards.query.handler.ts` | List read contract | `MoodboardMediaRepository.findByMoodboardId` | Preserve existing public/private list behavior and enrich each returned moodboard with its own ordered media rows. |
| `FE/artium-web/src/@shared/apis/profileApis.ts` | Shared API source of truth | Existing `CreateMoodboardInput` and moment media response types | Add typed moodboard media response rows; keep create payload based on `mediaIds` and `coverMediaId`. |
| `FE/artium-web/src/@domains/profile/types/index.ts` | Profile domain shape | Existing `ProfileUploadedMedia` and `ProfileMoodboard` | Add ordered moodboard media items while preserving existing cover URL fields for card compatibility. |
| `FE/artium-web/src/@domains/profile/utils/profileApiMapper.ts` | Response mapper | Existing `mapMoodboardToProfileMoodboard` | Derive cover, secondary cover, stacked URLs, and detail media from backend `media` before falling back to `coverImageUrl`. |
| `FE/artium-web/src/@domains/profile/hooks/useProfileMoodboardUpload.ts` | Upload state hook | `useProfileMomentUpload.ts` | Reuse validation, preview URL cleanup, abort/progress patterns; extend to a 1-10 file queue with order and cover selection. |
| `FE/artium-web/src/@domains/profile/components/MoodboardDeviceUploadComposer.tsx` | Composer modal | `MomentDeviceUploadComposer.tsx` and Phase 35 UI-SPEC | Use shared Dialog/Input/Textarea/Switch/Button/Progress, required copy, queue states, and `CreateMoodboardInput`. |
| `FE/artium-web/src/@domains/profile/views/ProfilePage.tsx` | Owner overview entry point | Existing Phase 34 moment composer integration | Replace inline pasted-cover modal with composer and prepend mapped created moodboards after `profileApis.createMoodboard(input)`. |
| `FE/artium-web/src/@domains/profile/views/ProfileMoodboardsPage.tsx` | Owner moodboard page entry point | Existing page-level `Create Moodboard` button | Wire the existing owner affordance to the same composer or hide it when not owner. |
| `FE/artium-web/src/@domains/profile/components/MoodboardsSection.tsx` | Overview/list cards | Existing stacked-card language | Keep the card visual language, but choose media URLs from uploaded media first and fall back safely. |
| `FE/artium-web/src/@domains/profile/views/ProfileMoodboardDetailPage.tsx` | Detail rendering | Existing detail load via `profileApis.getMoodboard` | Render uploaded media in backend order; keep artwork fallback visually separate from uploaded media. |

## Existing Code Excerpts

### Backend Create Validation Pattern

`CreateMoodboard.command.handler.ts` already validates media IDs, cover membership, ownership, upload context, pending status, display order, and consumed status. Read queries should not duplicate create validation; they should expose the persisted result.

### Upload State Pattern

`useProfileMomentUpload.ts` already uses:

```ts
const abortControllerRef = useRef<AbortController | null>(null)
const previewUrlRef = useRef<string | null>(null)
const uploadRunRef = useRef(0)
```

Apply the same cleanup discipline for each queued moodboard item. Revoke object URLs when items are removed, when the composer resets, and on unmount.

### API Upload Pattern

`profileMediaUploadApi.ts` exposes:

```ts
uploadProfileMoodboardMedia({ files, durationSecondsByFileName }, options)
```

The moodboard hook should call this helper directly. If progress is aggregate, show aggregate progress without pretending per-file network progress exists.

### Profile Create Pattern

`ProfilePage.tsx` already handles created collections by calling an API, mapping the response, prepending local state, closing the modal, and showing a success message. Preserve that integration shape while changing the input to `CreateMoodboardInput` with `mediaIds` and `coverMediaId`.

## Data Flow

1. Owner opens `New moodboard` from the overview studio tools or moodboards page.
2. `MoodboardDeviceUploadComposer` opens with empty queue and editable metadata.
3. User selects or drops 1-10 valid files.
4. `useProfileMoodboardUpload` creates preview URLs, validates files, reads optional video durations, and calls `uploadProfileMoodboardMedia`.
5. Successful upload stores backend `mediaId` values in the visible queue and defaults cover to the first uploaded item.
6. User removes, reorders, retries, or changes cover while metadata remains intact.
7. Composer builds `CreateMoodboardInput` with ordered `mediaIds`, `coverMediaId`, title, description, privacy, collaboration, and tags.
8. `ProfilePage.tsx` or `ProfileMoodboardsPage.tsx` calls `profileApis.createMoodboard(input)` and maps the backend response.
9. Backend list/detail reads return ordered `media` rows so overview, list, and detail render persisted uploaded media instead of frontend-only state.

## Constraints For Executors

- Do not leave a visible pasted cover URL path in the Phase 35 creation UI.
- Do not submit `coverImageUrl` from the composer.
- Do not treat selected local files as persisted truth after create; render backend response media.
- Do not add a new drag/drop package unless existing dependencies are already used cleanly; up/down icon buttons are acceptable.
- Do not create nested card-in-card modal layouts.
- Keep object URL cleanup explicit.
- Preserve current public/private moodboard access behavior while enriching responses with media rows.

## PATTERN MAPPING COMPLETE
