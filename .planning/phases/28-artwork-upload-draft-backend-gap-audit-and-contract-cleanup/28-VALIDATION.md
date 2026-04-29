---
phase: 28
slug: artwork-upload-draft-backend-gap-audit-and-contract-cleanup
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-29
---

# Phase 28 — Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.x for backend, ESLint/TypeScript for frontend |
| **Config file** | `BE/package.json`, `FE/artium-web/eslint.config.mjs`, `FE/artium-web/tsconfig.json` |
| **Quick run command** | `cd BE && npx jest apps/artwork-service/src/application/commands/artworks/handlers/SaveArtworkDraft.command.handler.spec.ts apps/artwork-service/src/application/commands/artworks/handlers/SubmitArtworkDraft.command.handler.spec.ts --runInBand` |
| **Full suite command** | `cd BE && npx jest apps/artwork-service/src/application/commands/artworks/handlers/SaveArtworkDraft.command.handler.spec.ts apps/artwork-service/src/application/commands/artworks/handlers/SubmitArtworkDraft.command.handler.spec.ts apps/artwork-service/src/presentation/microservice/upload.microservice.controller.spec.ts --runInBand && yarn build:gateway && yarn build:artwork` |
| **Estimated runtime** | ~90 seconds |

## Sampling Rate

- **After every task commit:** Run the plan-specific Jest or frontend check listed in `<verify>`.
- **After every plan wave:** Run the full suite command above.
- **Before `$gsd-verify-work`:** Backend full suite and targeted frontend checks must be green, or unrelated pre-existing failures must be documented.
- **Max feedback latency:** 120 seconds.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 28-01-01 | 01 | 1 | Phase goal SC1-SC3 | T-28-01 / T-28-02 | Seller-owned drafts only | unit | `cd BE && npx jest apps/artwork-service/src/application/commands/artworks/handlers/SaveArtworkDraft.command.handler.spec.ts --runInBand` | pending | pending |
| 28-01-02 | 01 | 1 | Phase goal SC1-SC3 | T-28-03 | DRAFT submit transition validates payload and media | unit | `cd BE && npx jest apps/artwork-service/src/application/commands/artworks/handlers/SubmitArtworkDraft.command.handler.spec.ts --runInBand` | pending | pending |
| 28-02-01 | 02 | 2 | Phase goal SC3-SC4 | T-28-04 / T-28-05 | Uploads derive seller from auth and require owned draft | unit | `cd BE && npx jest apps/artwork-service/src/presentation/microservice/upload.microservice.controller.spec.ts --runInBand` | pending | pending |
| 28-02-02 | 02 | 2 | Phase goal SC1-SC5 | T-28-06 | Frontend loads draft and submits through explicit draft APIs | static | `cd FE/artium-web && npx eslint src/@domains/inventory-upload src/@shared/apis/artworkApis.ts src/@shared/apis/artworkUploadApi.ts` | existing | pending |
| 28-03-01 | 03 | 3 | Phase goal SC6 | — | Evidence captures backend contract and verification results | static/build | `cd BE && yarn build:gateway && yarn build:artwork` | existing | pending |

## Wave 0 Requirements

Existing Jest, Nest, TypeScript, and ESLint infrastructure covers all phase requirements.

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Browser route with the provided draft ID hydrates from backend | Phase goal SC1 | Requires authenticated local session and seeded draft row | Visit `/artworks/upload?draftArtworkId=6f2c4075-4892-4e09-ba4e-e24101b262f9`, confirm network calls hit `/artwork/drafts/6f2c4075-4892-4e09-ba4e-e24101b262f9`, and confirm unauthorized/not-found states are shown instead of silent local-only hydration. |

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers all missing references.
- [x] No watch-mode flags.
- [x] Feedback latency < 120s.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** pending
