---
phase: 29
slug: please-check-inventory-from-frontend-and-please-implement-de
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-30
---

# Phase 29 - Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.x for backend, ESLint/TypeScript for frontend |
| **Config file** | `BE/package.json`, `FE/artium-web/eslint.config.mjs`, `FE/artium-web/tsconfig.json` |
| **Quick run command** | `cd BE && npx jest apps/artwork-service/src/application/commands/artworks/handlers/UpdateArtwork.command.handler.spec.ts apps/artwork-service/src/application/commands/artworks/handlers/DeleteArtwork.command.handler.spec.ts apps/artwork-service/src/application/queries/artworks/handlers/ListArtworks.query.handler.spec.ts --runInBand` |
| **Full suite command** | `cd BE && npx jest apps/artwork-service/src/application/commands/artworks/handlers/UpdateArtwork.command.handler.spec.ts apps/artwork-service/src/application/commands/artworks/handlers/DeleteArtwork.command.handler.spec.ts apps/artwork-service/src/application/queries/artworks/handlers/ListArtworks.query.handler.spec.ts --runInBand && yarn build:gateway && yarn build:artwork && cd ../FE/artium-web && npx eslint src/@domains/inventory src/@domains/profile src/@domains/auction src/@shared/apis/artworkApis.ts src/@shared/apis/auctionApis.ts && npx tsc --noEmit --pretty false` |
| **Estimated runtime** | ~150 seconds |

## Sampling Rate

- **After every task commit:** Run the plan-specific command listed in `<verify>`.
- **After every plan wave:** Run the full suite command above or document unrelated pre-existing failures.
- **Before `$gsd-verify-work`:** Backend targeted Jest, backend builds, frontend lint, and frontend typecheck must be green.
- **Max feedback latency:** 180 seconds.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 29-01-01 | 01 | 1 | Phase goal BE visibility | T-29-01 | Public profile queries can filter to published active artwork | unit/build | `cd BE && npx jest apps/artwork-service/src/application/queries/artworks/handlers/ListArtworks.query.handler.spec.ts --runInBand` | existing | pending |
| 29-01-02 | 01 | 1 | Phase goal secure delete/edit | T-29-02 / T-29-03 | Update/delete require owner and respect auction lifecycle locks | unit | `cd BE && npx jest apps/artwork-service/src/application/commands/artworks/handlers/UpdateArtwork.command.handler.spec.ts apps/artwork-service/src/application/commands/artworks/handlers/DeleteArtwork.command.handler.spec.ts --runInBand` | pending | pending |
| 29-02-01 | 02 | 2 | Phase goal inventory actions | T-29-04 | Inventory actions use shared backend-backed handlers with no alert stubs | static | `cd FE/artium-web && npx eslint src/@domains/inventory src/@shared/apis/artworkApis.ts` | existing | pending |
| 29-02-02 | 02 | 2 | Phase goal profile visibility | T-29-04 | Show/hide profile calls `artworkApis.updateArtwork` and local state uses API response | static | `cd FE/artium-web && npx tsc --noEmit --pretty false` | existing | pending |
| 29-03-01 | 03 | 3 | Phase goal profile and auction handoff | T-29-05 / T-29-06 | Profile fetch filters public artwork and inventory auction action only navigates | static/build | `cd FE/artium-web && npx eslint src/@domains/profile src/@domains/auction src/@domains/inventory src/@shared/apis/auctionApis.ts` | existing | pending |

## Wave 0 Requirements

Existing Jest, Nest, TypeScript, and ESLint infrastructure covers all phase requirements. No new test framework installation is required.

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Inventory actions in browser | Phase goal | Requires authenticated seller session and seeded artwork rows | Open `/inventory`, use grid and list menus to edit, delete, toggle profile visibility, and start/resume auction handoff. Confirm no browser alert stubs appear. |
| Public profile filtering | Phase goal | Requires an owner profile with mixed published/unpublished artwork | Toggle one artwork hidden from inventory, open `/profile/{username}/artworks` in a non-owner browser session, and confirm the hidden artwork is absent. |

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers all missing references.
- [x] No watch-mode flags.
- [x] Feedback latency < 180s.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** pending
