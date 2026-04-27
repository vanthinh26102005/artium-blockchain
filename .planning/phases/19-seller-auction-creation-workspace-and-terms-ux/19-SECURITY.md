---
phase: 19
slug: seller-auction-creation-workspace-and-terms-ux
status: verified
threats_open: 0
asvs_level: 1
created: 2026-04-27
---

# Phase 19 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| browser form to local validation | Seller-controlled terms are validated locally before preview or handoff state changes. | ETH amount strings, duration values, seller-entered disclosure text |
| browser localStorage | Draft values are stored per artwork on the seller's device and can be stale or tampered with. | Reserve policy, reserve price, increment, duration, disclosure text |
| terms state to seller preview | User-entered terms become buyer-facing preview copy before activation exists. | Preview text for reserve, timing, shipping, payment notes |
| backend candidates to two-step UI | The route renders server-owned eligible and blocked artwork candidates and only allows selection from the eligible list. | Artwork candidate metadata, eligibility state, recovery actions |
| seller click to start handoff | User intent to continue from terms must not trigger wallet, contract, or backend start side effects in Phase 19. | Local validation state only |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-19-01 | Tampering | `validateSellerAuctionTerms` | mitigate | Validation remains frontend UX-only; terms schema contains only local validation fields and the workspace `handleStartAttempt` only validates local state. | closed |
| T-19-02 | Information Disclosure | local draft storage | mitigate | Draft storage guards and shape checks only persist Phase 19 terms fields in browser `localStorage`, with no wallet, auth, buyer, or order data. | closed |
| T-19-03 | Repudiation | local draft wording | mitigate | Workspace success copy explicitly says `Draft saved on this device.` and does not imply server persistence. | closed |
| T-19-04 | Spoofing | `SellerAuctionTermsPreview` | mitigate | Preview copy says `Starts when activated` and checklist copy says `Activation handled in next step`, avoiding live/confirmed claims. | closed |
| T-19-05 | Tampering | `SellerAuctionTermsForm` actions | mitigate | Terms form is callback-driven via props and contains no network, wallet, or contract execution logic. | closed |
| T-19-06 | Information Disclosure | disclosure preview | accept | Shipping and payment notes are intentionally shown in the preview; no private buyer or wallet data is rendered in Phase 19. | closed |
| T-19-07 | Spoofing | frontend seller gate | accept | Frontend seller gating is guidance only; the route still loads seller artwork candidates from the backend endpoint rather than trusting client-supplied eligibility. | closed |
| T-19-08 | Tampering | selected artwork and terms state | mitigate | Selected artwork is derived from `eligible.find(...)` and terms/drafts are keyed by the chosen eligible artwork ID only. | closed |
| T-19-09 | Elevation of Privilege | start action | mitigate | The workspace start attempt performs local validation only; no auction start API, wallet request, or transaction call is wired in Phase 19 files. | closed |
| T-19-10 | Information Disclosure | local draft and preview | mitigate | The terms schema and draft model are limited to numeric auction terms and seller-entered disclosures, excluding secrets and third-party credentials. | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-19-01 | T-19-06 | Buyer-facing shipping and payment notes are an intentional product disclosure in the preview, and Phase 19 does not expose non-seller private data. | Copilot security audit | 2026-04-27 |
| AR-19-02 | T-19-07 | The frontend seller gate is UX guidance, not authorization; backend candidate retrieval remains authoritative, so the residual UI spoofing risk is accepted for this phase. | Copilot security audit | 2026-04-27 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-04-27 | 10 | 10 | 0 | Copilot |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-04-27
