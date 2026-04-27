---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Backend Deployment Strategy
status: executing
stopped_at: Phase 26 planned; ready to execute
last_updated: "2026-04-27T19:55:34.650Z"
last_activity: 2026-04-27
progress:
  total_phases: 28
  completed_phases: 8
  total_plans: 27
  completed_plans: 37
  percent: 100
---

## Current Position

Phase: 26 (Kubernetes Deployment Implementation & Production Platform Stack Foundation) — EXECUTING
Plan: 3 of 4
Status: Ready to execute
Last activity: 2026-04-27

## Decisions

- Zod discriminated union (card | wallet) replaces flat payment schema (Plan 6-3)
- WalletPaymentSection uses MetaMask eth_requestAccounts + eth_sendTransaction (Plan 6-3)
- Use stripe.createPaymentMethod with raw card as 'card as any' cast to work around Stripe.js type restriction on non-element raw card data
- gateway createStripeCustomer injects userId from req.user?.id so payments-service can associate the customer (Plan 6-4)
- Kept seller-auction fee and gas disclosures static and system-authored in the preview to satisfy SAUC-05 without inventing numeric fees.
- Standardized seller-auction helper copy to next phase so Start Auction stays clearly outside Phase 20 orchestration.
- Use `19-VERIFICATION.md` as the durable SAUC-04 and SAUC-05 evidence artifact tied to current FE files and approved validation commands.
- Mark only SAUC-10, SAUC-04, and SAUC-05 complete during 19.1 reconciliation; keep SAUC-06 through SAUC-09 pending for Phase 20.
- Use gateway-side readiness aggregation plus orders-service canonical attempt persistence for seller auction start preflight in Phase 20.
- Restore seller auction start state in FE from remembered artwork context plus backend lifecycle status, not local submit flags.
- Promote AuctionStarted by canonical seller attempt orderId and expose only converged active auction rows publicly.
- Gate seller-only artwork lifecycle enrichment behind an explicit query flag so private retry/failure state never leaks into public seller/profile reads.
- Continue phase numbering from 21 for v1.2 rather than resetting roadmap history.
- Backend deployment planning must reconcile code, Compose, Dockerfiles, env files, and legacy K8s artifacts before proposing topology.
- Treat current Kubernetes YAML as development-era topology evidence, not as production-ready deployment truth.
- Prefer managed stateful dependencies over in-cluster defaults unless the milestone analysis surfaces a strong reason to self-host them.
- Treat the Phase 21 artifact set (`21-01` through `21-03`) as the authoritative baseline for Phase 22 rather than re-deriving current state from legacy Kubernetes YAML.
- Keep gateway/service transport mismatches and partial isolated-database wiring as unresolved architecture inputs until Phase 22 classifies them.
- Use Phase 22 risk/disposition artifacts (`22-03`, `22-04`) as guardrails before Phase 23 chooses any Kubernetes platform topology.

## Last Session

Stopped at: Phase 26 planned; ready to execute

## Accumulated Context

### Roadmap Evolution

- Phase 11 added: Wallet checkout pay-now orchestration and success redirect
- Phase 12 added: Private order tracking and management for buyers and sellers
- Phase 13 added: Wallet payment confirmation with asynchronous retryable idempotent background processor
- Phase 14 added: Order detail copy actions, shipping logic alignment, and TypeScript stabilization
- Phase 15 added: Shared text-entry form standardization and cross-domain refactor
- Phase 16 added: Shared form field standardization and multi-domain text-entry migration
- Phase 17 added: Auction frontend integration with blockchain-backed backend flow and live auction state sync
- Phase 18 added: Seller auction access and artwork eligibility policy
- Phase 19 added: Seller auction creation workspace and terms UX
- Phase 20 added: Auction start orchestration and seller lifecycle status
- Phase 21 added: Backend runtime inventory and drift reconciliation
- Phase 22 added: Service architecture and dependency risk analysis
- Phase 23 added: Kubernetes platform topology and workload design
- Phase 24 added: Docker build, image lifecycle, and CI/CD strategy
- Phase 25 added: Production operations blueprint and final deployment artifacts
- Phase 26 added: Kubernetes deployment implementation and production platform stack foundation

**Planned Phase:** 20 (Auction start orchestration and seller lifecycle status) — 4 plans — 2026-04-27T07:41:03.407Z
**Planned Phase:** 18 (Seller auction access and artwork eligibility policy) — 3 plans — 2026-04-25T00:57:16+07:00
**Completed Phase:** 18 (Seller auction access and artwork eligibility policy) — 3 plans — 2026-04-25T01:16:30+07:00
**Planned Phase:** 19 (Seller auction creation workspace and terms UX) - 3 plans - 2026-04-25T08:21:10+07:00
**Completed Phase:** 19 (Seller auction creation workspace and terms UX) - 3 plans - 2026-04-27T09:25:50+07:00
**Planned Phase:** 19.1 (Seller auction artifact recovery and policy alignment) - 3 plans - 2026-04-27T04:00:18.456Z
**Completed Phase:** 19.1 (Seller auction artifact recovery and policy alignment) - 3 plans - 2026-04-27T04:43:24Z
**Planned Phase:** 21 (Backend runtime inventory and drift reconciliation) — roadmap approved — 2026-04-27T10:33:50.025Z
**Planned Phase:** 22 (Service architecture and dependency risk analysis) — roadmap approved — 2026-04-27T10:33:50.025Z
**Planned Phase:** 23 (Kubernetes platform topology and workload design) — roadmap approved — 2026-04-27T10:33:50.025Z
**Planned Phase:** 24 (Docker build, image lifecycle, and CI/CD strategy) — roadmap approved — 2026-04-27T10:33:50.025Z
**Planned Phase:** 25 (Production operations blueprint and final deployment artifacts) — roadmap approved — 2026-04-27T10:33:50.025Z
**Planned Phase:** 21 (Backend Runtime Inventory & Drift Reconciliation) — 3 plans verified — 2026-04-27T10:33:50.025Z
**Completed Phase:** 21 (Backend Runtime Inventory & Drift Reconciliation) — 3 plans — 2026-04-27T11:50:52Z
**Completed Phase:** 22 (Service Architecture & Dependency Risk Analysis) — 2 plans — 2026-04-27T15:03:00Z
