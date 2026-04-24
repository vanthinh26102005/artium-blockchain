---
phase: 18
slug: seller-auction-access-and-artwork-eligibility-policy
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-25
---

# Phase 18 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30 for backend; ESLint/Next static checks for frontend |
| **Config file** | `BE/package.json` Jest config; `FE/artium-web/package.json` lint script |
| **Quick run command** | `cd BE && yarn test --runInBand` |
| **Full suite command** | `cd BE && yarn build:artwork && yarn build:orders && yarn build:gateway && cd ../FE/artium-web && npm run lint` |
| **Estimated runtime** | ~90 seconds |

---

## Sampling Rate

- **After every task commit:** Run the task-specific command from the PLAN.md.
- **After every plan wave:** Run `cd BE && yarn build:artwork && yarn build:orders && yarn build:gateway && cd ../FE/artium-web && npm run lint`.
- **Before `$gsd-verify-work`:** Backend builds and frontend lint must be green, or any environment-related failures must be documented in SUMMARY.md.
- **Max feedback latency:** 120 seconds.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 18-01-01 | 01 | 1 | SAUC-02, SAUC-03 | T-18-02 | Eligibility reasons are generated server-side from owned artworks. | unit/build | `cd BE && yarn test --runInBand && yarn build:artwork` | W0 | pending |
| 18-02-01 | 02 | 2 | SAUC-01, SAUC-02 | T-18-01 / T-18-03 | Gateway derives seller from JWT and does not trust client `sellerId`. | build/static | `cd BE && yarn build:orders && yarn build:gateway` | W0 | pending |
| 18-03-01 | 03 | 3 | SAUC-01, SAUC-03 | T-18-04 | Frontend renders backend eligibility reasons without duplicating rules. | lint/manual | `cd FE/artium-web && npm run lint` | W0 | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- `BE/apps/artwork-service/src/application/queries/artworks/handlers/ListSellerAuctionArtworkCandidates.query.handler.spec.ts` - table tests for intrinsic eligibility reason codes.
- `BE/apps/orders-service/src/application/queries/handlers/GetArtworkOrderLocks.query.handler.spec.ts` - tests active and terminal order status classification.
- No frontend test framework is configured; use lint plus manual route-state checks for Phase 18 UI.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Unauthenticated route behavior | SAUC-01 | Requires browser auth state and routing. | Open `/artist/auctions/create` without auth and confirm login redirect or auth-required copy. |
| Non-seller route behavior | SAUC-01 | Requires role-specific auth payload. | Log in with a user whose `roles` lacks `seller`; confirm `Seller profile required` CTA and no picker data. |
| Seller candidate response grouping | SAUC-02, SAUC-03 | Requires seeded artwork/order data. | Call `GET /auctions/seller/artwork-candidates` as seller and confirm `eligible` and `blocked` contain only seller-owned records. |
| No client sellerId trust | SAUC-01, SAUC-02 | Security behavior spans browser and gateway. | Confirm frontend request URL has no `sellerId` query and gateway derives seller from `req.user.id`. |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers all missing automated references.
- [x] No watch-mode flags.
- [x] Feedback latency target is under 120 seconds.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** approved 2026-04-25
