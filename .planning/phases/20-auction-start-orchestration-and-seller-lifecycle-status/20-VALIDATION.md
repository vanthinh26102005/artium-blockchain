---
phase: 20
slug: auction-start-orchestration-and-seller-lifecycle-status
status: verified
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-27
updated: 2026-04-29
---

# Phase 20 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | BE: Jest 30 on existing Nest workspaces; FE: existing ESLint 9 + TypeScript 5 static checks |
| **Config file** | `BE/package.json`, `FE/artium-web/eslint.config.mjs`, `FE/artium-web/tsconfig.json` |
| **Quick run command** | `cd BE && npx jest apps/orders-service/src/application/commands/handlers/StartSellerAuction.command.handler.spec.ts apps/orders-service/src/application/queries/handlers/GetSellerAuctionStartStatus.query.handler.spec.ts apps/orders-service/src/application/event-handlers/BlockchainEventHandler.start.spec.ts apps/orders-service/src/application/queries/handlers/GetAuctions.query.handler.spec.ts apps/artwork-service/src/application/commands/artworks/handlers/MarkArtworkInAuction.command.handler.spec.ts apps/artwork-service/src/application/queries/artworks/handlers/ListArtworks.query.handler.spec.ts --runInBand && cd ../FE/artium-web && npx tsc --noEmit` |
| **Full suite command** | `cd BE && yarn test --runInBand && cd ../FE/artium-web && npx tsc --noEmit && npm run build` |
| **Estimated runtime** | ~180 seconds |

---

## Sampling Rate

- **After every task commit:** Run the changed backend Jest specs plus `cd FE/artium-web && npx tsc --noEmit` for touched frontend files.
- **After every plan wave:** Run `cd BE && yarn test --runInBand && cd ../FE/artium-web && npx tsc --noEmit`.
- **Before `/gsd-verify-work`:** Backend convergence specs, FE build, and manual wallet lifecycle checks must be complete.
- **Max feedback latency:** 180 seconds.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------------|-----------|-------------------|-------------|--------|
| 20-01 | 01 | 1 | SAUC-07, SAUC-09 | Seller-authenticated preflight reuses one canonical attempt per seller/artwork, enforces readiness checks, and prevents duplicate start creation before wallet submission | backend unit/integration | `cd BE && npx jest apps/orders-service/src/application/commands/handlers/StartSellerAuction.command.handler.spec.ts apps/orders-service/src/application/queries/handlers/GetSellerAuctionStartStatus.query.handler.spec.ts --runInBand` | ✅ yes | ✅ green |
| 20-02 | 02 | 2 | SAUC-06, SAUC-09 | Seller create-auction UI locks unsafe edits during pending/active states, restores persisted lifecycle on refresh, and surfaces retry/failure guidance without duplicate submit | FE static/manual | `cd FE/artium-web && npx eslint src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx src/@domains/auction/components/SellerAuctionTermsForm.tsx src/@domains/auction/components/SellerAuctionTermsPreview.tsx src/@domains/auction/components/SellerAuctionStartStatusShell.tsx src/@domains/auction/hooks/useSellerAuctionStart.ts src/@domains/auction/services/auctionStartWallet.ts src/@shared/apis/auctionApis.ts && npx tsc --noEmit` | ✅ yes | ✅ green |
| 20-03 | 03 | 2 | SAUC-08 | Blockchain convergence marks the attempt active, persists authoritative order/artwork linkage, and keeps pending rows out of public auction reads until active | backend integration | `cd BE && npx jest apps/orders-service/src/application/event-handlers/BlockchainEventHandler.start.spec.ts apps/orders-service/src/application/queries/handlers/GetAuctions.query.handler.spec.ts apps/artwork-service/src/application/commands/artworks/handlers/MarkArtworkInAuction.command.handler.spec.ts --runInBand` | ✅ yes | ✅ green |
| 20-04 | 04 | 3 | SAUC-06, SAUC-08, SAUC-09 | Seller inventory/order surfaces consume backend lifecycle status and public `/auction` reflects only authoritative active state | FE + BE static/integration | `cd BE && npx jest apps/orders-service/src/application/queries/handlers/GetSellerAuctionStartStatus.query.handler.spec.ts apps/orders-service/src/application/queries/handlers/GetAuctions.query.handler.spec.ts apps/artwork-service/src/application/queries/artworks/handlers/ListArtworks.query.handler.spec.ts --runInBand && cd ../FE/artium-web && npx eslint src/@domains/inventory/views/InventoryPage.tsx src/@domains/inventory/hooks/useInventoryBootstrap.ts src/@domains/inventory/utils/inventoryApiMapper.ts src/@domains/inventory/components/InventoryArtworkGridViewItem.tsx src/@domains/inventory/components/InventoryArtworkList.tsx src/@domains/orders/utils/orderPresentation.ts src/@domains/orders/components/OrderListCard.tsx src/@domains/orders/components/OrderStatusBadge.tsx src/@domains/orders/views/OrdersPageView.tsx src/@shared/apis/artworkApis.ts src/@shared/apis/orderApis.ts && npx tsc --noEmit` | ✅ yes | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `BE/apps/orders-service/src/application/commands/handlers/StartSellerAuction.command.handler.spec.ts` - covers SAUC-07 preflight + idempotency
- [x] `BE/apps/orders-service/src/application/queries/handlers/GetSellerAuctionStartStatus.query.handler.spec.ts` - covers SAUC-09 lifecycle status reads
- [x] `BE/apps/orders-service/src/application/event-handlers/BlockchainEventHandler.start.spec.ts` - covers SAUC-08 authoritative convergence
- [x] `BE/apps/artwork-service/src/application/commands/artworks/handlers/MarkArtworkInAuction.command.handler.spec.ts` - covers artwork projection updates for SAUC-08
- [x] FE lifecycle verification approach finalized as targeted ESLint/TypeScript static checks plus browser/manual wallet lifecycle checks because `FE/artium-web/package.json` does not define a test runner.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| MetaMask handoff and pending lifecycle shell | SAUC-09 | Wallet confirmation and network prompts are browser-only | Start a valid seller auction, confirm the page stays inline, shows `Pending start`, and exposes wallet guidance / tx placeholder without a second submit path. |
| Refresh and retry safety | SAUC-06, SAUC-09 | Requires browser refresh/navigation plus persisted server state | Reload `/artist/auctions/create` during pending and after a retryable failure; confirm locked inputs remain locked while pending and retry reuses the same logical attempt. |
| Public listing stays active-only | SAUC-08 | Requires end-to-end observation across seller and public views | Submit a start request, confirm the auction does not appear on public `/auction` until backend state becomes active, then verify it appears with authoritative data. |
| Seller inventory/order lifecycle visibility | SAUC-06, SAUC-08, SAUC-09 | Needs multi-surface UX validation | After activation and after an induced failure/retry case, confirm seller inventory and any participating seller order surfaces show the correct lifecycle badge, reason code, and safe actions only. |

---

## Validation Audit 2026-04-29

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |

- State A audit of existing validation artifact completed.
- Phase 20 backend validation passed: 6 Jest suites, 14 tests after code-review regression coverage.
- Targeted FE ESLint exited 0 with 9 pre-existing warnings in inventory files and no errors.
- `cd FE/artium-web && npx tsc --noEmit` exited 0.
- No new test files were generated because all planned backend coverage exists and the FE workspace has no committed unit/e2e test runner; wallet and browser lifecycle flows remain explicit manual-only validations.

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity maintained
- [x] Wave 0 covers all missing references
- [x] No watch-mode flags
- [x] Feedback latency < 180s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-27
