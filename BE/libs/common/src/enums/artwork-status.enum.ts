import { registerEnumType } from '@nestjs/graphql';

/**
 * Artwork lifecycle status
 * Used in: Artwork.status
 */
export enum ArtworkStatus {
  /** Draft, not visible to public */
  DRAFT = 'DRAFT',
  /** Active and available for sale */
  ACTIVE = 'ACTIVE',
  /** Artwork has been sold */
  SOLD = 'SOLD',
  /** Reserved for a buyer */
  RESERVED = 'RESERVED',
  /** Temporarily inactive/unavailable */
  INACTIVE = 'INACTIVE',
  /** Soft deleted, hidden from view */
  DELETED = 'DELETED',
  /** Submitted for platform approval */
  PENDING_REVIEW = 'PENDING_REVIEW',
}

registerEnumType(ArtworkStatus, {
  name: 'ArtworkStatus',
  description:
    'Artwork lifecycle status (DRAFT, ACTIVE, SOLD, RESERVED, INACTIVE, DELETED, PENDING_REVIEW)',
});
