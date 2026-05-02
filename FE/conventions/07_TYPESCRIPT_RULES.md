# TypeScript Rules

## 1. Type Definitions
-   **Prefer `type` over `interface`** for props and component state.
-   **Naming:** `[ComponentName]Props`.

```tsx
type InventoryArtworkTableProps = {
  searchName?: string
  viewMode?: string
}
```

## 2. Usage
-   **Explicit Returns:** Not strictly enforced for React components (inference is fine), but props must be typed.
-   **Any:** Avoid `any`.
    -   *Exception:* In some legacy or complex generic wrappers (like `createUsePaginationQueryV2`), `any` might be seen, but you should avoid it in new Domain code.
-   **Optional Chaining:** Heavily used (`artwork?.creator?.fullName ?? ''`). Always handle potential undefined values in data from API.

## 3. Enums vs Const Objects
-   The codebase uses capitalized constant objects for "Enum-like" values.

```tsx
export const VIEW_MOD_TYPES = {
  LIST: 'list',
  GRID: 'grid'
}
```

## 4. Imports
-   Do not use `import type { ... }` unless necessary for circular dependency avoidance (standard imports are used in the inventory examples).
