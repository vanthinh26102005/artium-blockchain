# State & Data Fetching

## 1. Global State: Zustand
Inventory uses **Zustand** for managing client-side global state, particularly for UI selections (e.g., selecting multiple artworks) and any state shared across multiple components/screens.

- **Stores Location (recommended):**
  - Global/shared stores: `@shared/stores/`
  - Feature-specific stores: `@domains/<domain>/stores/`

- **Usage (best practice):**
  - Always use **selectors** to avoid unnecessary re-renders:
    - `useXStore((s) => s.someSlice)`
  - Keep actions inside the store:
    - `setX`, `toggleX`, `reset`, `open/close`, etc.
  - Use local `useState` for component-only UI state; use Zustand when state is shared.

**Example (Selection Store):**
```ts
// src/@shared/stores/useInventorySelectionStore.ts
import { create } from 'zustand'

type InventorySelectionState = {
  selectedArtworkIds: string[]
  toggleArtworkId: (id: string) => void
  clearSelection: () => void
}

export const useInventorySelectionStore = create<InventorySelectionState>((set) => ({
  selectedArtworkIds: [],
  toggleArtworkId: (id) =>
    set((s) => ({
      selectedArtworkIds: s.selectedArtworkIds.includes(id)
        ? s.selectedArtworkIds.filter((x) => x !== id)
        : [...s.selectedArtworkIds, id],
    })),
  clearSelection: () => set({ selectedArtworkIds: [] }),
}))

Usage in component:

import { useInventorySelectionStore } from '@shared/stores/useInventorySelectionStore'

const selectedIds = useInventorySelectionStore((s) => s.selectedArtworkIds)
const toggleId = useInventorySelectionStore((s) => s.toggleArtworkId)


⸻

2. Server State: React Query / SWR

Inventory relies on custom hooks that wrap SWR or React Query.
Note: The codebase may mix both. createUsePaginationQueryV2 suggests a standardized factory for pagination and list queries.

Pattern: Custom Hook Wrapper

Don’t use useSWR or useQuery directly in UI components. Wrap them in a domain hook.
	•	Location: src/@domains/inventory/hooks/

Structure:

// src/@domains/inventory/hooks/useGetInventoryArtworks/index.ts
import artworkApis from '@shared/apis/artworkApis'
import { createUsePaginationQueryV2 } from '@shared/utils/reactQuery'

export const queryKey = ['useGetInventoryArtworks']

export const queryFn = (queryParams: any) => {
  return artworkApis.getUserInventoryArtworks(queryParams)
}

export const usePaginatedGetInventoryArtworks = createUsePaginationQueryV2({
  queryKey,
  queryFn,
  setStateCallback // Optional: to sync with Zustand store or local UI state
})

Syncing Server State -> Client State (Optional)

If you need to sync fetched data into Zustand (e.g., cache a selection, store derived filters):
	•	Prefer syncing in onSuccess / setStateCallback (depending on your wrapper),
	•	Or handle it in a thin adapter hook, not inside UI components.

⸻

3. Pagination
	•	Hook: usePaginatedGetInventoryArtworks returns data, page, pageSize, total, fetchPage.
	•	UI: Pagination component from @domains/inventory/components/Pagination.

⸻

4. Query Parameters
	•	Complex filters (search, tabs) are often managed via local state in the Page component and passed down to the Table/Hook.
	•	Debouncing is used for search inputs (useDebounce).

const [searchName, setSearchName] = useState<string>('')
const [debouncedSearchName] = useDebounce(searchName, 400)
