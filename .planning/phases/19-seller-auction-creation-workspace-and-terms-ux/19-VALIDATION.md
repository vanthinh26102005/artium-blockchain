---
phase: 19
slug: seller-auction-creation-workspace-and-terms-ux
status: verified
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-25
audited: 2026-04-27
---

# Phase 19 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | ESLint 9 and TypeScript 5 through existing Next.js project |
| **Config file** | `FE/artium-web/package.json`, `FE/artium-web/tsconfig.json`, `FE/artium-web/eslint.config.mjs` |
| **Quick run command** | `cd FE/artium-web && npm run lint` |
| **Full suite command** | `cd FE/artium-web && npm run lint && npx tsc --noEmit` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd FE/artium-web && npm run lint`
- **After every plan wave:** Run `cd FE/artium-web && npm run lint && npx tsc --noEmit`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 19-01-01 | 01 | 1 | SAUC-04 | T-19-02 | Invalid auction economics cannot validate locally | static/lint | `cd FE/artium-web && npx eslint src/@domains/auction/validations/sellerAuctionTerms.schema.ts src/@domains/auction/utils/sellerAuctionTermsDraft.ts src/@domains/auction/utils/index.ts` | yes | COVERED |
| 19-01-02 | 01 | 1 | SAUC-04 | T-19-03 | Draft copy remains local-only and artwork-scoped | static/lint | `cd FE/artium-web && npx eslint src/@domains/auction/validations/sellerAuctionTerms.schema.ts src/@domains/auction/utils/sellerAuctionTermsDraft.ts src/@domains/auction/utils/index.ts` | yes | COVERED |
| 19-02-01 | 02 | 2 | SAUC-04, SAUC-05 | T-19-01 | Form copy does not promise unsupported starting bid or scheduled start | static/lint | `cd FE/artium-web && npx eslint src/@domains/auction/components/SellerAuctionTermsForm.tsx src/@domains/auction/components/SellerAuctionTermsPreview.tsx src/@domains/auction/components/index.ts` | yes | COVERED |
| 19-02-02 | 02 | 2 | SAUC-05 | T-19-04 | Preview shows activation/network policy before start | static/lint | `cd FE/artium-web && npx eslint src/@domains/auction/components/SellerAuctionTermsForm.tsx src/@domains/auction/components/SellerAuctionTermsPreview.tsx src/@domains/auction/components/index.ts` | yes | COVERED |
| 19-03-01 | 03 | 3 | SAUC-04, SAUC-05, SAUC-06 | T-19-05 | Start action cannot call fake or partial activation | static/typecheck | `cd FE/artium-web && npx eslint src/@domains/auction/validations/sellerAuctionTerms.schema.ts src/@domains/auction/utils/sellerAuctionTermsDraft.ts src/@domains/auction/utils/index.ts src/@domains/auction/components/SellerAuctionTermsForm.tsx src/@domains/auction/components/SellerAuctionTermsPreview.tsx src/@domains/auction/components/index.ts src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx src/pages/artist/auctions/create.tsx && npx tsc --noEmit` | yes | COVERED |

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Terms step transition | SAUC-04 | Requires seller session and candidate data | Visit `/artist/auctions/create`, select eligible artwork, click `Continue to auction terms`. |
| Draft preservation | SAUC-06 | Local storage/session behavior is browser-specific | Type terms, click `Back to artwork`, return to terms, confirm values remain. |
| Start boundary | SAUC-06 | Needs browser network observation | Click gated `Start Auction` and confirm no backend start or wallet transaction request fires. |

Manual UAT completed in `.planning/phases/19-seller-auction-creation-workspace-and-terms-ux/19-UAT.md` with 5/5 checks passed on 2026-04-27.

---

## Validation Audit 2026-04-27

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** verified 2026-04-27
