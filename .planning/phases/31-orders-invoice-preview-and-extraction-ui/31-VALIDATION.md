---
phase: 31
slug: orders-invoice-preview-and-extraction-ui
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-30
---

# Phase 31 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript compiler plus ESLint/structural checks; no frontend unit test runner is configured in `FE/artium-web/package.json` |
| **Config file** | `FE/artium-web/tsconfig.json`, `FE/artium-web/eslint.config.mjs` |
| **Quick run command** | `cd FE/artium-web && npx tsc --noemit` |
| **Full suite command** | `cd FE/artium-web && npx tsc --noemit && npm run lint` |
| **Estimated runtime** | ~60-180 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd FE/artium-web && npx tsc --noemit` when TypeScript files changed.
- **After every plan wave:** Run `cd FE/artium-web && npx tsc --noemit && npm run lint`.
- **Before `$gsd-verify-work`:** Full suite must be green or any unrelated pre-existing lint failures must be documented in the SUMMARY.md.
- **Max feedback latency:** 180 seconds.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 31-01-01 | 01 | 1 | OINV-05, OINV-08 | T-31-01 | Invoice document renders only backend DTO values and labels missing/redacted fields | typecheck + structural | `cd FE/artium-web && npx tsc --noemit` and `rg -n "OrderInvoiceDocument|Not provided|Redacted by access rules" FE/artium-web/src/@domains/orders` | ✅ | ⬜ pending |
| 31-01-02 | 01 | 1 | OINV-06 | T-31-02 | UI state model has checking/ready/unavailable/retry and non-disclosing authorization mapping | typecheck + structural | `rg -n "checking|ready|unavailable|retry|Invoice unavailable for this workspace" FE/artium-web/src/@domains/orders` | ✅ | ⬜ pending |
| 31-01-03 | 01 | 1 | OINV-05, OINV-07 | T-31-03 | Modal and document controls exist but print is disabled until data is ready | typecheck + structural | `rg -n "OrderInvoicePreviewModal|Print invoice|window.print|disabled=\\{.*ready" FE/artium-web/src/@domains/orders` | ✅ | ⬜ pending |
| 31-02-01 | 02 | 2 | OINV-04, OINV-06 | T-31-04 | List chip preserves scope and routes to detail with invoice focus | typecheck + structural | `rg -n "OrderInvoiceStatusChip|invoice.*1|query: \\{ scope" FE/artium-web/src/@domains/orders/components/OrderListCard.tsx` | ✅ | ⬜ pending |
| 31-02-02 | 02 | 2 | OINV-04, OINV-06, OINV-07 | T-31-05 | Detail page loads invoice through `orderApis.getOrderInvoice`, retries inline, and keeps lifecycle actions separate | typecheck + structural | `rg -n "getOrderInvoice|OrderInvoicePanel|OrderInvoicePreviewModal|handleRetryInvoice|setInvoice" FE/artium-web/src/@domains/orders/views/OrderDetailPageView.tsx FE/artium-web/src/@domains/orders/components` | ✅ | ⬜ pending |
| 31-02-03 | 02 | 2 | OINV-07, OINV-08 | T-31-06 | Print output hides app chrome and preserves backend-derived invoice values | typecheck + structural | `rg -n "@media print|order-invoice-print-root|order-invoice-screen-only|window.print\\(\\)" FE/artium-web/src` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework installation is planned for Phase 31.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Browser print/save-as-PDF layout | OINV-07 | No Playwright/visual test runner is configured in FE | Open `/orders/[orderId]?scope=buyer&invoice=1`, load an invoice, click `Print invoice`, and inspect print preview for invoice-only output and readable spacing. |
| Seller redaction presentation | OINV-06, OINV-08 | Requires role-specific backend fixture/session | Open a seller-visible order invoice and verify redacted/missing buyer fields show `Redacted by access rules` or `Not provided`, not guessed order-page values. |
| Mobile modal layout | OINV-05, OINV-07 | No responsive visual automation configured | Use browser responsive mode under 390px width and verify full-screen modal has no horizontal scroll and controls remain reachable. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 180s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-30
