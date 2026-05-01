# Phase 33: Profile community media upload contract - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 33 defines and implements the authenticated upload contract that lets profile community content use device-uploaded media instead of pasted URLs. It covers backend upload endpoints, ownership proof, stored media metadata, frontend API upload helpers, and data-model preparation needed by Phase 34 moment creation and Phase 35 moodboard creation. It does not build the full moment or moodboard composer UI.

</domain>

<decisions>
## Implementation Decisions

### Storage Boundary
- **D-01:** Public upload routes should be community-specific, exposed as `/community/uploads/...` rather than reusing artwork-facing upload routes.
- **D-02:** Uploaded files should be stored under community-oriented paths such as `community/{userId}/moments` and `community/{userId}/moodboards`.
- **D-03:** The public contract belongs to the community/profile media domain, but Phase 33 may reuse the existing GCS upload infrastructure behind the gateway instead of duplicating storage logic.
- **D-04:** Do not couple profile media uploads to artwork IDs or artwork folder semantics.

### Media Rules
- **D-05:** Moment uploads accept exactly one file: either one image or one video.
- **D-06:** Moodboard upload batches accept up to 10 files.
- **D-07:** Supported image MIME types are `image/jpeg`, `image/png`, `image/webp`, and `image/gif`, with a maximum image size of 10MB.
- **D-08:** Supported video MIME types are `video/mp4` and `video/webm`, with a maximum video size of 100MB and target maximum duration of 60 seconds.
- **D-09:** Backend validates video duration when duration metadata is available or cheaply readable. Phase 33 should not require a heavy transcoding or FFmpeg pipeline just to enforce duration.
- **D-10:** Frontend may send duration metadata, but backend remains the authority where it can verify or reject.

### Upload Proof and Ownership
- **D-11:** Upload returns a backend-issued `mediaId` or equivalent token/id, not only URL metadata.
- **D-12:** Moment and moodboard creation should consume `mediaId` values so the backend can verify owner, media type, status, and allowed use before creating content.
- **D-13:** Uploaded media should be persisted as pending community media records before content creation.
- **D-14:** Pending media records should include owner, media type, storage path, URL/secure URL, original filename, file size, status, and useful metadata such as duration or thumbnail/poster when available.
- **D-15:** Create APIs must not trust arbitrary external URLs as proof of uploaded profile media.

### Moodboard Media Shape
- **D-16:** Phase 33 should prepare a true multi-media moodboard contract rather than only storing a cover image URL.
- **D-17:** Moodboard items should support uploaded media plus existing artwork references.
- **D-18:** Nested moodboard references are deferred; do not add moodboard-inside-moodboard hierarchy in Phase 33.
- **D-19:** If backend persistence cannot yet represent uploaded moodboard media cleanly, Phase 33 should close that contract gap rather than pushing gallery state into frontend-only data.

### the agent's Discretion
- Exact route names under `/community/uploads/...`, DTO class names, entity/table names, status enum labels, and service-to-service command names are left to the planner/implementer.
- Exact thumbnail/poster metadata fields are flexible, provided response DTOs remain stable enough for Phase 34 and Phase 35.
- Exact validation implementation is flexible as long as it enforces the locked file count/type/size rules and does not require a heavyweight media-processing pipeline for Phase 33.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope and Requirements
- `.planning/ROADMAP.md` §Phase 33 — Phase goal, requirements PMED-01 through PMED-04, success criteria, dependency note, and cross-cutting constraints.
- `.planning/REQUIREMENTS.md` §v1.4 Requirements — PMED-01 through PMED-04 define upload backend requirements; PMED-05 through PMED-11 define downstream consumers of this contract.
- `.planning/PROJECT.md` §Current Milestone / Current State / Key Decisions — Milestone intent, device-upload requirement, no pasted-link creation UX, and Orders-aligned downstream UI expectations.
- `.planning/STATE.md` §Decisions — Active milestone decisions for device uploads, exact-one moment media, multi-media moodboards, and Orders-inspired UI.

### Prior Decisions
- `.planning/phases/27-frontend-shared-api-definition-standardization-and-edge-case/27-CONTEXT.md` — Shared frontend API and upload transport rules; Phase 33 frontend helpers should reuse `apiUpload`, structured upload errors, auth handling, and stable API module exports.
- `.planning/phases/31-orders-invoice-preview-and-extraction-ui/31-CONTEXT.md` — Orders workspace state and UI quality reference for later profile composer surfaces; Phase 33 only needs the contract foundation.

### Backend Upload and Community Code
- `BE/apps/api-gateway/src/presentation/http/controllers/artwork/upload.controller.ts` — Existing authenticated gateway upload pattern, file interceptors, and RPC delegation.
- `BE/apps/artwork-service/src/presentation/http/controllers/upload.controller.ts` — Existing artwork/avatar upload controller and GCS response shape.
- `BE/apps/artwork-service/src/domain/services/gcs-storage.service.ts` — Existing GCS storage abstraction, file validation, public URL generation, and metadata support.
- `BE/apps/api-gateway/src/presentation/http/controllers/community/moments.controller.ts` — Current moment create endpoint accepts URL fields; Phase 33 must prepare creation to consume uploaded media proof.
- `BE/apps/api-gateway/src/presentation/http/controllers/community/moodboards.controller.ts` — Current moodboard create endpoint accepts `coverImageUrl`; Phase 33 must prepare a multi-media contract.
- `BE/apps/community-service/src/domain/entities/moments.entity.ts` — Existing moment persistence fields for media URL/type/thumbnail/duration.
- `BE/apps/community-service/src/domain/entities/moodboards.entity.ts` — Existing moodboard persistence fields, currently centered on cover image URL.
- `BE/apps/community-service/src/domain/entities/moodboard_artworks.entity.ts` — Existing artwork-reference join model that should coexist with uploaded moodboard media items.

### Frontend API Code
- `FE/artium-web/src/@shared/services/apiClient.ts` — Shared `apiUpload`, auth, progress, abort, timeout, and structured upload error behavior.
- `FE/artium-web/src/@shared/apis/artworkUploadApi.ts` — Existing typed upload API module pattern and client-side validation precedent.
- `FE/artium-web/src/@shared/apis/profileApis.ts` — Current profile/community API module where typed profile media upload helpers should integrate or be referenced.
- `FE/artium-web/src/@domains/profile/types/index.ts` — Current profile moment and moodboard media types that downstream UI phases will consume.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apiUpload` in `FE/artium-web/src/@shared/services/apiClient.ts`: reusable frontend multipart transport with auth, progress, abort, timeout, and JSON error extraction.
- `artworkUploadApi` in `FE/artium-web/src/@shared/apis/artworkUploadApi.ts`: useful pattern for typed upload helpers, file validation, and stable default export.
- `UploadController` in `BE/apps/api-gateway/src/presentation/http/controllers/artwork/upload.controller.ts`: existing gateway file-interceptor and RPC delegation pattern.
- `GcsStorageService` in `BE/apps/artwork-service/src/domain/services/gcs-storage.service.ts`: reusable GCS upload abstraction with metadata and public URL generation.
- `Moment` entity: already has media URL/type/thumbnail/duration fields compatible with uploaded moment media consumption.
- `MoodboardArtwork` entity: existing artifact for moodboard artwork references; useful for mixed moodboard item thinking, but not sufficient for uploaded media galleries by itself.

### Established Patterns
- Backend follows gateway-to-service RPC through `sendRpc` and NestJS TCP clients; public HTTP routes should remain in the API gateway.
- Backend services use CQRS, service-local DTOs/entities, and repository-backed persistence.
- Frontend API modules preserve stable default exports and consume shared helpers from `apiClient.ts`.
- Existing upload endpoints use `FormData` and must not set `Content-Type` manually.
- Existing artwork/avatar upload endpoints are image-oriented and should not define community media semantics directly.

### Integration Points
- Add new API gateway routes under `/community/uploads/...` with `JwtAuthGuard`, `FileInterceptor` / `FilesInterceptor`, and DTO-backed Swagger docs.
- Add backend storage/repository support for pending community media records, either by extending community-service persistence and reusing existing GCS storage infrastructure or by adding a service command that delegates storage while preserving community ownership.
- Update/create frontend profile upload API helpers that call `/community/uploads/...` through `apiUpload` and return typed community media upload DTOs.
- Update moment and moodboard create DTOs/API contracts to consume `mediaId` values after Phase 33 establishes pending media records.

</code_context>

<specifics>
## Specific Ideas

- Public routes should read like community/profile capabilities, e.g. `/community/uploads/moment-media` and `/community/uploads/moodboard-media`, though final naming is left to planning.
- Upload response should include `mediaId`, `url`, `secureUrl`, `mediaType`, `mimeType`, `originalFilename`, `size`, `status`, and optional `durationSeconds` / `thumbnailUrl`.
- Pending media status should support enough lifecycle to distinguish uploaded-but-unused, consumed/attached, and invalid/deleted/expired media.
- Moodboard uploaded media should be ordered and cover-selectable by downstream phases.

</specifics>

<deferred>
## Deferred Ideas

- Nested moodboard references are deferred; Phase 33 should not implement moodboard-inside-moodboard hierarchy.
- Full moment composer UI is Phase 34.
- Full moodboard composer UI, ordering/removal controls, and profile rendering polish are Phase 35.
- Heavy video transcoding, compression, and full poster generation pipelines are not required for Phase 33.

</deferred>

---

*Phase: 33-Profile community media upload contract*
*Context gathered: 2026-05-01*
