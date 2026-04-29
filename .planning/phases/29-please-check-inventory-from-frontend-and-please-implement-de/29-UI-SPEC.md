---
phase: 29
slug: please-check-inventory-from-frontend-and-please-implement-de
status: approved
shadcn_initialized: true
preset: inventory-operational-seller-workspace
created: 2026-04-30
---

# Phase 29 - UI Design Contract

> Visual and interaction contract for inventory artwork actions: delete artwork, edit artwork, show on profile, and auction-start entry audit.

---

## Scope

Phase 29 applies to:

| Surface | Files |
|---------|-------|
| Inventory root | `FE/artium-web/src/@domains/inventory/views/InventoryPage.tsx` |
| Inventory folder | `FE/artium-web/src/@domains/inventory/views/InventoryFolderPage.tsx` |
| Grid/list artwork actions | `InventoryArtworkGridViewItem.tsx`, `InventoryArtworkList.tsx`, `InventoryArtworkListViewItem.tsx` |
| Modals and detail panel | `InventoryPageModals.tsx`, `ConfirmDeleteModal.tsx`, `InventoryArtworkDetailsPanel.tsx` |
| Profile display | `useProfileOverview.ts`, `profileApiMapper.ts`, `ProfileArtworksPage.tsx`, `ProfileArtworkCard.tsx` |
| Auction start handoff | `SellerAuctionArtworkPickerPage.tsx`, `useSellerAuctionStart.ts`, `auctionApis.ts` |

The first implementation screen remains the inventory workspace. Do not introduce a landing page, marketing hero, or separate explainer view.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | Tailwind + local shadcn-compatible primitives |
| Preset | `inventory-operational-seller-workspace` |
| Component library | Radix via `@shared/components/ui/*` wrappers |
| Icon library | `lucide-react` |
| Font | Existing app sans font; do not add a new font family |

Existing inventory uses large-radius operational cards and modals. Preserve the current inventory visual language for this phase, but new controls must avoid extra decorative wrappers, nested cards, and marketing-style sections.

---

## Spacing Scale

Declared values:

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon/text gap inside menu items and compact metadata |
| sm | 8px | Dropdown item padding, small row gaps, badge padding |
| md | 16px | Row/card internal gaps, modal content rhythm |
| lg | 24px | Inventory panel padding, card groups, grid gaps |
| xl | 32px | Page section spacing and modal body separation |
| 2xl | 48px | Empty state vertical padding |
| 3xl | 64px | Reserved for page-level separation only |

Exceptions:

| Value | Usage |
|-------|-------|
| 20px | Existing `top-20` sticky toolbar offset |
| 40px | Existing auction candidate page container radius; do not copy into new inventory controls |

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px | 400 | 1.5 |
| Small metadata | 12px | 500 | 1.35 |
| Label | 12px | 600 | 1.2 |
| Row title | 14px | 600 | 1.35 |
| Card title | 16px | 600 | 1.35 |
| Modal title | 16px | 700 | 1.25 |
| Page heading | 24px | 600 | 1.2 |

Rules:

- Do not use hero-scale type inside inventory controls.
- Do not scale font size with viewport width.
- Keep letter spacing at `0` except existing uppercase status labels, which may use `tracking-[0.12em]`.
- Long artwork titles must use `truncate` or `line-clamp-2` depending on available width.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#FFFFFF` / `#FDFDFD` | Inventory workspace, modal surfaces, profile cards |
| Secondary (30%) | `#F8FAFC` / `#F1F5F9` | Empty states, thumbnails, quiet row backgrounds |
| Text | `#0F172A` | Primary labels and artwork titles |
| Muted text | `#64748B` | Metadata, helper copy |
| Accent (10%) | `#2563EB` | Selected state, focus rings, primary non-destructive actions |
| Warning | `#F59E0B` | Draft or action-required status only |
| Success | `#16A34A` | Published/visible confirmation only |
| Destructive | `#E11D48` | Delete action, delete confirmation, destructive errors |

Accent reserved for:

- Selected checkboxes and selected artwork rows/cards.
- Primary action focus ring.
- Positive profile visibility state only when combined with `#16A34A`, not as a generic blue badge.

Do not add purple gradients, decorative blobs, or single-hue palette expansions.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | `Upload Artwork` |
| Edit menu item | `Edit Artwork` |
| Show profile menu item | `Show Artwork on Profile` |
| Hide profile menu item | `Hide Artwork from Profile` |
| Delete menu item | `Delete Artwork` |
| Auction handoff item | `Start Auction` |
| Empty state heading | `No artworks yet` |
| Empty state body | `Upload an artwork to manage profile visibility, folders, and auction readiness.` |
| Delete success toast | `Artwork deleted successfully.` |
| Delete failure toast | `We could not delete this artwork. Try again.` |
| Edit failure toast | `We could not open this artwork for editing. Try again.` |
| Profile visibility success toast | `Profile visibility updated.` |
| Profile visibility failure toast | `We could not update this artwork. Try again.` |
| Destructive confirmation | `Delete Artwork: This removes {title} from your inventory. This action cannot be undone.` |

Avoid stub copy such as `(stub)`, browser `alert()`, or implementation labels like `Change to Draft` unless the feature is actually implemented.

---

## Interaction Contract

### Artwork Action Menu

Grid view, root list view, compact list item view, and folder view must expose the same supported actions in this order:

| Order | Action | Icon | Behavior |
|-------|--------|------|----------|
| 1 | `View Details` | `Eye` | Opens the existing details panel; no route change |
| 2 | `Edit Artwork` | `Pencil` | Opens the artwork editing workflow |
| 3 | `Show Artwork on Profile` / `Hide Artwork from Profile` | `Eye` / `EyeOff` | Toggles backend visibility |
| 4 | `Move to Folder` | `Folder` or `Move` | Opens the existing move modal |
| 5 | `Start Auction` | `Gavel` | Navigates to seller auction creation only when eligible |
| 6 | `Delete Artwork` | `Trash2` | Opens the delete confirmation modal |

Unsupported actions (`Duplicate artwork`, `Copy link`, `Change to Draft`) must be hidden until implemented. Do not leave disabled or alert-backed menu items in the final flow.

All icon-only triggers need `aria-label` including the artwork title, for example `Actions for {title}`.

### Edit Artwork

Current root inventory routing to `/artworks/{id}` is not acceptable for edit because that is a public detail route. The edit action must use an explicit edit-capable path, one of:

| Preferred | Acceptable fallback |
|-----------|---------------------|
| `/artworks/upload?draftArtworkId={id}` if the upload draft workflow supports existing artwork IDs | A dedicated `/inventory/artworks/{id}/edit` or `/artworks/{id}/edit` page backed by `artworkApis.getArtworkById` and `artworkApis.updateArtwork` |

Folder inventory must not keep the current `window.alert()` edit stub. Root and folder inventory must share the same edit handler.

When edit is locked by auction lifecycle, keep the menu item visible only if it can explain the lock in a disabled state. Otherwise hide it. Lifecycle statuses that lock edit:

| Status | Edit rule |
|--------|-----------|
| `pending_start` | Locked |
| `auction_active` | Locked |
| `retry_available` | Locked until seller resolves attempt |
| `start_failed` | Use backend `editAllowed` |

### Delete Artwork

Deletion must remain modal-confirmed and must call `artworkApis.deleteArtwork(id)`.

Required behavior:

- Close dropdown before opening the modal.
- Confirmation modal title is `Delete Artwork`.
- Include the artwork title in the body.
- On success, remove the artwork from the current collection, clear the deleted ID from selected IDs, close details panel if it was showing that artwork, refresh inventory summary counts, and show the success toast.
- On failure, keep the artwork in the list and show the failure toast.
- Disable the confirm button while the delete request is in flight.

Do not delete optimistically before the API succeeds unless rollback is implemented in the same task.

### Show On Profile

Profile visibility is controlled by authoritative artwork fields, not local-only UI state.

Required data rules:

| UI state | Backend fields |
|----------|----------------|
| Visible on profile | `status` allows public display and `isPublished === true` |
| Hidden from profile | `isPublished === false` or an inactive/non-public status |

The toggle must call `artworkApis.updateArtwork(id, { isPublished: nextValue })` or a narrower backend endpoint if one exists. After success, update the inventory item from the returned artwork through `mapArtworkToInventory`.

Profile pages must only display public artwork. `useProfileOverview` should request the public-visible subset when viewing another user's profile. The owner view may show private/draft artwork only if it is explicitly labeled as owner-only; otherwise keep profile pages public-clean.

### Auction Start Entry

There is no current direct inventory action that starts an auction transaction. Inventory currently only displays `auctionLifecycle` badges and auction start lives under `/artist/auctions/create`.

If Phase 29 adds an inventory auction trigger, it must be a handoff:

- The inventory action label is `Start Auction`.
- It navigates to `/artist/auctions/create?artworkId={id}` or stores the selected artwork using the existing `useSellerAuctionStart` remembered artwork mechanism.
- It must not call `auctionApis.startSellerAuction`, `attachSellerAuctionStartTx`, or MetaMask wallet services from inventory.
- The seller auction page remains responsible for eligibility, terms, wallet handoff, retry, and lifecycle locking.

Eligibility display:

| Inventory state | Action state |
|-----------------|--------------|
| No lifecycle and public/single-quantity/complete artwork | Show `Start Auction` |
| `pending_start` | Show lifecycle badge; hide `Start Auction` |
| `auction_active` | Show lifecycle badge; hide `Start Auction` |
| `retry_available` or `start_failed` | Show `Resume Auction Setup` only if routed to seller auction status shell |
| Missing profile or blocked eligibility | Hide from menu or show disabled with a reason from auction candidates API |

---

## Responsive Contract

| Viewport | Requirement |
|----------|-------------|
| Mobile | Action menus remain accessible by tap; no hover-only controls for critical actions |
| Tablet | Grid cards keep fixed thumbnail aspect ratio and stable action trigger size |
| Desktop | List rows keep action buttons in the right column without text overlap |

Rules:

- Dropdown width must be at least `256px` when labels include profile or auction actions.
- Buttons and menu rows must have a stable height and must not resize on hover.
- Details panel and confirmation modal must not cover dropdown-triggered state in a way that traps focus behind the overlay.

---

## Accessibility Contract

| Element | Requirement |
|---------|-------------|
| Dropdown trigger | `aria-label="Actions for {title}"` |
| Delete modal | Focus starts on cancel or title; `Escape` closes; confirm button has `aria-busy` while deleting |
| Visibility toggle | Announces the resulting state in toast copy |
| Disabled locked actions | Include a visible or tooltip reason if the item remains visible |
| Image thumbnails | Use artwork title as alt text; fallback icons must be decorative |
| Keyboard | Tab order must reach select checkbox, thumbnail/detail link, and action trigger |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| Local shadcn-compatible components | `Button`, `Checkbox`, `Dialog`, `DropdownMenu` | not required |
| Third-party registry | none | not allowed for this phase |

No new UI registry dependency is needed.

---

## Implementation Notes For Planner

- Consolidate root inventory and folder inventory action behavior into shared handlers or a small hook so grid/list/folder actions do not drift again.
- Add frontend tests around delete success/failure, edit route, profile visibility toggle, and absence of direct auction-start RPC calls from inventory.
- If backend lacks a clear visibility endpoint beyond `updateArtwork`, use the existing `PUT /artwork/:id` API first and avoid adding a frontend-only visibility concept.
- If the existing upload draft route cannot edit submitted artwork, plan a dedicated edit page rather than routing users to public artwork detail.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-04-30
