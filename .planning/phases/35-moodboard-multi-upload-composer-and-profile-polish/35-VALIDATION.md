---
phase: 35
slug: moodboard-multi-upload-composer-and-profile-polish
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-01
---

# Phase 35 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| Backend framework | NestJS + Jest |
| Frontend framework | Next.js + TypeScript + ESLint |
| Backend config | `BE/package.json` Jest config |
| Frontend config | `FE/artium-web/tsconfig.json`, `FE/artium-web/eslint.config.mjs` |
| Quick backend command | `cd BE && yarn test --runInBand apps/community-service/src/application/commands/moodboards/handlers/CreateMoodboard.command.handler.spec.ts` |
| Quick frontend command | `cd FE/artium-web && npx tsc --noemit` |
| Full frontend command | `cd FE/artium-web && npm run lint` |
| Build command | `cd FE/artium-web && npm run build` |
| Estimated runtime | 2-4 minutes, excluding network-dependent Next font fetches |

---

## Sampling Rate

- After every backend task commit: run the targeted Jest command when query/create behavior changes.
- After every frontend task commit: run `cd FE/artium-web && npx tsc --noemit`.
- After composer/profile integration: run targeted ESLint for touched Phase 35 frontend files.
- Before verification closure: run `cd FE/artium-web && npm run build` when Google Fonts network access is available; if `next/font` cannot fetch fonts, record the exact environment error.
- Max feedback latency: 180 seconds for targeted type/lint/test feedback.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 35-01-01 | 01 | 1 | PMED-09, PMED-11 | T-35-01 / T-35-02 | Moodboard list/detail responses include only persisted ordered moodboard media from backend rows | structural + test | `rg -n "IMoodboardMediaRepository|findByMoodboardId|media:" BE/apps/community-service/src/application/queries/moodboards/handlers && cd BE && yarn test --runInBand apps/community-service/src/application/commands/moodboards/handlers/CreateMoodboard.command.handler.spec.ts` | yes | pending |
| 35-01-02 | 01 | 1 | PMED-09, PMED-11 | T-35-03 | Frontend API/domain types and mapper expose uploaded media without inventing frontend-only gallery truth | structural + type | `rg -n "MoodboardApiMediaItem|media\\?:|ProfileMoodboardMedia|mediaItems|isCover|displayOrder" FE/artium-web/src/@shared/apis/profileApis.ts FE/artium-web/src/@domains/profile/types/index.ts FE/artium-web/src/@domains/profile/utils/profileApiMapper.ts && cd FE/artium-web && npx tsc --noemit` | yes | pending |
| 35-02-01 | 02 | 2 | PMED-07, PMED-08, PMED-10 | T-35-04 / T-35-05 | Upload hook owns 1-10 file queue, upload proof, cover resolution, order, retry/remove, and cleanup | structural + type | `rg -n "uploadProfileMoodboardMedia|PROFILE_MAX_MOODBOARD_FILES|coverMediaId|mediaIds|moveMedia|removeMedia|retryUpload|URL.revokeObjectURL" FE/artium-web/src/@domains/profile/hooks/useProfileMoodboardUpload.ts && cd FE/artium-web && npx tsc --noemit` | no | pending |
| 35-02-02 | 02 | 2 | PMED-07, PMED-08, PMED-10 | T-35-06 / T-35-07 | Composer renders required UI states and submits `mediaIds` plus `coverMediaId`, never pasted cover URLs | structural + type | `rg -n "New moodboard|Drop images or videos|Choose files|Uploading media|Some files need attention|Media ready|Set as cover|Drag to reorder|Create moodboard|mediaIds|coverMediaId" FE/artium-web/src/@domains/profile/components/MoodboardDeviceUploadComposer.tsx && ! rg -n "Cover image URL|coverImageUrl|Paste|Media URL" FE/artium-web/src/@domains/profile/components/MoodboardDeviceUploadComposer.tsx && cd FE/artium-web && npx tsc --noemit` | no | pending |
| 35-03-01 | 03 | 3 | PMED-07, PMED-08, PMED-10 | T-35-08 | Profile entry points use the composer and remove pasted URL moodboard creation | structural + type | `rg -n "MoodboardDeviceUploadComposer|CreateMoodboardInput|profileApis.createMoodboard\\(input\\)|mediaIds|coverMediaId" FE/artium-web/src/@domains/profile/views/ProfilePage.tsx FE/artium-web/src/@domains/profile/views/ProfileMoodboardsPage.tsx && ! rg -n "Cover image URL|coverImageUrl|Paste" FE/artium-web/src/@domains/profile/views/ProfilePage.tsx FE/artium-web/src/@domains/profile/views/ProfileMoodboardsPage.tsx && cd FE/artium-web && npx tsc --noemit` | yes | pending |
| 35-03-02 | 03 | 3 | PMED-09, PMED-10, PMED-11 | T-35-09 | Overview/list/detail render uploaded media in backend order with stable fallback behavior | structural + lint/build | `rg -n "mediaItems|displayOrder|isCover|uploaded moodboard media|video|poster" FE/artium-web/src/@domains/profile/components/MoodboardsSection.tsx FE/artium-web/src/@domains/profile/views/ProfileMoodboardDetailPage.tsx && cd FE/artium-web && npx eslint src/@domains/profile/views/ProfilePage.tsx src/@domains/profile/views/ProfileMoodboardsPage.tsx src/@domains/profile/components/MoodboardDeviceUploadComposer.tsx src/@domains/profile/hooks/useProfileMoodboardUpload.ts src/@domains/profile/components/MoodboardsSection.tsx src/@domains/profile/views/ProfileMoodboardDetailPage.tsx src/@domains/profile/utils/profileApiMapper.ts src/@shared/apis/profileApis.ts` | yes | pending |

---

## Wave 0 Requirements

Existing upload transport, backend create validation, shared UI primitives, and Phase 34 composer patterns cover the necessary infrastructure. No new test framework or third-party UI registry is required.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Multi-file picker and native drop | PMED-07, PMED-08 | Existing repo has no browser automation harness for this modal | Open owner profile, click `New moodboard`, choose/drop 2-10 files, verify upload starts immediately and metadata remains editable. |
| Reorder, remove, and cover selection | PMED-08 | Requires checking visual order and interactive controls | Reorder uploaded items, remove the selected cover, and confirm the next uploaded item becomes cover automatically. |
| Profile rendering polish | PMED-09, PMED-10 | Requires viewport inspection | Confirm overview, moodboard list, and detail render uploaded media in backend order on desktop and mobile without clipped controls or broken images. |
| Failure and retry state | PMED-10, PMED-11 | Requires simulated upload/API failure | Trigger upload failure, retry or remove failed files, and confirm successful uploaded files and metadata remain. |

---

## Validation Sign-Off

- [x] All tasks have automated or structural verify commands.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers all missing references.
- [x] No watch-mode flags.
- [x] Feedback latency target is under 180 seconds.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** approved 2026-05-01
