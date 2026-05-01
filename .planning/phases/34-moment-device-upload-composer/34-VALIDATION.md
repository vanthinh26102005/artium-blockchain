---
phase: 34
slug: moment-device-upload-composer
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-01
---

# Phase 34 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | TypeScript + ESLint + Next build |
| Config file | `FE/artium-web/tsconfig.json`, `FE/artium-web/eslint.config.mjs` |
| Quick run command | `cd FE/artium-web && npx tsc --noemit` |
| Full suite command | `cd FE/artium-web && npm run lint` |
| Estimated runtime | ~90 seconds |

---

## Sampling Rate

- After every task commit: run `cd FE/artium-web && npx tsc --noemit` when the task changes TypeScript/TSX.
- After every plan wave: run `cd FE/artium-web && npm run lint`.
- Before `$gsd-verify-work`: run `cd FE/artium-web && npm run build` when local environment variables allow a Next production build.
- Max feedback latency: 120 seconds for type/lint feedback.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 34-01-01 | 01 | 1 | PMED-05, PMED-06 | T-34-01 / T-34-02 | Upload state stores backend `mediaId`, supports abort/retry/replace, and does not publish URL proof | structural + type | `rg -n "uploadProfileMomentMedia|AbortController|mediaId|retryUpload|replace|URL.revokeObjectURL" FE/artium-web/src/@domains/profile/hooks/useProfileMomentUpload.ts && cd FE/artium-web && npx tsc --noemit` | no | pending |
| 34-01-02 | 01 | 1 | PMED-05, PMED-06 | T-34-03 / T-34-04 | Composer exposes exactly-one-file UI, status states, and mediaId-gated publish | structural + type | `rg -n "Drop one image or video|Choose file|Uploading media|Upload complete|Retry upload|Replace file|Publish moment|mediaId" FE/artium-web/src/@domains/profile/components/MomentDeviceUploadComposer.tsx && cd FE/artium-web && npx tsc --noemit` | no | pending |
| 34-02-01 | 02 | 2 | PMED-05, PMED-06 | T-34-05 / T-34-06 | Profile page uses `CreateMomentInput` and no longer submits media URL fields | structural + type | `rg -n "MomentDeviceUploadComposer|CreateMomentInput|profileApis.createMoment\\(input\\)" FE/artium-web/src/@domains/profile/views/ProfilePage.tsx && ! rg -n "mediaUrl|thumbnailUrl|Paste a media URL|Media URL|Thumbnail URL" FE/artium-web/src/@domains/profile/views/ProfilePage.tsx && cd FE/artium-web && npx tsc --noemit` | yes | pending |
| 34-02-02 | 02 | 2 | PMED-05, PMED-06 | T-34-07 | Final frontend verification catches integration regressions | lint/build | `cd FE/artium-web && npm run lint` | yes | pending |

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test framework installation is required.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Native file picker and drag/drop | PMED-05, PMED-06 | Existing repo has no browser automation harness for this modal | Open owner profile, click `New moment`, choose/drop one valid file, verify upload starts immediately. |
| Responsive composer layout | PMED-05, PMED-06 | Requires viewport inspection | Check desktop two-zone layout and mobile stacked layout; confirm no horizontal scroll or clipped buttons. |
| Failed/replaced upload metadata preservation | PMED-06 | Requires simulated network/server failure or manual interruption | Enter caption/location/hashtags, trigger upload failure or replace file, verify metadata remains. |

---

## Validation Sign-Off

- [x] All tasks have automated or structural verify commands.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers all missing references.
- [x] No watch-mode flags.
- [x] Feedback latency target is under 120 seconds.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** approved 2026-05-01
