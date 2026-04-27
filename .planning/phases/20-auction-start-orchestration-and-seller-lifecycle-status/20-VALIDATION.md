---
phase: 20
slug: auction-start-orchestration-and-seller-lifecycle-status
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-27
---

# Phase 20 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | BE: Jest 30 on existing Nest workspaces; FE: existing ESLint 9 + TypeScript 5 static checks |
| **Config file** | `BE/package.json`, `FE/artium-web/eslint.config.mjs`, `FE/artium-web/tsconfig.json` |
| **Quick run command** | `cd BE && npx jest apps/artwork-service/src/application/queries/artworks/handlers/ListSellerAuctionArtworkCandidates.query.handler.spec.ts apps/orders-service/src/application/queries/handlers/GetArtworkOrderLocks.query.handler.spec.ts --runInBand && cd ../FE/artium-web && npx tsc --noEmit` |
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
| 20-01 | 01 | 1 | SAUC-07, SAUC-09 | Seller-authenticated preflight reuses one canonical attempt per seller/artwork, enforces readiness checks, and prevents duplicate start creation before wallet submission | backend unit/integration | `cd BE && npx jest apps/orders-service/src/application/commands/handlers/StartSellerAuction.command.handler.spec.ts apps/orders-service/src/application/queries/handlers/GetSellerAuctionStartStatus.query.handler.spec.ts --runInBand` | ❌ W0 | ⬜ pending |
| 20-02 | 02 | 2 | SAUC-06, SAUC-09 | Seller create-auction UI locks unsafe edits during pending/active states, restores persisted lifecycle on refresh, and surfaces retry/failure guidance without duplicate submit | FE static/manual | `cd FE/artium-web && npx eslint src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx src/@domains/auction/components/SellerAuctionTermsForm.tsx src/@domains/auction/components/SellerAuctionTermsPreview.tsx src/@domains/auction/components/SellerAuctionStartStatusShell.tsx src/@domains/auction/hooks/useSellerAuctionStart.ts src/@domains/auction/services/auctionStartWallet.ts src/@shared/apis/auctionApis.ts && npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 20-03 | 03 | 2 | SAUC-08 | Blockchain convergence marks the attempt active, persists authoritative order/artwork linkage, and keeps pending rows out of public auction reads until active | backend integration | `cd BE && npx jest apps/orders-service/src/application/event-handlers/BlockchainEventHandler.start.spec.ts apps/orders-service/src/application/queries/handlers/GetAuctions.query.handler.spec.ts apps/artwork-service/src/application/commands/handlers/MarkArtworkInAuction.command.handler.spec.ts --runInBand` | ❌ W0 | ⬜ pending |
| 20-04 | 04 | 3 | SAUC-06, SAUC-08, SAUC-09 | Seller inventory/order surfaces consume backend lifecycle status and public `/auction` reflects only authoritative active state | FE + BE static/integration | `cd BE && npx jest apps/orders-service/src/application/queries/handlers/GetSellerAuctionStartStatus.query.handler.spec.ts apps/orders-service/src/application/queries/handlers/GetAuctions.query.handler.spec.ts --runInBand && cd ../FE/artium-web && npx eslint src/@domains/inventory/views/InventoryPage.tsx src/@domains/inventory/utils/inventoryApiMapper.ts src/@domains/orders/utils/orderPresentation.ts src/@domains/orders/components/OrderStatusBadge.tsx && npx tsc --noEmit` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `BE/apps/orders-service/src/application/commands/handlers/StartSellerAuction.command.handler.spec.ts` - covers SAUC-07 preflight + idempotency
- [ ] `BE/apps/orders-service/src/application/queries/handlers/GetSellerAuctionStartStatus.query.handler.spec.ts` - covers SAUC-09 lifecycle status reads
- [ ] `BE/apps/orders-service/src/application/event-handlers/BlockchainEventHandler.start.spec.ts` - covers SAUC-08 authoritative convergence
- [ ] `BE/apps/artwork-service/src/application/commands/handlers/MarkArtworkInAuction.command.handler.spec.ts` - covers artwork projection updates for SAUC-08
- [ ] FE lifecycle verification approach for pending/active/failed/retryable seller states (`Vitest`/RTL or manual-only scripts) must be finalized before execution

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| MetaMask handoff and pending lifecycle shell | SAUC-09 | Wallet confirmation and network prompts are browser-only | Start a valid seller auction, confirm the page stays inline, shows `Pending start`, and exposes wallet guidance / tx placeholder without a second submit path. |
| Refresh and retry safety | SAUC-06, SAUC-09 | Requires browser refresh/navigation plus persisted server state | Reload `/artist/auctions/create` during pending and after a retryable failure; confirm locked inputs remain locked while pending and retry reuses the same logical attempt. |
| Public listing stays active-only | SAUC-08 | Requires end-to-end observation across seller and public views | Submit a start request, confirm the auction does not appear on public `/auction` until backend state becomes active, then verify it appears with authoritative data. |
| Seller inventory/order lifecycle visibility | SAUC-06, SAUC-08, SAUC-09 | Needs multi-surface UX validation | After activation and after an induced failure/retry case, confirm seller inventory and any participating seller order surfaces show the correct lifecycle badge, reason code, and safe actions only. |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity maintained
- [x] Wave 0 covers all missing references
- [x] No watch-mode flags
- [x] Feedback latency < 180s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-27
