import { registerEnumType } from '@nestjs/graphql';

/**
 * Media content type for artworks
 * Used in: Artwork.images, various media fields
 */
export enum MediaType {
  /** 2D image (JPEG, PNG, etc.) */
  IMAGE = 'image',
  /** Video content (MP4, MOV, etc.) */
  VIDEO = 'video',
  /** 3D model (GLB, OBJ, etc.) */
  MODEL_3D = '3d',
}

registerEnumType(MediaType, {
  name: 'MediaType',
  description: 'Media content type (IMAGE, VIDEO, MODEL_3D)',
});
