---
phase: 33
slug: profile-community-media-upload-contract
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-01
---

# Phase 33 - Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | Jest, TypeScript compiler |
| Config file | `BE/package.json`, `FE/artium-web/package.json` |
| Quick run command | `cd BE && npx jest apps/community-service/src/application/commands/community-media/handlers/UploadCommunityMedia.command.handler.spec.ts apps/community-service/src/application/commands/moments/handlers/CreateMoment.command.handler.spec.ts apps/community-service/src/application/commands/moodboards/handlers/CreateMoodboard.command.handler.spec.ts --runInBand` |
| Full suite command | `cd BE && npx jest apps/community-service/src/application/commands/community-media/handlers/UploadCommunityMedia.command.handler.spec.ts apps/community-service/src/application/commands/moments/handlers/CreateMoment.command.handler.spec.ts apps/community-service/src/application/commands/moodboards/handlers/CreateMoodboard.command.handler.spec.ts --runInBand && yarn build:community && yarn build:gateway && cd ../FE/artium-web && npx tsc --noEmit` |
| Estimated runtime | ~120 seconds |

## Sampling Rate

- After every task commit: run the relevant targeted Jest command for backend tasks or `cd FE/artium-web && npx tsc --noEmit` for frontend type tasks.
- After every plan wave: run the full suite command above.
- Before `$gsd-verify-work`: full suite must be green or unrelated failures must be documented in the phase summary.
- Max feedback latency: 120 seconds.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 33-01-01 | 01 | 1 | PMED-01, PMED-02, PMED-03 | T-33-01 / T-33-02 | Upload DTOs expose media IDs and stable metadata without accepting body user IDs | structural | `rg -n "CommunityMediaUploadResponseDto|mediaId|CommunityMediaUploadContext|UploadCommunityMomentMedia" BE/libs/common/src/dtos BE/apps/api-gateway/src/presentation/http/controllers/community` | no | pending |
| 33-01-02 | 01 | 1 | PMED-01, PMED-02, PMED-03 | T-33-02 / T-33-03 | Backend validates MIME, size, count, owner path, and pending media persistence | unit | `cd BE && npx jest apps/community-service/src/application/commands/community-media/handlers/UploadCommunityMedia.command.handler.spec.ts --runInBand` | no | pending |
| 33-01-03 | 01 | 1 | PMED-01, PMED-02 | T-33-04 | New TypeORM media entities are registered before local schema synchronization | build/manual | `cd BE && yarn build:community && yarn build:gateway` | no | pending |
| 33-02-01 | 02 | 2 | PMED-04 | T-33-05 | Moment creation consumes one owner-scoped pending `mediaId` and rejects arbitrary URL proof | unit | `cd BE && npx jest apps/community-service/src/application/commands/moments/handlers/CreateMoment.command.handler.spec.ts --runInBand` | no | pending |
| 33-02-02 | 02 | 2 | PMED-02, PMED-04 | T-33-05 / T-33-06 | Moodboard creation verifies owner-scoped media IDs and persists ordered uploaded media rows | unit | `cd BE && npx jest apps/community-service/src/application/commands/moodboards/handlers/CreateMoodboard.command.handler.spec.ts --runInBand` | no | pending |
| 33-03-01 | 03 | 3 | PMED-01, PMED-02, PMED-03 | T-33-07 | Frontend profile upload helpers reuse `apiUpload` with typed validation and no multipart header override | typecheck | `cd FE/artium-web && npx tsc --noEmit` | no | pending |
| 33-03-02 | 03 | 3 | PMED-04 | T-33-07 | Frontend create types use `mediaId`/`mediaIds` and do not expose pasted URL proof for creation | structural | `rg -n "mediaId|mediaIds|uploadMomentMedia|uploadMoodboardMedia|apiUpload" FE/artium-web/src/@shared/apis FE/artium-web/src/@domains/profile/types` | no | pending |

## Wave 0 Requirements

Existing Jest, Nest build, and TypeScript compiler infrastructure covers all phase requirements.

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Production schema migration or schema push | PMED-01, PMED-02 | The repo has TypeORM entity synchronization for local/dev but no generic production `data-source.ts` migration runner. | In environments with `DB_SYNCHRONIZE=false`, create/apply migration for `community_media` and `moodboard_media` before verifying API calls. In local/dev with `DB_SYNCHRONIZE=true`, restart `community-service` and confirm the tables exist. |

## Validation Sign-Off

- [x] All tasks have automated verify or structural commands.
- [x] Sampling continuity has no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers all missing references.
- [x] No watch-mode flags.
- [x] Feedback latency target is less than 120 seconds.
- [x] `nyquist_compliant: true` set in frontmatter.

Approval: approved 2026-05-01
