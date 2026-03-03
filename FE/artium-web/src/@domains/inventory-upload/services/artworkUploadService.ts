/**
 * Artwork Upload Service
 * 
 * Integrates the artwork upload API with the inventory upload store.
 * Handles the complete upload flow for artwork images.
 * 
 * Flow:
 * 1. User selects images in Step 1 (stored locally)
 * 2. User completes details in Step 1
 * 3. Service uploads images to backend
 * 4. Service creates artwork with uploaded image URLs
 */

import artworkUploadApi from "@shared/apis/artworkUploadApi";
import artworkApis, { type ArtworkApiItem, type CreateArtworkInput as ApiCreateArtworkInput } from "@shared/apis/artworkApis";
import type {
  ArtworkImageUploadResponse,
  UploadError,
} from "@shared/types/artwork";
import type { UploadMediaState, UploadDetailsState, UploadListingState } from "../types/uploadArtwork";

// ============================================================================
// Types
// ============================================================================

interface UploadProgress {
  stage: 'uploading_images' | 'creating_artwork' | 'complete';
  imageProgress?: {
    current: number;
    total: number;
    percentage: number;
  };
  currentFile?: string;
}

interface UploadResult {
  artwork: ArtworkApiItem;
  uploadedImages: ArtworkImageUploadResponse[];
}

type ProgressCallback = (progress: UploadProgress) => void;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert store media state to uploadable files
 */
const extractFilesFromMedia = (media: UploadMediaState): {
  coverImage: File | null;
  additionalImages: File[];
} => {
  const coverImage = media.coverImage?.file ?? null;
  const additionalImages = media.additionalImages
    .map(item => item.file)
    .filter((file): file is File => file !== undefined);

  return { coverImage, additionalImages };
};

/**
 * Map store details to ApiCreateArtworkInput
 * Note: Images are excluded as they must be added separately via the add images endpoint
 */
const mapDetailsToArtworkInput = (
  details: UploadDetailsState,
  listing: UploadListingState,
  sellerId: string,
): ApiCreateArtworkInput => {
  // Map listing status to artwork status
  const statusMap = {
    sale: 'ACTIVE',
    inquire: 'ACTIVE',
    sold: 'SOLD',
  } as const;

  return {
    sellerId,
    title: details.title,
    description: details.description || undefined,
    creationYear: details.year ? parseInt(details.year, 10) : undefined,
    editionRun: details.editionRun || undefined,
    materials: details.materials || undefined,
    location: details.locationId || undefined,
    price: listing.price || undefined,
    currency: 'USD',
    quantity: listing.quantity ? parseInt(listing.quantity, 10) : 1,
    status: statusMap[listing.status as keyof typeof statusMap] || 'DRAFT',
    isPublished: listing.status === 'sale',
    folderId: undefined,
    tagIds: details.customTags?.length ? details.customTags : undefined,
  };
};

// ============================================================================
// Upload Service
// ============================================================================

/**
 * Upload artwork images and create artwork
 * 
 * @param media - Media state from upload store
 * @param details - Details state from upload store
 * @param listing - Listing state from upload store
 * @param sellerId - Seller ID (current user)
 * @param onProgress - Progress callback
 * @returns Upload result with created artwork and uploaded images
 * 
 * @example
 * ```typescript
 * const result = await uploadArtworkWithImages(
 *   media,
 *   details,
 *   listing,
 *   user.id,
 *   (progress) => {
 *     console.log(progress.stage, progress.imageProgress?.percentage);
 *   }
 * );
 * ```
 */
export const uploadArtworkWithImages = async (
  media: UploadMediaState,
  details: UploadDetailsState,
  listing: UploadListingState,
  sellerId: string,
  onProgress?: ProgressCallback,
): Promise<UploadResult> => {
  // Extract files
  const { coverImage, additionalImages } = extractFilesFromMedia(media);

  if (!coverImage) {
    throw new Error('Cover image is required');
  }

  // Create temporary artwork ID for uploads
  const tempArtworkId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const uploadedImages: ArtworkImageUploadResponse[] = [];

  try {
    // Stage 1: Upload cover image
    onProgress?.({
      stage: 'uploading_images',
      imageProgress: {
        current: 1,
        total: 1 + additionalImages.length,
        percentage: 0,
      },
      currentFile: coverImage.name,
    });

    const coverImageResponse = await artworkUploadApi.uploadArtworkImage(
      {
        file: coverImage,
        sellerId,
        artworkId: tempArtworkId,
        isPrimary: true,
        order: 0,
      },
      {
        onProgress: (fileProgress) => {
          onProgress?.({
            stage: 'uploading_images',
            imageProgress: {
              current: 1,
              total: 1 + additionalImages.length,
              percentage: Math.round(fileProgress.percentage / (1 + additionalImages.length)),
            },
            currentFile: coverImage.name,
          });
        },
      },
    );

    uploadedImages.push(coverImageResponse);

    // Stage 2: Upload additional images
    if (additionalImages.length > 0) {
      for (let i = 0; i < additionalImages.length; i++) {
        const file = additionalImages[i];
        const imageIndex = i + 2; // Start from 2 (1 is cover)

        onProgress?.({
          stage: 'uploading_images',
          imageProgress: {
            current: imageIndex,
            total: 1 + additionalImages.length,
            percentage: Math.round((imageIndex / (1 + additionalImages.length)) * 100),
          },
          currentFile: file.name,
        });

        const imageResponse = await artworkUploadApi.uploadArtworkImage(
          {
            file,
            sellerId,
            artworkId: tempArtworkId,
            isPrimary: false,
            order: imageIndex,
          },
          {
            onProgress: (fileProgress) => {
              const baseProgress = (imageIndex - 1) / (1 + additionalImages.length);
              const fileContribution = fileProgress.percentage / 100 / (1 + additionalImages.length);
              const totalProgress = Math.round((baseProgress + fileContribution) * 100);

              onProgress?.({
                stage: 'uploading_images',
                imageProgress: {
                  current: imageIndex,
                  total: 1 + additionalImages.length,
                  percentage: totalProgress,
                },
                currentFile: file.name,
              });
            },
          },
        );

        uploadedImages.push(imageResponse);
      }
    }

    // Stage 3: Create artwork without images
    onProgress?.({
      stage: 'creating_artwork',
      imageProgress: {
        current: 1 + additionalImages.length,
        total: 1 + additionalImages.length,
        percentage: 100,
      },
    });

    const artworkInput = mapDetailsToArtworkInput(details, listing, sellerId);
    const artwork = await artworkApis.createArtwork(artworkInput);

    // Stage 4: Add images to the created artwork
    if (uploadedImages.length > 0) {
      const imageInputs = uploadedImages.map((img) => ({
        publicId: img.publicId,
        secureUrl: img.secureUrl,
        url: img.url,
        format: img.format,
        size: img.size,
        width: img.width,
        height: img.height,
        isPrimary: img.isPrimary,
      }));

      await artworkApis.addImagesToArtwork(artwork.id, imageInputs);
    }

    // Stage 5: Complete
    onProgress?.({
      stage: 'complete',
      imageProgress: {
        current: 1 + additionalImages.length,
        total: 1 + additionalImages.length,
        percentage: 100,
      },
    });

    return {
      artwork,
      uploadedImages,
    };
  } catch (error) {
    // Clean up uploaded images if artwork creation fails
    // Note: In a production system, you might want to keep these for retry
    // or implement a cleanup endpoint on the backend
    
    console.error('Upload failed:', error);
    throw error;
  }
};

/**
 * Upload only images (without creating artwork)
 * Useful for draft saving or preview
 */
export const uploadImagesOnly = async (
  media: UploadMediaState,
  sellerId: string,
  artworkId: string,
  onProgress?: ProgressCallback,
): Promise<ArtworkImageUploadResponse[]> => {
  const { coverImage, additionalImages } = extractFilesFromMedia(media);

  if (!coverImage) {
    throw new Error('Cover image is required');
  }

  const uploadedImages: ArtworkImageUploadResponse[] = [];

  // Upload cover image
  onProgress?.({
    stage: 'uploading_images',
    imageProgress: {
      current: 1,
      total: 1 + additionalImages.length,
      percentage: 0,
    },
    currentFile: coverImage.name,
  });

  const coverResponse = await artworkUploadApi.uploadArtworkImage({
    file: coverImage,
    sellerId,
    artworkId,
    isPrimary: true,
    order: 0,
  });

  uploadedImages.push(coverResponse);

  // Upload additional images
  for (let i = 0; i < additionalImages.length; i++) {
    const file = additionalImages[i];
    
    onProgress?.({
      stage: 'uploading_images',
      imageProgress: {
        current: i + 2,
        total: 1 + additionalImages.length,
        percentage: Math.round(((i + 2) / (1 + additionalImages.length)) * 100),
      },
      currentFile: file.name,
    });

    const response = await artworkUploadApi.uploadArtworkImage({
      file,
      sellerId,
      artworkId,
      isPrimary: false,
      order: i + 1,
    });

    uploadedImages.push(response);
  }

  return uploadedImages;
};

/**
 * Validate media before upload
 */
export const validateMediaForUpload = (media: UploadMediaState): { 
  valid: boolean; 
  errors: string[]; 
} => {
  const errors: string[] = [];

  // Check cover image
  if (!media.coverImage?.file) {
    errors.push('Cover image is required');
  }

  // Check file types and sizes
  const allFiles = [
    media.coverImage?.file,
    ...media.additionalImages.map(img => img.file),
  ].filter((file): file is File => file !== undefined);

  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  allFiles.forEach((file, index) => {
    if (file.size > maxSize) {
      errors.push(`File "${file.name}" exceeds 10MB limit`);
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(`File "${file.name}" has invalid type. Allowed: JPEG, PNG, WebP, GIF`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

// ============================================================================
// Error Helpers
// ============================================================================

/**
 * Get user-friendly error message from upload error
 */
export const getUploadErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const uploadError = error as UploadError;
    
    // Map backend errors to user-friendly messages
    if (uploadError.statusCode === 413) {
      return 'File size too large. Please compress your images and try again.';
    }
    
    if (uploadError.statusCode === 415) {
      return 'Invalid file type. Please use JPEG, PNG, WebP, or GIF images.';
    }
    
    if (uploadError.statusCode === 401) {
      return 'Your session has expired. Please log in again.';
    }
    
    if (uploadError.statusCode === 500) {
      return 'Server error occurred. Please try again later.';
    }
    
    return error.message || 'Upload failed. Please try again.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};
