---
phase: 07
slug: checkout-payment-feedback-success-error-ui-states
status: in_progress
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-23
updated: 2026-04-23
---

# Phase 07 — Validation Strategy

> Executable verification matrix for plans `07-01` and `07-02`.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | other |
| **Config file** | none — frontend verification relies on existing TypeScript and production build commands |
| **Quick run command** | `cd FE/artium-web && npx tsc --noemit` |
| **Full suite command** | `cd FE/artium-web && npm run build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- After each plan-level task batch: `cd FE/artium-web && npx tsc --noemit`
- After each completed wave: `cd FE/artium-web && npm run build`
- Before `/gsd-verify-work`: both commands must be green
- Max feedback latency: 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 07-01 | 1 | UX-01 | T-07-01 | Persisted success payload is treated as display-only state and validated before hydration | typecheck | `cd FE/artium-web && npx tsc --noemit` | ✅ | ⬜ pending |
| 07-01-02 | 07-01 | 1 | UX-01 | T-07-02 | Checkout success stays inline on `/checkout/[artworkId]`, re-hydrates after refresh, and clears before leaving checkout | typecheck + build | `cd FE/artium-web && npx tsc --noemit && npm run build` | ✅ | ⬜ pending |
| 07-02-01 | 07-02 | 2 | UX-02 | T-07-03 | Card declines classify to reset-only recovery with fixed copy and no raw provider HTML injection | typecheck | `cd FE/artium-web && npx tsc --noemit` | ✅ | ⬜ pending |
| 07-02-02 | 07-02 | 2 | UX-02 | T-07-04 | Network/setup failures retry from payment step without wiping step-1 data or reusing stale payment state | typecheck + build | `cd FE/artium-web && npx tsc --noemit && npm run build` | ✅ | ⬜ pending |
| 07-02-03 | 07-02 | 2 | UX-02, UX-03 | T-07-05 | Wallet retry controls remain inline and the validation artifact names exact FE evidence commands and manual scenarios | artifact check + build | `python -c "from pathlib import Path; s=Path('.planning/phases/07-checkout-payment-feedback-success-error-ui-states/07-VALIDATION.md').read_text(); assert '07-01' in s and '07-02' in s and 'npx tsc --noemit' in s and 'npm run build' in s" && cd FE/artium-web && npx tsc --noemit && npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠ flaky*

---

## Wave 0 Requirements

Existing frontend infrastructure is sufficient. No extra Wave 0 setup is required.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Card success remains inline on checkout | UX-01 | Requires interactive Stripe completion | Complete a valid card payment and confirm the route remains `/checkout/[artworkId]` while the success screen shows order number, artwork summary, and next steps |
| Refresh restores inline success state | UX-01 | Requires browser refresh on completed route | Refresh the same checkout URL after success and confirm the success or processing screen re-hydrates from session state instead of redirecting away |
| Continue Shopping clears client success state | UX-01 | Requires navigation validation | Click Continue Shopping from the success screen and confirm `/discover` opens with no checkout-success query parameter and returning to checkout does not re-show stale success state |
| Card decline resets payment-only controls | UX-02 | Requires declined Stripe scenario | Trigger a declined card error, confirm the inline banner shows decline-specific copy plus `Try Again`, then verify card-entry controls remount while step-1 contact data remains intact |
| Network/setup failure retries from step 2 | UX-02 | Requires transient failure injection | Simulate a payment intent/setup/network failure, click `Retry`, and confirm the checkout stays on the payment step with preserved step-1 data and a fresh payment attempt |
| Wallet rejection keeps inline recovery controls | UX-02 | Requires MetaMask interaction | Reject `eth_requestAccounts` and `eth_sendTransaction`, then confirm the wallet section shows specific inline copy with `Retry Connection` or `Retry Transaction` controls |
| Validation artifact coverage is traceable | UX-03 | Requires artifact inspection | Open this file and confirm task rows reference both `07-01` and `07-02`, plus the FE typecheck and build commands verbatim |

---

## Validation Sign-Off

- [ ] All Phase 7 tasks map to a concrete automated or manual verification step
- [ ] `cd FE/artium-web && npx tsc --noemit` passes
- [ ] `cd FE/artium-web && npm run build` passes
- [ ] Manual evidence captured for success persistence, continue-shopping cleanup, decline reset, network retry, and wallet retry
- [ ] `nyquist_compliant: true` updated after execution evidence is complete

**Approval:** pending
