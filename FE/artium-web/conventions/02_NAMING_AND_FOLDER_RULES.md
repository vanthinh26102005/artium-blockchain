# Naming & Folder Rules

## 1. Naming Conventions

### Files & Folders
-   **Components:** `PascalCase` (e.g., `InventoryArtworkGridViewItem.tsx`).
-   **Hooks:** `camelCase`, prefixed with `use` (e.g., `useGetInventoryArtworks.ts`).
-   **Barrels:** Use `index.tsx` or `index.ts` as the entry point for folders.
    -   *Example:* `src/@domains/inventory/components/InventoryArtwork/index.tsx`

### Code Symbols
-   **Component Names:** `PascalCase`, match the file name.
-   **Props Types:** `[ComponentName]Props`.
-   **Constants:** `UPPER_SNAKE_CASE` (e.g., `ARTWORKS_TAB`, `VIEW_MOD_TYPES`).
-   **SWR/Query Keys:** `camelCase` string or array (e.g., `'inventory-artworks-table'`, `['useGetInventoryArtworks']`).
-   **Atom States:** PascalCase with `State` suffix (e.g., `InventorySelectedArtworkIdsState`).

## 2. Folder Structure & Responsibilities

### `@domains/<domain_name>/`
Encapsulates all logic specific to a business domain (e.g., Inventory).
-   `components/`: UI components specific to this domain.
-   `hooks/`: Data fetching and logic hooks specific to this domain.
-   `tables/`: Complex table views (often wrapping logic + UI).
-   `modals/`: Domain-specific modals.
-   `forms/`: Domain-specific forms.

### `@shared/`
Reusable primitives and global concerns.
-   `components/ui/`: Atomic UI (Button, Input, Card) - *The "Lego" blocks*.
-   `states/`: Global Jotai atoms.
-   `apis/`: Axios/Fetch service definitions.
-   `constants/`: App-wide constants.

### `pages/`
Next.js Routing shell.
-   Should contains **minimal logic**.
-   Primarily imports a "Page View" from `@src/pages` or `@domains`.
-   Handles Server-Side Props (SSR) if necessary.

## 3. Barrel Pattern
Inventory uses index files to export components cleanly.

**Example (`src/@domains/inventory/components/InventoryArtwork/index.tsx`):**
```tsx
import InventoryArtwork from './InventoryArtwork'
export default InventoryArtwork
```
*Note: Sometimes the implementation is directly in `index.tsx` if it's the main component of that folder.*
