# React Component Style

## 1. Component Definition
-   **Type:** Functional Components (`const ComponentName = ...`).
-   **Export:** Named export usually, `export default` at the end.
-   **Props:** Defined via `type` (not interface) immediately above the component.

```tsx
type InventoryArtworkTableProps = {
  searchName?: string
  viewMode?: string
  queryKeyName?: string
}

export const InventoryArtworkTable = ({
  searchName,
  viewMode = VIEW_MOD_TYPES.LIST,
  queryKeyName = 'inventory-artworks-table',
}: InventoryArtworkTableProps) => {
  // ...
}
```

## 2. Hook Ordering (Inside Component)
1.  **Global/Context Hooks:** `useAuth()`, `useQueryClient()`.
2.  **Atom Hooks (Jotai):** `useAtomValue()`, `useAtomCallback()`.
3.  **Memoized Values (derived from props/state):** `useMemo()`.
4.  **Data Fetching Hooks:** `usePaginatedGetInventoryArtworks()`.
5.  **Callbacks:** `useCallback()`.
6.  **Effects:** `useEffect()`.

## 3. Formatting & Comments
-   Use section markers to grouping logic inside the component.

```tsx
  // -- auth --
  const { authUser } = useAuth()

  // -- inventory request --
  const queryParams = useMemo(() => { ... }, [searchName])

  // -- refetch table handler --
  const onRefetch = useCallback(() => refetchArtworks(), [refetchArtworks])
```

## 4. Conditional Rendering
-   Prefer early returns for loading/error states when blocking the whole view.
-   Use `&&` for inline conditional rendering.
-   Use `ternary` for simple toggles.

```tsx
  // Loading State
  if (isLoadingArtworks) {
    return <SpinnerIcon />
  }

  // Content
  return (
    <div>
      {!hasSelectedAnyArtworks && (
        <Button>...</Button>
      )}
    </div>
  )
```

## 5. Styling
-   Use `classnames` (imported as `classNames` or `cn`) for conditional classes.
-   Tailwind classes grouped by utility (layout -> spacing -> styling).

```tsx
<div
  className={classNames(
    'grid gap-4',
    viewMode === VIEW_MOD_TYPES.GRID && 'grid-cols-2 lg:grid-cols-5',
    viewMode === VIEW_MOD_TYPES.LIST && 'grid-cols-1',
  )}
>
```
