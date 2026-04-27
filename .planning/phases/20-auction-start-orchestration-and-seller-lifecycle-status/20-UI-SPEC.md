---
phase: 20
slug: auction-start-orchestration-and-seller-lifecycle-status
status: approved
shadcn_initialized: partial-local
preset: radix-lyra / Artium seller workspace
created: 2026-04-27
reviewed_at: 2026-04-27T00:00:00Z
---

# Phase 20 — UI Design Contract

> Visual and interaction contract for auction start orchestration and seller lifecycle status. This phase upgrades the existing seller auction workspace from local-only validation into a persisted wallet/backend/on-chain start flow with authoritative seller-visible pending, active, failed, and retryable states.

**Sources used:** `STATE.md`, `ROADMAP.md`, `REQUIREMENTS.md`, `v1.1-MILESTONE-AUDIT.md`, `19.1-UI-SPEC.md`, `19.1-VERIFICATION.md`, `19-VERIFICATION.md`, `components.json`, `tailwind.config.js`, `src/styles/globals.css`, current seller auction workspace code, existing auction/payment status components.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn-compatible local primitives in `@shared/components/ui` |
| Preset | `radix-lyra` with existing Artium seller workspace styling |
| Component library | Radix UI primitives via local shared components |
| Icon library | `lucide-react` for seller-auction surfaces |
| Font | `ABC Monument Grotesk` for seller workspace chrome; preserve existing `Inter` only inside reused legacy components |

### Required Existing Patterns

- Keep the existing seller route: `/artist/auctions/create` inside `SidebarLayout`.
- Keep the current two-step seller workspace: artwork selection first, then terms + preview.
- Preserve the selected artwork summary row and the desktop split layout of editable form plus sticky preview/status rail.
- Preserve the current white/off-white seller auction workspace, blue accent, rounded panels, and pill-button language from Phase 19.1.
- Keep the preview rail visible whenever the terms/start step is visible; lifecycle feedback must live beside or above it, not behind a modal-only or toast-only flow.
- Do not introduce a new wizard step or a separate activation route for the first seller-facing status experience.
- Do not show a public auction card optimistically before backend state marks the auction active.

---

## Phase-Specific UI Delta

| Surface | Contract |
|---------|----------|
| `/artist/auctions/create` | Remains the entry point and source of truth for seller auction start orchestration. |
| Start CTA area | `Start Auction` becomes a real submit trigger after local validation passes; replace the current next-phase helper with lifecycle status feedback. |
| Terms form | Editable only before submission. Lock reserve, increment, duration, artwork selection, and draft save actions while a start is pending or after the auction becomes active. |
| Preview rail | Remains visible and becomes the frozen terms snapshot during pending, failed, retryable, and active states. |
| Lifecycle status shell | Add a persistent inline status shell above the form/preview pair with one of four top-level states: `Pending start`, `Auction active`, `Start failed`, `Retry available`. |
| Seller inventory / seller order views | Show authoritative auction lifecycle badges after backend persistence; reflect pending/retryable/active state from server data, never from frontend-only mutation. |
| Public `/auction` listing | Show the auction only after authoritative active persistence succeeds. Pending or failed starts must not appear publicly. |

### Component Inventory

- Start orchestration status shell
- Pending progress checklist
- Transaction details row (`txHash`, explorer link, copy action)
- Failure / retry callout with reason code
- Active success summary card
- Seller lifecycle badge for inventory/order surfaces

The inline lifecycle status shell is the primary visual anchor on `/artist/auctions/create` once submission begins, ahead of the locked form and preview rail.

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Inline icon gaps, status-dot spacing |
| sm | 8px | Compact helper spacing, badge padding |
| md | 16px | Default field and card spacing |
| lg | 24px | Card padding, mobile section spacing |
| xl | 32px | Desktop column gaps, status shell padding |
| 2xl | 48px | Major section breaks |
| 3xl | 64px | Page-level spacing |

Exceptions: existing shared button heights `36px`, `48px`, and `56px` may remain; existing seller-workspace radii `28px`, `32px`, and `40px` may remain; copy/explorer actions inside the lifecycle shell must keep a minimum 44px touch target.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 16px | 400 | 24px |
| Label | 11px | 700 | 16px |
| Heading | 24px | 700 | 30px |
| Display | 48px | 700 | 52px |

Rules:
- Keep uppercase tracked labels for operational metadata and status pills.
- Keep seller-workspace headings bold and high-contrast.
- Keep helper, reason-code guidance, and tx metadata on the body token instead of adding a fifth size.
- Do not introduce new font families for this phase.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#FDFDFD` | Page background, large workspace surfaces |
| Secondary (30%) | `#FFFFFF` | Cards, form panels, preview panel, lifecycle shell |
| Accent (10%) | `#2351FC` | Primary CTA before submission, active step state, selected artwork ring, focused fields, progress/checklist highlights |
| Destructive | `#FF4337` | Failed start alerts, blocking validation, non-retryable errors |

Accent reserved for: primary `Start Auction` CTA before submission, active step state, selected artwork ring, focused inputs, progress/checklist indicators, reason-code section headings, and copy/explorer secondary actions only.

Support colors:
- Pending surface: `#FFF7E6`
- Pending text: `#7A4B00`
- Success surface: `#ECFDF3`
- Success text: `#027A48`
- Failure surface: `#FFF5F4`
- Text primary: `#191414`
- Text muted: `#808080`
- Border: `#E5E5E5`
- Disabled surface: `#F5F5F5`

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | `Start Auction` |
| Pending heading | `Auction start in progress` |
| Pending body | `We’re validating seller readiness, waiting for wallet confirmation, and syncing auction state. Do not submit again.` |
| Active heading | `Auction is live` |
| Active body | `Your auction is active and now reflects authoritative backend and blockchain state.` |
| Failed heading | `Auction start failed` |
| Failed body | `We could not start this auction. Review the reason code and next step before trying again.` |
| Retryable heading | `Retry available` |
| Retryable CTA | `Retry Start Auction` |
| Active primary CTA | `View Auction` |
| Empty state heading | `No auction-ready artworks` |
| Empty state body | `Your artworks need to be active, published, single-edition, and complete before they can enter an auction.` |
| Error state | `We could not load auction eligibility. Try again or return to inventory.` |
| Tx hash label | `Transaction hash` |
| Reason code label | `Reason code` |
| Destructive confirmation | None in this phase |

Required policy copy:
- `Reserve, increment, and duration cannot be edited after activation.`
- `Marketplace seller fees follow current policy.`
- `Network gas is shown in MetaMask during activation.`
- `Sepolia is a test network. Confirm wallet and network details before activation.`
- `Shipping and payment disclosures are shown to buyers before bidding.`
- `Do not submit again while auction start is in progress.`

Status labels:
- Pending: `Pending start`
- Active: `Auction active`
- Failed: `Start failed`
- Retryable: `Retry available`

---

## Lifecycle State Contract

| State | Tone | Required contents | Allowed actions |
|-------|------|-------------------|-----------------|
| Pending start | Warning / neutral | Status pill, seller-facing progress checklist, last-updated timestamp, selected artwork title, frozen terms snapshot, tx hash row once available | `Open MetaMask` only when wallet confirmation is awaiting user action; `View transaction` only after tx hash exists; no second submit |
| Auction active | Success | Success summary, auction ID/on-chain reference when available, tx hash, start/end timing, immutable-economics reminder | `View Auction`, `View transaction`, `Copy transaction hash`, `Back to inventory` |
| Start failed | Destructive | Friendly failure summary, visible reason code, last attempted time, tx hash if one exists, recovery guidance | `Back to terms` only when seller must edit or fix readiness before another attempt |
| Retry available | Warning + destructive detail | Same as failed plus explicit idempotency-safe retry note and retained submitted snapshot | `Retry Start Auction` as primary, `Back to terms` as secondary only if the failure requires seller edits |

Rules:
- Show exactly one top-level lifecycle state at a time.
- Persist lifecycle state across refresh and navigation from backend data.
- Never collapse tx hash, reason code, or next-step guidance behind an accordion.
- Use `aria-live="polite"` for pending progress updates and `role="alert"` for failed / retryable callouts.

---

## Interaction Contract

| Interaction | Contract |
|-------------|----------|
| Terms validation gate | Keep current local validation first. If invalid, stay on the terms step and show the existing inline errors with no wallet or backend call. |
| Start Auction click | On valid terms, submit once, disable `Start Auction`, disable `Save Draft`, disable `Change artwork`, and lock the economics inputs immediately. |
| Pending lifecycle | Render the lifecycle shell inline on the same page, above the form/preview zone. Keep the submitted terms visible as a read-only snapshot while pending. |
| Wallet-required substep | If MetaMask confirmation is required, keep the top-level state `Pending start` and surface a single explicit wallet action row; do not create a second modal stack. |
| Transaction visibility | As soon as a tx hash exists, show it in the lifecycle shell with copy and explorer actions. Before it exists, render a neutral placeholder such as `Waiting for transaction hash`. |
| Retry protection | While a start is pending, do not allow another start request for the same artwork from this UI. If the seller reloads, restore the pending state instead of re-enabling the form. |
| Active state lock | After activation, keep reserve, increment, duration, and artwork selection read-only. Remove `Save Draft` and any editing affordance for unsafe economics. |
| Failed state recovery | For non-retryable failures, route the seller back into the editable terms flow only after they choose `Back to terms`. Show the failure summary before any edit happens. |
| Retryable state recovery | For retryable failures, keep the previously submitted snapshot visible and make `Retry Start Auction` the only primary action. The retry must not mint or persist a duplicate auction. |
| Inventory / order convergence | Seller inventory and seller order surfaces must render backend-provided lifecycle badges. Do not manually inject an optimistic active auction card into these views. |
| Public convergence | The public auction listing may render the auction only after backend state reports it active. Pending, failed, and retryable starts stay seller-only. |

If copy, explorer, or transaction actions use icons in execution, they must also render visible text labels or an explicit accessible-name fallback.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official/local | Existing local `Button`, `Input`, `Textarea`, `Checkbox`, `RadioGroup`, `Badge`, `Dialog` patterns only | `components.json` + `npx shadcn info` reviewed — 2026-04-27 |
| Third-party registries | none | not allowed — 2026-04-27 |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-04-27
