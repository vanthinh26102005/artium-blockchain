# Inventory API Documentation

## Overview

This document provides comprehensive API documentation for the artwork inventory management system. All endpoints support the single source of truth architecture where the backend handles all business logic, pagination, sorting, and filtering.

**Base URL**: `/artworks` and `/artwork-folders`

**Authentication**: All endpoints require seller authentication (sellerId parameter)

---

## Table of Contents

1. [Artwork Endpoints](#artwork-endpoints)
2. [Folder Endpoints](#folder-endpoints)
3. [Common Response Structures](#common-response-structures)
4. [Migration from Frontend Logic](#migration-from-frontend-logic)

---

## Artwork Endpoints

### 1. List Artworks (Paginated)

**Enhanced with server-side pagination, sorting, and filtering**

```http
GET /artworks?sellerId={sellerId}&folderId={folderId}&skip={skip}&take={take}&sortBy={sortBy}&sortOrder={sortOrder}
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `sellerId` | string | Yes | - | Seller/user ID |
| `folderId` | string | No | - | Filter by folder. Use `"null"` for root inventory |
| `skip` | number | No | 0 | Number of records to skip (for pagination) |
| `take` | number | No | 20 | Number of records to return (page size) |
| `sortBy` | string | No | `createdAt` | Field to sort by: `createdAt`, `updatedAt`, `title`, `price`, `status` |
| `sortOrder` | string | No | `DESC` | Sort direction: `ASC` or `DESC` |
| `status` | string | No | - | Filter by status: `DRAFT`, `ACTIVE`, `SOLD`, etc. |
| `minPrice` | number | No | - | Minimum price filter |
| `maxPrice` | number | No | - | Maximum price filter |

#### Response

```typescript
{
  "data": [
    {
      "id": "artwork-uuid-123",
      "sellerId": "seller-uuid-456",
      "creatorName": "John Doe",              // NEW: Creator/artist name
      "title": "Sunset Over Water",
      "description": "An abstract painting...",
      "thumbnailUrl": "https://storage.googleapis.com/.../image1.jpg", // NEW: Auto-computed
      "images": [
        {
          "publicId": "img1",
          "secureUrl": "https://storage.googleapis.com/.../image1.jpg",
          "width": 1920,
          "height": 1080
        }
      ],
      "status": "DRAFT",                      // Backend status (7 values)
      "displayStatus": "Draft",               // NEW: Frontend display status ("Draft" | "Hidden")
      "isPublished": true,
      "price": 1200.00,
      "currency": "USD",
      "quantity": 1,
      "folderId": null,                       // null = root inventory
      "folder": null,
      "createdAt": "2025-01-10T10:00:00Z",
      "updatedAt": "2025-01-10T10:00:00Z"
    }
  ],
  "pagination": {                             // NEW: Pagination metadata
    "total": 150,                             // Total number of artworks
    "skip": 0,
    "take": 20,
    "totalPages": 8,                          // Calculated: Math.ceil(total / take)
    "currentPage": 1,                         // Calculated: Math.floor(skip / take) + 1
    "hasNext": true,                          // Are there more pages?
    "hasPrev": false                          // Is there a previous page?
  }
}
```

#### Example Requests

**Get root inventory (first page, sorted by date):**
```http
GET /artworks?sellerId=abc123&folderId=null&skip=0&take=20&sortBy=createdAt&sortOrder=DESC
```

**Get artworks in a specific folder:**
```http
GET /artworks?sellerId=abc123&folderId=folder-123&skip=0&take=20
```

**Get second page, sorted by price:**
```http
GET /artworks?sellerId=abc123&skip=20&take=20&sortBy=price&sortOrder=ASC
```

**Get draft artworks only:**
```http
GET /artworks?sellerId=abc123&status=DRAFT&skip=0&take=20
```

---

### 2. Search Artworks

**Enhanced to include creator name in search**

```http
GET /artworks/search?sellerId={sellerId}&q={query}&skip={skip}&take={take}
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `sellerId` | string | Yes | - | Seller/user ID |
| `q` | string | Yes | - | Search query |
| `skip` | number | No | 0 | Pagination offset |
| `take` | number | No | 20 | Page size |

#### Search Fields

The search query matches against:
- **Title**
- **Description**
- **Materials**
- **Creator Name** ⭐ NEW

#### Response

Same as List Artworks (array of artwork objects).

#### Example

```http
GET /artworks/search?sellerId=abc123&q=Vincent&skip=0&take=20
```

---

### 3. Duplicate Artwork

**NEW: Create a copy of an artwork**

```http
POST /artworks/:id/duplicate
```

#### Request Body

```typescript
{
  "sellerId": "seller-uuid-123",      // Required
  "title": "My Artwork - Copy"        // Optional (defaults to "[Original Title] (Copy)")
}
```

#### Response

```typescript
{
  "original": {
    "id": "original-artwork-id",
    "title": "Original Artwork",
    "status": "ACTIVE",
    ...
  },
  "duplicate": {
    "id": "new-artwork-id",
    "title": "Original Artwork (Copy)",
    "status": "DRAFT",                // Always starts as DRAFT
    "isPublished": false,             // Always unpublished
    "images": [...],                  // Same images (references, not copies)
    "viewCount": 0,                   // Reset engagement metrics
    "likeCount": 0,
    "commentCount": 0,
    "moodboardCount": 0,
    ...
  }
}
```

#### Behavior

- Creates a new artwork with a new ID
- Copies all properties except:
  - Status → Always `DRAFT`
  - Published → Always `false`
  - Engagement metrics → Reset to 0
  - Timestamps → New creation date
- Image files are **referenced**, not duplicated (same GCS URLs)

#### Example

```http
POST /artworks/artwork-123/duplicate
Content-Type: application/json

{
  "sellerId": "seller-456",
  "title": "Summer Landscape - Version 2"
}
```

---

### 4. Bulk Move Artworks

```http
POST /artworks/bulk/move
```

#### Request Body

```typescript
{
  "sellerId": "seller-uuid-123",
  "artworkIds": ["art-1", "art-2", "art-3"],
  "folderId": "folder-123"          // Use null to move to root inventory
}
```

#### Response

```typescript
{
  "movedCount": 3,
  "artworks": [
    {
      "id": "art-1",
      "folderId": "folder-123",
      ...
    }
  ]
}
```

#### Constraints

- Maximum 100 artworks per request
- All artworks must belong to the seller
- Target folder must exist and belong to seller (if not null)

---

### 5. Bulk Delete Artworks

```http
DELETE /artworks/bulk
```

#### Request Body

```typescript
{
  "sellerId": "seller-uuid-123",
  "artworkIds": ["art-1", "art-2", "art-3"]
}
```

#### Response

```typescript
{
  "deletedCount": 3
}
```

#### Behavior

- Deletes artworks from database
- **Also deletes associated images from Google Cloud Storage**
- Maximum 100 artworks per request

---

### 6. Bulk Update Artwork Status

```http
POST /artworks/bulk/status
```

#### Request Body

```typescript
{
  "sellerId": "seller-uuid-123",
  "artworkIds": ["art-1", "art-2", "art-3"],
  "status": "ACTIVE"                // DRAFT, ACTIVE, SOLD, RESERVED, INACTIVE, DELETED, PENDING_REVIEW
}
```

#### Response

```typescript
{
  "updatedCount": 3,
  "artworks": [
    {
      "id": "art-1",
      "status": "ACTIVE",
      "displayStatus": "Draft",
      ...
    }
  ]
}
```

---

## Folder Endpoints

### 1. List Folders

```http
GET /artwork-folders?sellerId={sellerId}&includeItemCount={includeItemCount}
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `sellerId` | string | Yes | - | Seller/user ID |
| `includeItemCount` | boolean | No | false | Include artwork count per folder |

#### Response

```typescript
[
  {
    "id": "folder-uuid-123",
    "sellerId": "seller-uuid-456",
    "name": "Gallery Picks",
    "position": 0,                  // NEW: Display order
    "isHidden": false,              // NEW: Visibility flag
    "parentId": null,               // For nested folders (future)
    "itemCount": 15,                // Only if includeItemCount=true
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
]
```

**Folders are returned sorted by `position` (ascending)**

---

### 2. Reorder Folders

**NEW: Change folder display order**

```http
PUT /artwork-folders/reorder
```

#### Request Body

```typescript
{
  "sellerId": "seller-uuid-123",
  "folderIds": ["folder-3", "folder-1", "folder-2"]    // Array in desired order
}
```

#### Response

```typescript
{
  "success": true,
  "folders": [
    {
      "id": "folder-3",
      "name": "New Releases",
      "position": 0,                // Updated based on array index
      ...
    },
    {
      "id": "folder-1",
      "name": "Gallery Picks",
      "position": 1,
      ...
    },
    {
      "id": "folder-2",
      "name": "Collector Hold",
      "position": 2,
      ...
    }
  ]
}
```

#### Behavior

- Updates `position` field for each folder
- Position is set to array index (0, 1, 2, ...)
- All folders must belong to the seller
- Folders returned in the new order

#### Frontend Usage

```typescript
// On drag-and-drop reorder
const reorderedFolderIds = folders.map(f => f.id);
await api.reorderFolders(sellerId, reorderedFolderIds);
```

---

### 3. Toggle Folder Visibility

**NEW: Show/hide folders from display**

```http
PATCH /artwork-folders/:id/visibility
```

#### Request Body

```typescript
{
  "sellerId": "seller-uuid-123",
  "isHidden": true                  // true = hide, false = show
}
```

#### Response

```typescript
{
  "folder": {
    "id": "folder-123",
    "name": "Private Collection",
    "isHidden": true,
    ...
  }
}
```

#### Use Cases

- Hide folders from public view
- Archive old collections
- Temporary visibility control

---

### 4. Create Folder

```http
POST /artwork-folders
```

#### Request Body

```typescript
{
  "sellerId": "seller-uuid-123",
  "name": "New Collection",
  "parentId": null                  // Optional, for nested folders
}
```

#### Response

```typescript
{
  "id": "new-folder-uuid",
  "sellerId": "seller-uuid-123",
  "name": "New Collection",
  "position": 0,                    // Auto-assigned
  "isHidden": false,                // Default
  "parentId": null,
  "createdAt": "2025-01-12T00:00:00Z",
  "updatedAt": "2025-01-12T00:00:00Z"
}
```

---

### 5. Update Folder

```http
PUT /artwork-folders/:id
```

#### Request Body

```typescript
{
  "sellerId": "seller-uuid-123",
  "name": "Updated Collection Name"
}
```

---

### 6. Delete Folder

```http
DELETE /artwork-folders/:id?sellerId={sellerId}
```

#### Behavior

- Deletes the folder
- **Artworks in folder are moved to root inventory** (folderId set to null)
- If folder has child folders, they are also deleted (cascade)

---

### 7. Get Artworks in Folder

```http
GET /artwork-folders/:folderId/artworks?sellerId={sellerId}
```

#### Response

Array of artwork objects (same structure as List Artworks).

---

### 8. Count Artworks in Folder (Recursive)

```http
GET /artwork-folders/:folderId/artworks/count?sellerId={sellerId}
```

#### Response

```typescript
{
  "count": 42                       // Includes artworks in nested folders
}
```

---

## Common Response Structures

### Status Mapping

**Backend Status → Frontend Display Status**

| Backend Status | Frontend Display | Description |
|----------------|------------------|-------------|
| `DRAFT` | `Draft` | Not yet published |
| `ACTIVE` | `Draft` | Active and listed |
| `PENDING_REVIEW` | `Draft` | Awaiting approval |
| `SOLD` | `Hidden` | Sold artwork |
| `RESERVED` | `Hidden` | Reserved for buyer |
| `INACTIVE` | `Hidden` | Temporarily inactive |
| `DELETED` | `Hidden` | Soft deleted |

### Artwork Object Structure

```typescript
interface ArtworkObject {
  id: string;
  sellerId: string;
  creatorName?: string;              // NEW
  title: string;
  description?: string;
  thumbnailUrl?: string;             // NEW (computed from images[0])
  images?: ArtworkImage[];
  status: ArtworkStatus;             // Backend enum (7 values)
  displayStatus: 'Draft' | 'Hidden'; // NEW (computed)
  isPublished: boolean;
  price?: number;
  currency?: string;
  quantity: number;
  folderId?: string | null;
  folder?: FolderObject;
  tags?: TagObject[];
  creationYear?: number;
  editionRun?: string;
  dimensions?: Dimensions;
  weight?: Weight;
  materials?: string;
  location?: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  moodboardCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Folder Object Structure

```typescript
interface FolderObject {
  id: string;
  sellerId: string;
  name: string;
  position: number;                  // NEW
  isHidden: boolean;                 // NEW
  parentId?: string | null;
  children?: FolderObject[];         // For nested folders
  itemCount?: number;                // Optional, when includeItemCount=true
  createdAt: Date;
  updatedAt: Date;
}
```

### Pagination Metadata

```typescript
interface PaginationMeta {
  total: number;                     // Total number of items
  skip: number;                      // Current offset
  take: number;                      // Page size
  totalPages: number;                // Math.ceil(total / take)
  currentPage: number;               // Math.floor(skip / take) + 1
  hasNext: boolean;                  // skip + take < total
  hasPrev: boolean;                  // skip > 0
}
```

---

## Migration from Frontend Logic

### What to Remove from Frontend

❌ **Remove these client-side computations:**

1. **Folder item counts** - Now returned by backend
   ```typescript
   // OLD: Frontend computed
   const folderCounts = useMemo(() => {
     const counts = new Map();
     artworks.forEach(a => {
       if (a.folderId) counts.set(a.folderId, (counts.get(a.folderId) || 0) + 1);
     });
     return counts;
   }, [artworks]);

   // NEW: Use backend data
   folders.map(f => f.itemCount); // From API
   ```

2. **Root artworks filtering** - Use API parameter
   ```typescript
   // OLD: Frontend filtered
   const rootArtworks = artworks.filter(a => !a.folderId);

   // NEW: Use API filter
   await api.getArtworks({ folderId: 'null' });
   ```

3. **Client-side pagination** - Use server-side
   ```typescript
   // OLD: Frontend sliced array
   const pageItems = filteredArtworks.slice((page - 1) * pageSize, page * pageSize);

   // NEW: Use API pagination
   const response = await api.getArtworks({ skip: (page - 1) * pageSize, take: pageSize });
   const { data, pagination } = response;
   ```

4. **Display status computation** - Use API field
   ```typescript
   // OLD: Frontend computed
   const displayStatus = artwork.status === 'SOLD' ? 'Hidden' : 'Draft';

   // NEW: Use API field
   artwork.displayStatus; // Already computed
   ```

5. **Thumbnail URL selection** - Use API field
   ```typescript
   // OLD: Frontend selected
   const thumbnailUrl = artwork.images?.[0]?.secureUrl;

   // NEW: Use API field
   artwork.thumbnailUrl; // Already computed
   ```

6. **Search/filter logic** - Use API parameters
   ```typescript
   // OLD: Frontend filtered
   const filtered = artworks.filter(a =>
     a.title.toLowerCase().includes(searchTerm.toLowerCase())
   );

   // NEW: Use API search
   await api.searchArtworks({ q: searchTerm });
   ```

### What to Keep in Frontend

✅ **Keep these UI-only concerns:**

1. **Selection state** - Multi-select checkboxes
2. **UI preferences** - Grid/list view toggle
3. **Modal states** - Open/close dialogs
4. **Optimistic updates** - Immediate feedback (revert on error)
5. **Local search debouncing** - Delay API calls
6. **Drag-and-drop UI** - Visual feedback (call API on drop)

---

## Frontend Integration Examples

### React Query Setup

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// List artworks with pagination
export function useArtworks(params: {
  sellerId: string;
  folderId?: string;
  skip?: number;
  take?: number;
  sortBy?: string;
  sortOrder?: string;
}) {
  return useQuery({
    queryKey: ['artworks', params],
    queryFn: () => api.getArtworks(params),
  });
}

// Reorder folders
export function useReorderFolders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { sellerId: string; folderIds: string[] }) =>
      api.reorderFolders(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}
```

### Usage in Component

```typescript
function InventoryPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading } = useArtworks({
    sellerId: currentUser.id,
    folderId: 'null', // Root inventory
    skip: (page - 1) * pageSize,
    take: pageSize,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  if (isLoading) return <Spinner />;

  const { data: artworks, pagination } = data;

  return (
    <>
      <ArtworkGrid artworks={artworks} />
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        hasNext={pagination.hasNext}
        hasPrev={pagination.hasPrev}
        onPageChange={setPage}
      />
    </>
  );
}
```

### Folder Reordering

```typescript
function FolderList({ folders }) {
  const reorderMutation = useReorderFolders();

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedFolders = Array.from(folders);
    const [removed] = reorderedFolders.splice(result.source.index, 1);
    reorderedFolders.splice(result.destination.index, 0, removed);

    const folderIds = reorderedFolders.map(f => f.id);

    reorderMutation.mutate({
      sellerId: currentUser.id,
      folderIds,
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {/* ... */}
    </DragDropContext>
  );
}
```

---

## Error Handling

All endpoints return standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

Example error response:
```typescript
{
  "statusCode": 400,
  "message": "Artwork does not belong to the specified seller",
  "error": "Bad Request"
}
```

---

## Rate Limiting & Performance

- Pagination is recommended for lists > 100 items
- Default page size: 20 items
- Maximum page size: 100 items
- Search is debounced on frontend (400ms recommended)
- Bulk operations limited to 100 items per request

---

## Testing Endpoints

Use the Swagger UI documentation at `/api-docs` for interactive testing.

Or use curl:

```bash
# List root inventory
curl -X GET "http://localhost:3000/artworks?sellerId=abc123&folderId=null&skip=0&take=20"

# Reorder folders
curl -X PUT "http://localhost:3000/artwork-folders/reorder" \
  -H "Content-Type: application/json" \
  -d '{"sellerId":"abc123","folderIds":["f1","f2","f3"]}'

# Duplicate artwork
curl -X POST "http://localhost:3000/artworks/artwork-123/duplicate" \
  -H "Content-Type: application/json" \
  -d '{"sellerId":"abc123","title":"My Copy"}'
```

---

## Support

For questions or issues, contact the backend team or check the OpenAPI/Swagger documentation at `/api-docs`.
