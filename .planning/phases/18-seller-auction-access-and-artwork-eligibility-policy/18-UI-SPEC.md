---
phase: 18
slug: seller-auction-access-and-artwork-eligibility-policy
status: approved
shadcn_initialized: partial-local
preset: Artium seller workspace
created: 2026-04-25
---

# Phase 18 — UI Design Contract

> Visual and interaction contract for the seller auction artwork picker. Phase 18 covers access, candidate display, and eligibility explanation only. Auction terms and transaction start remain out of scope.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn-compatible local primitives in `@shared/components/ui` |
| Preset | Artium seller workspace |
| Component library | Radix UI primitives via local shared components |
| Icon library | lucide-react |
| Font | ABC Monument Grotesk for page chrome; keep existing Inter usage only inside reused artwork/detail components that already depend on it |

### Required Existing Patterns

- Route shell: use `SidebarLayout`, matching `FE/artium-web/src/pages/inventory/index.tsx`.
- Page location: `/artist/auctions/create`.
- Base palette: white/off-white seller workspace with `#191414` text.
- Buttons: reuse `@shared/components/ui/button` rounded `26px` pill buttons.
- Artwork display: reuse or mirror inventory artwork card/list structure from `InventoryArtworkGridViewItem` and `InventoryArtworkListViewItem`.
- Selection precedent: reuse Quick Sell artwork row/card language where useful, but do not copy invoice/price editing patterns into this phase.

---

## Layout Contract

| Region | Contract |
|--------|----------|
| Page frame | `SidebarLayout` with a full-width content surface. Use `min-h-screen bg-[#FDFDFD] text-[#191414]`. |
| Header | Top section with eyebrow `SELLER AUCTIONS`, title `Choose artwork for auction`, and body copy explaining eligibility is checked before terms. |
| Policy summary | Compact horizontal cards on desktop, stacked cards on mobile: `Seller-only access`, `Owned artwork only`, `Blocked reasons shown`. |
| Candidate area | Two-section layout: `Ready for auction` first, `Needs attention` second. Do not hide blocked artworks by default. |
| Artwork cards | Desktop grid uses 3 columns at large screens; tablet 2 columns; mobile 1 column. Cards use rounded `24px`, white surface, `border-black/10`, and artwork image ratio `1 / 1`. |
| Blocked artwork state | Blocked cards remain visible with disabled select action, muted overlay, and reason chips. |
| Mobile | Header padding `24px`; card grid one column; policy cards stack; sticky bottom action may be used only for current selected artwork. |

### Page States

| State | Required UI |
|-------|-------------|
| Unauthenticated | Render no picker. Redirect to login or show auth-required message with CTA `Sign in to continue`. |
| Authenticated non-seller | Show blocked access panel with title `Seller profile required`, body `Create or complete your seller profile before starting an auction.`, CTA `Go to seller profile`. |
| Seller loading | Show 6 skeleton artwork cards with rounded image blocks and label bars. |
| Seller no artworks | Empty panel title `No artworks in your inventory yet`, body `Upload or publish an artwork before starting an auction.`, CTA `Go to inventory`. |
| Seller no eligible artworks | Show `Needs attention` list with all blocked reasons and empty eligible panel title `No auction-ready artworks`. |
| Seller eligible artworks | Show eligible cards first with enabled `Select artwork` actions. |
| Backend error | Inline error panel, not a toast-only failure. Copy: `We could not load auction eligibility. Try again or return to inventory.` CTA `Retry`. |

---

## Spacing Scale

Declared values must stay multiples of 4:

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, chip icon spacing |
| sm | 8px | Chip padding, compact label gaps |
| md | 16px | Card internal gaps, mobile section gaps |
| lg | 24px | Mobile page padding, card padding |
| xl | 32px | Desktop card grid gaps, section spacing |
| 2xl | 48px | Header-to-content spacing on desktop |
| 3xl | 64px | Page-level vertical spacing on desktop |

Exceptions: existing shared button heights `43px`, `36px`, `48px`, and `56px` may remain as defined in `button.tsx`.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 16px | 400 | 24px |
| Label | 11px | 700 | 16px |
| Heading | 32px | 700 | 36px |
| Display | 48px | 700 | 52px |

### Typography Rules

- Use uppercase tracking for small operational labels: `text-[11px] font-bold uppercase tracking-wider`.
- Artwork titles use 18px semibold on cards and 16px semibold on compact rows.
- Reason chips use 12px medium and must remain readable at mobile width.
- Avoid introducing new web fonts for this phase.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#FDFDFD` | Page background |
| Secondary (30%) | `#FFFFFF` | Cards, panels, candidate surfaces |
| Accent (10%) | `#2351FC` | Primary CTA, selected card ring, eligible count highlight |
| Destructive | `#FF4337` | Error state and destructive/blocking warning emphasis only |

Accent reserved for: primary CTA, selected artwork ring, eligible status dot, and focused interactive states.

### Support Colors

| Role | Value | Usage |
|------|-------|-------|
| Text primary | `#191414` | Main text and titles |
| Text muted | `#808080` | Secondary metadata |
| Border | `#E5E5E5` | Panels, cards, separators |
| Disabled surface | `#F5F5F5` | Blocked card overlay and skeletons |
| Warning | `hsl(var(--warning))` | Recoverable blocked reason emphasis |
| Success | `hsl(var(--success))` | Eligible badges only |

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Page eyebrow | `SELLER AUCTIONS` |
| Page title | `Choose artwork for auction` |
| Page body | `We check ownership and auction readiness before you set reserve price, duration, or bid rules.` |
| Primary CTA | `Select artwork` |
| Selected action | `Continue to auction terms` |
| Empty state heading | `No auction-ready artworks` |
| Empty state body | `Your artworks need to be active, published, single-edition, and complete before they can enter an auction.` |
| Non-seller access heading | `Seller profile required` |
| Non-seller access body | `Create or complete your seller profile before starting an auction.` |
| Error state | `We could not load auction eligibility. Try again or return to inventory.` |
| Destructive confirmation | Not applicable in Phase 18; no destructive action is introduced. |

### Reason Code Copy

| Reason Code | Seller-Facing Copy | Recovery Hint |
|-------------|--------------------|---------------|
| `NOT_ACTIVE` | `Artwork is not active` | `Publish or activate this artwork before auctioning it.` |
| `NOT_PUBLISHED` | `Artwork is not published` | `Publish the artwork from inventory.` |
| `SOLD` | `Artwork is already sold` | `Sold artworks cannot be auctioned again.` |
| `DELETED` | `Artwork is deleted` | `Restore or recreate the artwork before auctioning it.` |
| `RESERVED` | `Artwork is reserved` | `Clear the reservation before starting an auction.` |
| `IN_AUCTION` | `Artwork is already in auction` | `Manage the existing auction instead.` |
| `HAS_ON_CHAIN_AUCTION` | `Auction already exists on-chain` | `Use the existing auction record.` |
| `ACTIVE_ORDER_LOCK` | `Artwork has an active order` | `Resolve the order before auctioning it.` |
| `MULTI_QUANTITY` | `Multiple quantities are not supported` | `Use a single-edition artwork for auctions.` |
| `MISSING_PRIMARY_IMAGE` | `Primary image is missing` | `Add a primary image in inventory.` |
| `MISSING_METADATA` | `Required artwork details are incomplete` | `Add title, creator, and display details before auctioning.` |

---

## Interaction Contract

| Interaction | Contract |
|-------------|----------|
| Eligible card click | Selects the artwork and applies blue ring `#2351FC` plus selected state text `Selected for auction`. |
| Blocked card click | Does not select. Keeps focus on card and exposes reason details. |
| Reason details | Show top 1-2 reason chips on card; reveal full reason list in expanded card, popover, or details panel. |
| Search/filter | Optional in Phase 18. If included, it must filter display only and must not alter backend eligibility rules. |
| Continue action | May be shown as next-step affordance, but must not collect terms or submit transactions in Phase 18. |
| Inventory entry | If launched with `artworkId`, highlight that artwork and scroll it into view if present. |

### Accessibility

- Cards must use `button` semantics or contain a real button for selection.
- Disabled/blocked cards must expose reason text to screen readers; do not rely on color only.
- Focus ring uses `ring-2 ring-[#2351FC]/30`.
- Image alt text must use artwork title; missing image placeholder must have accessible label `No primary image`.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official/local | `Button`, `Dialog` or `Popover` only if needed, `Skeleton` if already available or simple local skeleton divs | not required |
| Radix local wrappers | Dropdown, dialog, tooltip/popover only if already present in `@shared/components/ui` | not required |
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
