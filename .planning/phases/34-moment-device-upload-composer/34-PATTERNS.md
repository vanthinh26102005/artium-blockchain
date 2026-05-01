# Phase 34 - Pattern Map

**Phase:** 34 - Moment device upload composer  
**Date:** 2026-05-01  
**Status:** Complete

## Target Files And Closest Analogs

| Target | Role | Closest analog | Pattern to follow |
|--------|------|----------------|-------------------|
| `FE/artium-web/src/@domains/profile/hooks/useProfileMomentUpload.ts` | Upload state hook | `FE/artium-web/src/@shared/hooks/useArtworkUpload.ts` | Local upload state, abort controller, progress updates, reset/cancel actions |
| `FE/artium-web/src/@domains/profile/components/MomentDeviceUploadComposer.tsx` | Profile moment composer dialog | Current moment modal in `ProfilePage.tsx`, Orders modal/panel components | Use shared `Dialog`, `Input`, `Textarea`, `Switch`, `Button`, `Progress`; replace URL inputs with dropzone/preview/status states |
| `FE/artium-web/src/@domains/profile/views/ProfilePage.tsx` | Integration owner | Existing owner studio tools and create handlers | Keep owner entry point and created moments prepend behavior; delegate composer UI to component |
| `FE/artium-web/src/@shared/apis/profileMediaUploadApi.ts` | Upload source of truth | `FE/artium-web/src/@shared/apis/artworkUploadApi.ts` | Do not duplicate multipart code; import constants/helper and use progress options |
| `FE/artium-web/src/@shared/apis/profileApis.ts` | Create request source of truth | Phase 33 contract | Submit `CreateMomentInput` with `mediaId`, not URL fields |

## Existing Code Excerpts

### Upload State Pattern

`useArtworkUpload.ts` uses:

```ts
const abortControllerRef = useRef<AbortController | null>(null)

const reset = useCallback(() => {
  setState({
    uploading: false,
    progress: null,
    error: null,
  })
  abortControllerRef.current = null
}, [])
```

Apply the same pattern, but use profile-specific naming and add preview object URL cleanup.

### API Upload Pattern

`profileMediaUploadApi.ts` exposes:

```ts
export const uploadProfileMomentMedia = async (
  request: UploadProfileMomentMediaRequest,
  options?: ProfileMediaUploadOptions,
): Promise<ProfileMediaUploadResponse> => {
  const { file, durationSeconds } = request
  ...
  return apiUpload<ProfileMediaUploadResponse>(
    '/community/uploads/moment-media',
    formData,
    options,
  )
}
```

The composer hook should call this helper directly with `onProgress` and `signal`.

### Profile Create Pattern

`ProfilePage.tsx` currently prepends created moments:

```ts
const created = await profileApis.createMoment(payload)
setCreatedMoments((prev) => [mapMomentToProfileMoment(created), ...prev])
setMomentSuccess('Moment published.')
setIsMomentDialogOpen(false)
```

Preserve this success behavior, but make `payload` a `CreateMomentInput` containing `mediaId`.

### Dialog Accessibility Pattern

`dialog.tsx` exports `DialogTitle` and `DialogDescription`. The new composer should use them so the modal has an accessible title instead of relying only on visual headings.

## Data Flow

1. Owner clicks `New moment` in `ProfilePage.tsx`.
2. `MomentDeviceUploadComposer` opens with empty upload state and editable optional metadata.
3. User selects or drops exactly one file.
4. `useProfileMomentUpload.selectFile(file)` creates local preview URL, clears old `mediaId`, optionally extracts video duration, and calls `uploadProfileMomentMedia`.
5. Upload progress updates the composer status/progress bar.
6. Successful upload stores `ProfileMediaUploadResponse.mediaId`.
7. User clicks `Publish moment`.
8. Composer builds `CreateMomentInput` with `mediaId` and optional metadata.
9. `ProfilePage.tsx` calls `profileApis.createMoment(input)`, maps the response with `mapMomentToProfileMoment`, prepends it to `createdMoments`, closes the composer, and shows `Moment published.`

## Constraints For Executors

- Do not use a pasted URL fallback.
- Do not accept multiple files in Phase 34.
- Do not add moodboard upload behavior in Phase 34.
- Do not move backend upload helper constants into the profile domain; import them.
- Do not add a new drag/drop library.
- Keep object URL cleanup explicit.

## PATTERN MAPPING COMPLETE
