# Convention Summary (Inventory Domain)

This handbook distills the coding standards from the **Inventory Domain** (`src/@domains/inventory`), considered the "Gold Standard" for the Artium rebuild.

## 1. Architecture: Domain-Driven Design (DDD)
- **Logic lives in Domains:** All feature-specific logic resides in `src/@domains/<domain_name>`.
- **Pages are Shells:** `src/pages` only handle routing and wiring. They import "Page Views" from `@src/pages/userDashboard` or directly from domains.
- **Shared is for Primitives:** `src/@shared` contains atomic UI components, generic hooks, and global utilities.

## 2. Component Structure
- **Functional Components:** Named exports preferred.
- **Props:** Defined as `type ComponentNameProps = { ... }` immediately above the component.
- **State:** **Zustand** for cross-component/global state. **React Query** (via custom hooks) for server state.
- **Styling:** **Tailwind CSS** via `classnames` utility.

## 3. Data Fetching
- **Pattern:** Custom hooks wrapping React Query / SWR.
- **Pagination:** standardized via `createUsePaginationQueryV2` and `useSWRInfinite`.
- **API Layer:** Centralized in `src/@shared/apis`. Components **never** call `fetch/axios` directly.

## 4. Key Libraries
- **State:** `zustand`, `zustand/utils`
- **Fetching:** `@tanstack/react-query`, `swr`
- **Styling:** `tailwindcss`, `classnames`, `@headlessui/react`
- **UI Kit:** Custom primitives in `src/@shared/components/ui` (Radix-like).
- **Icons:** `@heroicons/react`

## 5. File Naming
- **Components:** `PascalCase.tsx` (e.g., `InventoryArtworkGridViewItem.tsx`).
- **Hooks:** `camelCase.ts` (e.g., `useGetInventoryArtworks.ts`).
- **Folders:** Match the component name (e.g., `InventoryArtwork/index.tsx`).

## 6. Directory Map
```
src/
├── @domains/
│   └── inventory/
│       ├── components/   # Domain-specific UI
│       ├── hooks/        # Domain logic & data fetching
│       ├── tables/       # Specific table views
│       ├── modals/       # Feature modals
│       └── forms/        # Form definitions
├── @shared/
│   ├── components/ui/  # Atomic UI (Button, Card, Input)
│   └── apis/           # API definitions
└── pages/              # Next.js Routes
```
