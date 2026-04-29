---
phase: 20
slug: auction-start-orchestration-and-seller-lifecycle-status
status: clean
depth: standard
files_reviewed: 53
findings:
  critical: 0
  warning: 0
  info: 0
  total: 0
resolved_findings: 1
reviewed_at: 2026-04-29T09:04:25Z
---

# Phase 20 - Code Review

## Scope

Reviewed source files listed in Phase 20 summary frontmatter across backend seller auction start orchestration, blockchain convergence, seller lifecycle status, seller inventory/order surfaces, and shared auction/artwork/order API clients.

## Findings

No open findings.

## Resolved During Review

| ID | Severity | File(s) | Issue | Resolution |
|----|----------|---------|-------|------------|
| CR-20-01 | warning | `StartSellerAuction.command.handler.ts`, `AttachSellerAuctionStartTx.command.handler.ts`, `GetSellerAuctionStartStatus.query.handler.ts` | Pending attempts returned `transactionRequest` whenever status was pending/retryable, even after a tx hash was attached and `walletActionRequired` was false. A direct API caller could receive duplicate wallet calldata for the same canonical attempt. | Fixed in `d999d5b2` by requiring `walletActionRequired && !txHash` before including wallet calldata; added regression coverage in start/status handler specs. |

## Verification

- `cd BE && npx jest apps/orders-service/src/application/commands/handlers/StartSellerAuction.command.handler.spec.ts apps/orders-service/src/application/queries/handlers/GetSellerAuctionStartStatus.query.handler.spec.ts --runInBand`

Result: passed, 2 suites, 6 tests.

## Residual Risk

Frontend wallet/browser flows remain manual-only by project tooling; UAT for those flows is recorded as passed in `20-UAT.md`.
