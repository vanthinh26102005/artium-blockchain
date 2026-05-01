# Phase 33: Profile community media upload contract - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-01
**Phase:** 33-profile-community-media-upload-contract
**Areas discussed:** Storage Boundary, Media Rules, Upload Proof, Moodboard Media Shape

---

## Storage Boundary

| Option | Description | Selected |
|--------|-------------|----------|
| Community-specific upload endpoints | Add `/community/uploads/...` contract and store files under community/profile paths; cleaner ownership and naming for profile media. | yes |
| Reuse artwork upload endpoints | Faster reuse of existing upload path, but profile media becomes coupled to artwork IDs/folders that do not naturally apply. | |
| Generic shared media endpoint | Reusable beyond community later, but broader than Phase 33 and needs more contract design. | |

**User's choice:** Community-specific upload endpoints.
**Notes:** User selected the recommended community-specific boundary. Follow-up locked public `/community/uploads/...` routes with implementation reuse of existing GCS upload capability behind the scenes.

---

## Media Rules

| Option | Description | Selected |
|--------|-------------|----------|
| Practical defaults | Images JPEG/PNG/WebP/GIF up to 10MB; videos MP4/WebM up to 100MB and 60 seconds; moodboards max 10 files per upload. | yes |
| Conservative MVP | Lower limits and narrower moodboard support. | |
| Loose creator-friendly limits | Larger videos and more files, with higher storage/bandwidth risk. | |

**User's choice:** Practical defaults.
**Notes:** Follow-up locked backend video duration validation when available or cheaply readable, without requiring heavy media processing in Phase 33.

---

## Upload Proof

| Option | Description | Selected |
|--------|-------------|----------|
| Backend-issued media id/token | Upload returns `mediaId` plus metadata; create calls reference `mediaId`; backend verifies owner/type/status. | yes |
| Stored URL metadata only | Simpler but easier to spoof if creation accepts arbitrary URLs. | |
| Hybrid allowlist | Accept URL metadata only when URL matches configured bucket/user path; less schema work but brittle. | |

**User's choice:** Backend-issued media id/token.
**Notes:** Follow-up locked persisted pending community media records with owner, type, path, status, URL metadata, and file metadata before content creation.

---

## Moodboard Media Shape

| Option | Description | Selected |
|--------|-------------|----------|
| Prepare true multi-media moodboard contract | Add/plan persistence for ordered moodboard media items now, so Phase 35 can render multiple uploaded media items without frontend-only state. | yes |
| Cover-only for Phase 33 | Upload multiple files but persist only selected cover URL on moodboard. | |
| Only upload API, no moodboard persistence changes | Return media IDs now and defer data model decisions to Phase 35. | |

**User's choice:** Prepare true multi-media moodboard contract.
**Notes:** Follow-up locked uploaded media plus existing artwork references for Phase 33. Nested moodboard references are deferred.

---

## the agent's Discretion

- Exact route names under `/community/uploads/...`.
- Exact DTO, entity/table, status enum, and RPC command names.
- Exact thumbnail/poster metadata shape.
- Exact implementation details for non-heavy video duration validation.

## Deferred Ideas

- Nested moodboard references / moodboard-inside-moodboard hierarchy.
- Full moment composer UI for Phase 34.
- Full moodboard composer UI, ordering/removal controls, and profile polish for Phase 35.
- Heavy video transcoding, compression, and poster-generation pipeline.
