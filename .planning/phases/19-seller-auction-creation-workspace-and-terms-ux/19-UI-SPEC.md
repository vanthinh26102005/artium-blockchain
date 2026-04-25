---
phase: 19
slug: seller-auction-creation-workspace-and-terms-ux
status: approved
shadcn_initialized: partial-local
preset: Artium seller workspace
created: 2026-04-25
---

# Phase 19 - UI Design Contract

> Visual and interaction contract for the seller auction terms workspace. Phase 19 extends the existing seller artwork picker into terms configuration and preview only. Backend/on-chain auction start orchestration remains Phase 20.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn-compatible local primitives in `@shared/components/ui` |
| Preset | Artium seller workspace |
| Component library | Radix UI primitives via local shared components |
| Icon library | lucide-react |
| Font | ABC Monument Grotesk for seller workspace chrome; keep existing Inter only inside reused components that already depend on it |

### Required Existing Patterns

- Route shell remains `SidebarLayout` at `/artist/auctions/create`.
- Extend `SellerAuctionArtworkPickerPage`; do not create a separate terms route in Phase 19.
- Preserve Phase 18 palette, rounded panels, card language, and seller-only access states.
- Reuse local `Button`, `Input`, `Textarea`, `Select` or `RadioGroup`, and `Checkbox` components where practical.
- Do not reuse quick-sell invoice layout, invoice copy, or checkout preview patterns for auction economics.

---

## Layout Contract

| Region | Contract |
|--------|----------|
| Page frame | `min-h-screen bg-[#FDFDFD] text-[#191414]` inside `SidebarLayout`, with page padding `20px` mobile, `40px` tablet, `48px` desktop. |
| Progress header | Replace the Phase 18 right-side "Phase 18 scope" card with a two-step status rail: `1 Choose artwork`, `2 Set auction terms`. Active step uses `#2351FC`; completed step uses black text with a check icon. |
| Artwork step | Keep the existing eligible/blocked artwork grid. The `Continue to auction terms` action becomes enabled only after selecting an eligible artwork. |
| Terms step desktop | Two-column layout: left column `minmax(0, 1fr)` for terms form, right column `420px` sticky preview panel. Gap `32px`. |
| Terms step tablet/mobile | Single-column layout. Preview appears after form fields; action bar becomes sticky bottom on mobile only after validation has run once or draft exists. |
| Selected artwork summary | Top of terms step shows a compact selected artwork card: thumbnail, title, creator, eligibility badge, and `Change artwork` action. |
| Policy rail | Keep three compact policy cards, updated for Phase 19: `Contract-backed terms`, `Economics lock on activation`, `Sepolia expectations`. |
| Preview panel | White rounded `32px` panel with image, title, seller/creator, timing summary, reserve disclosure, minimum bid increment, and policy checklist. |
| Action bar | Bottom of terms form on desktop, sticky bottom on mobile. Contains `Back`, `Save Draft`, and `Start Auction`/handoff action. |

### Page States

| State | Required UI |
|-------|-------------|
| Unauthenticated | Same as Phase 18: no picker rendered while auth redirect resolves. |
| Authenticated non-seller | Same blocked access panel: title `Seller profile required`, body `Create or complete your seller profile before starting an auction.`, CTA `Go to seller profile`. |
| Seller loading | Phase 18 skeleton grid. Terms step must not render until candidates load. |
| Seller no artworks | Empty panel title `No artworks in your inventory yet`, body `Upload or publish an artwork before starting an auction.`, CTA `Go to inventory` if route exists. |
| Seller no eligible artworks | Show `No auction-ready artworks` and blocked cards with recovery actions; do not show terms form. |
| Eligible artwork selected | Enable `Continue to auction terms` and show selected state text `Selected for auction`. |
| Terms pristine | Show neutral helper copy under fields; `Start Auction` disabled until required fields and acknowledgement are complete. |
| Terms invalid | Show inline field errors and a top form summary: `Review auction terms before continuing.` |
| Draft saved | Show non-blocking confirmation inline near action bar: `Draft saved on this device.` |
| Backend error | Same inline error panel style as Phase 18. Do not rely on toast-only failure. |

---

## Form Contract

### Required Fields

| Field | UI Control | Contract |
|-------|------------|----------|
| Reserve policy | Radio group or segmented control | Options: `No reserve` and `Set reserve price`. Default: `No reserve`. |
| Reserve price | ETH amount input | Visible only when `Set reserve price` is selected. Label `Reserve price`. Helper: `The sale completes only if the final bid meets this reserve.` |
| Minimum bid increment | ETH amount input | Required. Label `Minimum bid increment`. Helper: `The first bid must be at least this amount; later bids must increase by at least this amount.` |
| Duration | Preset buttons plus optional custom input | Required. Presets: `24 hours`, `3 days`, `7 days`. Optional custom duration may be included if implemented safely. |
| Shipping disclosure | Textarea | Required. Label `Shipping and fulfillment notes`. Minimum visible height `120px`. |
| Payment disclosure | Textarea | Required. Label `Payment and buyer expectations`. Minimum visible height `120px`. |
| Policy acknowledgement | Checkbox | Required. Copy: `I understand auction economics are locked after activation.` |

### Explicitly Excluded Fields

- Do not add a separate enforceable `Starting bid` field in Phase 19.
- If the UI needs to satisfy roadmap wording around starting bid, use explanatory text tied to `Minimum bid increment`: `On the current contract, this also acts as the first-bid floor.`
- Do not add future scheduled start controls. Contract creation starts immediately when Phase 20 activates the auction.

### Validation Contract

| Validation | Message |
|------------|---------|
| Missing minimum increment | `Enter a minimum bid increment.` |
| Non-positive minimum increment | `Minimum bid increment must be greater than 0 ETH.` |
| Invalid ETH number | `Enter a valid ETH amount.` |
| Reserve selected but missing | `Enter a reserve price or choose No reserve.` |
| Reserve selected but non-positive | `Reserve price must be greater than 0 ETH.` |
| Missing duration | `Choose an auction duration.` |
| Custom duration too short | `Auction duration must be at least 24 hours.` |
| Custom duration too long | `Auction duration cannot exceed 30 days.` |
| Missing shipping disclosure | `Add shipping and fulfillment notes.` |
| Missing payment disclosure | `Add payment and buyer expectations.` |
| Missing acknowledgement | `Confirm that auction economics lock after activation.` |

### Field Formatting

- ETH inputs accept decimal strings and preserve the typed value while focused.
- Do not auto-round silently. If formatting is applied on blur, keep enough precision for Wei conversion in Phase 20.
- Show `ETH` as a suffix inside amount fields.
- Do not show fiat conversion unless an existing reliable pricing source is already available.

---

## Preview Contract

| Preview Element | Contract |
|-----------------|----------|
| Artwork image | Use selected artwork thumbnail. Missing image uses the Phase 18 placeholder style and accessible label. |
| Title and creator | Use selected candidate title and creator name. Fallback creator copy: `Unknown creator`. |
| Timing | Show `Starts when activated` and computed end copy, e.g. `Ends 7 days after activation`. Do not show a future scheduled timestamp. |
| Minimum bid | Show `First bid floor` from minimum bid increment with helper `Contract-backed by minimum bid increment.` |
| Reserve | If no reserve: `No reserve threshold configured`. If set: `Reserve price: {amount} ETH`. |
| Network | Show `Sepolia test network` and `MetaMask confirmation happens in the next step.` |
| Economics lock | Show `Reserve, increment, and duration lock after activation.` |
| Shipping/payment | Show seller-entered disclosures as buyer-facing summary snippets, clipped with `line-clamp` only if full text remains accessible. |
| Policy checklist | Three rows: `Eligible artwork selected`, `Terms validated`, `Activation handled in next step`. |

### Preview Tone

- Use confident but precise copy. Avoid saying the auction is live, started, published, or confirmed in Phase 19.
- Use `preview` and `before activation` language consistently.
- Avoid blockchain jargon beyond `Sepolia`, `MetaMask`, and `on-chain` where needed for policy clarity.

---

## Spacing Scale

Declared values must stay multiples of 4:

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, helper icon spacing |
| sm | 8px | Field helper gaps, chip padding |
| md | 16px | Field groups, compact cards, mobile form gaps |
| lg | 24px | Card padding, mobile section padding |
| xl | 32px | Desktop column gaps, preview panel padding |
| 2xl | 48px | Header-to-content spacing, major sections |
| 3xl | 64px | Desktop page-level vertical spacing |

Exceptions: existing shared button heights `36px`, `43px`, `48px`, and `56px` may remain as defined in `button.tsx`; existing Phase 18 rounded radii `28px`, `32px`, `34px`, and `40px` may remain for visual continuity.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 16px | 400 | 24px |
| Helper | 14px | 400 | 20px |
| Label | 11px | 700 | 16px |
| Form label | 14px | 700 | 20px |
| Section heading | 24px | 700 | 30px |
| Heading | 40px | 700 | 44px |
| Display | 64px desktop / 48px mobile | 700 | 68px desktop / 52px mobile |

### Typography Rules

- Small operational labels use uppercase tracking: `text-[11px] font-bold uppercase tracking-[0.18em]`.
- Form labels use sentence case, not all caps.
- Helper text uses `text-[#191414]/60` and must remain at least `14px`.
- Field error text uses `14px` medium with destructive color.
- Preview prices use tabular numerals if supported by the active font stack.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#FDFDFD` | Page background |
| Secondary (30%) | `#FFFFFF` | Cards, form panels, preview panel |
| Accent (10%) | `#2351FC` | Active step, selected artwork ring, primary CTA, valid checklist indicators |
| Destructive | `#FF4337` | Field errors, invalid summary, destructive/blocking emphasis only |

Accent reserved for: primary CTA, active step state, selected artwork ring, focused fields, valid checklist indicators, and eligible status highlights.

### Support Colors

| Role | Value | Usage |
|------|-------|-------|
| Text primary | `#191414` | Main copy, titles, form labels |
| Text muted | `#808080` | Metadata and secondary helper copy |
| Border | `#E5E5E5` | Panels, fields, separators |
| Disabled surface | `#F5F5F5` | Disabled buttons, skeletons, unavailable panels |
| Warning surface | `#FFF7E6` | Sepolia and activation-lock notices |
| Warning text | `#7A4B00` | Sepolia and policy warning text |
| Success surface | `#ECFDF3` | Completed checklist row background |
| Success text | `#027A48` | Completed checklist text |

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Page eyebrow | `SELLER AUCTIONS` |
| Artwork step title | `Choose artwork for auction` |
| Artwork step body | `We check ownership and auction readiness before you set reserve price, duration, or bid rules.` |
| Terms step eyebrow | `AUCTION TERMS` |
| Terms step title | `Set terms before activation` |
| Terms step body | `Configure the contract-backed rules buyers will see before this auction is started on Sepolia.` |
| Selected artwork label | `Selected artwork` |
| Change artwork action | `Change artwork` |
| Continue action | `Continue to auction terms` |
| Back action | `Back to artwork` |
| Save draft action | `Save Draft` |
| Primary CTA before Phase 20 | `Start Auction` may appear only disabled or handoff-gated with copy that activation is implemented in Phase 20. |
| Disabled start helper | `Auction start connects to wallet and backend orchestration in the next step.` |
| Preview title | `Auction preview` |
| Empty eligible heading | `No auction-ready artworks` |
| Empty eligible body | `Your artworks need to be active, published, single-edition, and complete before they can enter an auction.` |
| Invalid summary | `Review auction terms before continuing.` |
| Draft saved | `Draft saved on this device.` |
| Error state | `We could not load auction eligibility. Try again or return to inventory.` |
| Destructive confirmation | Not applicable in Phase 19; no destructive action is introduced. |

### Required Policy Copy

- `Reserve, increment, and duration cannot be edited after activation.`
- `The auction starts when the activation transaction is created in the next step.`
- `Sepolia is a test network. Confirm wallet and network details before activation.`
- `If reserve is not met, the sale does not complete.`
- `Shipping and payment disclosures are shown to buyers before bidding.`

---

## Interaction Contract

| Interaction | Contract |
|-------------|----------|
| Eligible card select | Same as Phase 18; selecting an eligible card enables `Continue to auction terms`. |
| Continue to terms | Moves to terms step and scrolls top of workspace into view. Preserve `selectedArtworkId`. |
| Change artwork | Returns to artwork step with current terms preserved in memory/local draft. |
| Back to artwork | Same as `Change artwork`; no confirmation unless implementation detects unsaved local changes that would be lost. |
| Save Draft | Stores selected artwork and terms locally/session scoped. Shows `Draft saved on this device.` Do not claim server persistence. |
| Duration preset click | Selects one preset and updates preview immediately. |
| Reserve policy change | Switching to `No reserve` hides reserve amount and preview says no reserve threshold. Switching back restores typed amount if still in memory. |
| Policy acknowledgement | Required before start/handoff CTA can become active. |
| Start Auction | In Phase 19, must not call a fake or partial start API. It may be disabled, show handoff copy, or route to a Phase 20 placeholder only if planning explicitly defines that route. |
| Inline validation | Validate on blur and on start/handoff attempt; do not show all field errors before user interaction. |
| Preview updates | Preview updates live from valid or partially typed form state; invalid values display neutral placeholder copy instead of crashing. |

### Accessibility

- Step rail must expose current step with `aria-current="step"`.
- Form inputs must have visible labels and `aria-describedby` linking helper/error text.
- ETH suffix must not replace accessible label text.
- Radio/segmented controls must be keyboard accessible.
- Sticky mobile action bar must not cover focused fields; add bottom padding to the form.
- Errors must be inline and programmatically associated; do not rely on color only.
- Preview card must have heading hierarchy that follows the form step heading.

---

## Motion Contract

| Motion | Contract |
|--------|----------|
| Step transition | Use a subtle fade/slide within `200ms`; do not animate the entire page shell. |
| Preview updates | No aggressive animation on every keystroke. Use static updates or a tiny opacity transition only for summary chips. |
| Validation | Error summary may fade in within `150ms`; fields should not shake. |
| Mobile sticky bar | Appears with a short upward slide only after terms step renders. |

Respect `prefers-reduced-motion`; disable non-essential transitions when enabled.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official/local | `Button`, `Input`, `Textarea`, `Select` or `RadioGroup`, `Checkbox`, simple skeleton divs | not required |
| Radix local wrappers | Select, RadioGroup, Checkbox, Tooltip/Popover only if already present in `@shared/components/ui` | not required |
| Third-party registries | none | third-party UI blocks are not allowed for this phase |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-04-25
