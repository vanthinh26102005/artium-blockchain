# Phase: Component Best-Practice Refactoring (shadcn/Radix alignment)

## Objective
Enhance all `/components` directories across every `@domain` to use shared components where possible. **Zero UI changes. Zero logic changes.** Pure structural refactoring for better maintainability, accessibility, and code reuse.

## Codebase Snapshot
- **186 component files** across 17 domains in `src/@domains/`
- Shared primitives in `src/@shared/components/ui/` (shadcn/Radix)
- Shared form helpers in `src/@shared/components/forms/`

---

## Decisions (locked)

### Scope
**All 17 domains** are in scope. Focus on finding domain components that reinvent patterns already available in `@shared`.

### Standard
**shadcn/Radix** best practices. All refactored code must read as clean, professional shadcn-style components.

### Guard rail
**No UI changes. No logic changes.** The visual output and behaviour must be identical before and after. Any change that would alter the appearance of the page is out of scope for this phase.

### Cross-domain consolidation
When two domains have visually/structurally equivalent components but different data models (e.g., `discover/EventCard` vs `events/EventCard`), do **not** merge them — the data models are domain-specific. Only consolidate when the component itself is domain-agnostic.

---

## Identified Refactoring Items

### 1. New shared component — `UserAvatar`
**File:** `src/@shared/components/ui/user-avatar.tsx`

- Wraps Radix `Avatar`, `AvatarImage`, `AvatarFallback` from `@shared/components/ui/avatar`
- Adds: initials extraction, name-based color-hash fallback, online status indicator
- Same visual output as current `messaging/UserAvatar`
- Once created, **any domain** needing an avatar can import from here

### 2. Refactor: `messaging/UserAvatar`
**File:** `src/@domains/messaging/components/UserAvatar.tsx`

- Remove hand-rolled avatar implementation (custom img, initials, color-hash, online dot)
- Import and re-export `UserAvatar` from `@shared/components/ui/user-avatar`

### 3. Refactor: `events/ui/ToastPortal`
**File:** `src/@domains/events/components/ui/ToastPortal.tsx`

- Remove duplicate portal mounting boilerplate (`useState(false)` + `useEffect` + `createPortal`)
- Use `Portal` from `@shared/components/ui/Portal` for the mount
- Keep the toast UI (fixed position, message, close button) unchanged

### 4. Refactor: `inventory/InventoryToast`
**File:** `src/@domains/inventory/components/InventoryToast.tsx`

- Wraps the fixed-position toast in `Portal` so it correctly escapes any stacking context
- Zero visual change — `position: fixed` still positions it the same way

### 5. Refactor: `messaging/DeleteConfirmDialog`
**File:** `src/@domains/messaging/components/DeleteConfirmDialog.tsx`

- Replace hand-rolled overlay (`fixed inset-0`, `z-50`, manual visibility guard) with `Dialog` + `DialogContent` from `@shared/components/ui/dialog`
- Preserve the exact inner layout (AlertCircle icon, title, message, Cancel/Delete buttons)
- The Dialog handles: portal, overlay, Escape key, focus trap (accessibility improvement, not a UI change)

### 6. Refactor: `discover/nearby/ChangeLocationModal`
**File:** `src/@domains/discover/components/nearby/ChangeLocationModal.tsx`

- Replace manual `createPortal` + `isMounted` guard + manual Escape handler with `Dialog` + `DialogContent`
- Use `Button` from `@shared/components/ui/button` for Cancel and Apply buttons
- Use `Select` from `@shared/components/ui/select` for the radius `<select>` (matches shadcn pattern)
- Preserve all internal state logic, suggestions list, and apply/close handlers

### 7. Refactor: `inventory/Pagination` — page-size selector
**File:** `src/@domains/inventory/components/Pagination.tsx`

- Replace raw `<select>` with `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` from `@shared/components/ui/select`
- Matches the pattern already used in `events/EventsPagination` for consistency
- Props and handlers unchanged

---

## Files NOT changed (rationale)

| File | Reason |
|------|--------|
| `profile/CollapsibleSection` | Simple, self-contained; Radix Collapsible adds no benefit here |
| `discover/EventCard` vs `events/EventCard` | Different data models, different interaction; consolidation would require logic changes |
| `discover/MomentCard` vs `profile/MomentCard` | Different data models, different linking behaviour |
| Raw `<select>` in checkout/quick-sell forms | Native select is acceptable in form flows; replacing with shadcn Select would visually change the form |
| `messaging/SearchBar` | Custom focus-ring styling would conflict with shared Input; keep domain-local |
| `auth/AuthInput`, `auth/PasswordInput` | Already correctly using `BaseInputField` / `BasePasswordInputField` from `@shared` |
| `inventory/InventoryToolbar` status `<select>` | Inside a custom Popover filter panel; native select acceptable |

---

## Downstream Guidance (for planner/executor)

- All refactored files must pass `npm run build` (Next.js) and `npm run lint` (ESLint)
- Commit atomically per item (one commit per refactored component)
- The new `user-avatar.tsx` shared component must be created before any domain component imports it
- Use `cn()` from `@shared/lib/utils` for any className merging
- Import paths use `@shared/` alias (configured in `tsconfig.json`)
