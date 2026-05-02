# API Layer Conventions

## 1. Structure
-   **Location:** `src/@shared/apis/`
-   **Naming:** `[resource]Apis.ts` (e.g., `artworkApis.ts`).
-   **Responsibility:** These files define the raw API calls using an Axios/Fetch wrapper.

## 2. Implementation
-   The API layer exports an object containing methods.
-   Methods correspond to backend endpoints.
-   **NO** hook logic here. Just pure async functions.

**Example (`src/@shared/apis/artworkApis.ts`):**
```ts
// Referenced in useGetInventoryArtworks
const artworkApis = {
  getUserInventoryArtworks: ({ page, pageSize, artworkQuery, sort }) => {
    return POST('/artwork/getUserInventoryArtworks', {
      body: { page, pageSize, artworkQuery, sort },
    })
  },
  // ...
}
export default artworkApis
```

## 3. Error Handling
-   Errors are typically handled at the **UI layer** (inside the Component via `isError` from the hook) or within the **Hook wrapper**.
-   The `InventoryArtworkTable` component checks `isFetchArtworksError` and renders an error message.

```tsx
{!isLoadingArtworks && isFetchArtworksError && (
  <Text className="text-red-500">
    {fetchArtworksError?.message}
  </Text>
)}
```

## 4. HTTP Client
-   Uses a custom wrapper (likely `POST`, `GET` imported from `@shared/apis/fetch` or similar) that handles authentication tokens automatically.
