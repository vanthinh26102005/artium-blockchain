/**
 * Artwork Type Definitions
 * 
 * These types align with the backend DTOs from:
 * - BE/libs/common/src/dtos/artworks/
 * - BE/libs/common/src/interfaces/
 * 
 * Convention: Use exact backend field names for API communication.
 * Frontend-specific transformations should happen in mapper functions.
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * Artwork lifecycle status
 * Backend: BE/libs/common/src/enums/artwork-status.enum.ts
 */
export enum ArtworkStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  RESERVED = 'RESERVED',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
  PENDING_REVIEW = 'PENDING_REVIEW',
}

// ============================================================================
// Measurement Types
// ============================================================================

/**
 * Artwork dimensions
 * Backend: BE/libs/common/src/interfaces/artwork-measurements.interface.ts
 */
export interface Dimensions {
  height?: number;
  width?: number;
  depth?: number;
  unit: 'cm' | 'in';
}

/**
 * Artwork weight
 * Backend: BE/libs/common/src/interfaces/artwork-measurements.interface.ts
 */
export interface Weight {
  value?: number;
  unit: 'kg' | 'lbs';
}

// ============================================================================
// Image Types
// ============================================================================

/**
 * Artwork image representation (returned from API)
 * Backend: BE/libs/common/src/interfaces/artwork-image.interface.ts
 */
export interface ArtworkImage {
  id?: string;
  publicId: string;
  url: string;
  secureUrl: string;
  format?: string;
  width?: number;
  height?: number;
  size?: number;
  bucket?: string;
  createdAt?: Date | string;
  altText?: string;
  order?: number;
  isPrimary?: boolean;
}

/**
 * Upload response for single image
 * Backend: UploadController.uploadArtworkImage response
 */
export interface ArtworkImageUploadResponse {
  publicId: string;
  url: string;
  secureUrl: string;
  format?: string;
  width?: number;
  height?: number;
  size?: number;
  bucket?: string;
  isPrimary?: boolean;
}

/**
 * Avatar upload response
 * Backend: UploadController.uploadAvatar response
 */
export interface AvatarUploadResponse {
  url: string;
  secureUrl: string;
}

// ============================================================================
// Artwork CRUD Types
// ============================================================================

/**
 * Full artwork object (returned from API)
 * Backend: BE/libs/common/src/dtos/artworks/artwork/artwork.object.ts
 */
export interface ArtworkObject {
  id: string;
  sellerId: string;
  title: string;
  description?: string;
  creationYear?: number;
  editionRun?: string;
  dimensions?: Dimensions;
  weight?: Weight;
  materials?: string;
  location?: string[];
  price?: number;
  currency?: string;
  quantity: number;
  status: ArtworkStatus;
  isPublished: boolean;
  images?: ArtworkImage[];
  createdAt: Date | string;
  updatedAt: Date | string;
  folder?: {
    id: string;
    name?: string;
  } | null;
  tags?: Array<{
    id: string;
    name?: string;
  }>;
}

/**
 * Create artwork input
 * Backend: BE/libs/common/src/dtos/artworks/artwork/create-artwork.input.ts
 */
export interface CreateArtworkInput {
  sellerId: string;
  title: string;
  description?: string;
  creationYear?: number;
  editionRun?: string;
  dimensions?: Dimensions;
  weight?: Weight;
  materials?: string;
  location?: string;
  price?: string;
  currency?: string;
  quantity?: number;
  status?: ArtworkStatus;
  isPublished?: boolean;
  folderId?: string | null;
  tagIds?: string[];
}

/**
 * Update artwork input (partial)
 * Backend: BE/libs/common/src/dtos/artworks/artwork/update-artwork.input.ts
 */
export type UpdateArtworkInput = Partial<CreateArtworkInput>;

/**
 * List artworks query parameters
 * Backend: BE/libs/common/src/dtos/artworks/artwork/get-artworks-query.dto.ts
 */
export interface GetArtworksQueryParams {
  sellerId?: string;
  folderId?: string | null;
  status?: string;
  skip?: number;
  take?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  skip: number;
  take: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated artwork list response
 */
export interface PaginatedArtworkResponse {
  data: ArtworkObject[];
  pagination: PaginationMeta;
}

/**
 * Bulk move artworks input
 * Backend: ArtworkController.bulkMoveArtworks
 */
export interface BulkMoveArtworksInput {
  artworkIds: string[];
  folderId?: string | null;
  sellerId?: string;
}

/**
 * Bulk move response
 */
export interface BulkMoveArtworksResponse {
  movedCount: number;
}

// ============================================================================
// Upload Request Types
// ============================================================================

/**
 * Upload single artwork image request
 * Backend: UploadController.uploadArtworkImage
 * 
 * Note: This is sent as multipart/form-data
 */
export interface UploadArtworkImageRequest {
  file: File;
  sellerId?: string;
  artworkId: string;
  altText?: string;
  isPrimary?: boolean;
  order?: number;
}

/**
 * Upload multiple artwork images request
 * Backend: UploadController.uploadArtworkImages
 * 
 * Note: This is sent as multipart/form-data
 */
export interface UploadArtworkImagesRequest {
  files: File[];
  sellerId?: string;
  artworkId: string;
}

/**
 * Upload avatar request
 * Backend: UploadController.uploadAvatar
 * 
 * Note: This is sent as multipart/form-data
 */
export interface UploadAvatarRequest {
  file: File;
  userId: string;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * API error response structure
 * Backend: AllExceptionsFilter
 */
export interface ApiErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  errors?: Record<string, any> | null;
}

/**
 * Upload-specific error types
 */
export enum UploadErrorType {
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_PARAMS = 'INVALID_PARAMS',
}

/**
 * Upload error details
 */
export interface UploadError extends Error {
  type: UploadErrorType;
  statusCode?: number;
  details?: any;
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Delete artwork response
 */
export interface DeleteArtworkResponse {
  success: boolean;
}

/**
 * Upload progress callback
 */
export type UploadProgressCallback = (progress: {
  loaded: number;
  total: number;
  percentage: number;
}) => void;

/**
 * Upload options
 */
export interface UploadOptions {
  onProgress?: UploadProgressCallback;
  signal?: AbortSignal;
}
