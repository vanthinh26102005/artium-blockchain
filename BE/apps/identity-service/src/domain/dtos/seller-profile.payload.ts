import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { ProfileType } from '@app/common';
import { BusinessAddress } from './bussiness-addess.object';

export class SellerProfilePayload {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique seller profile identifier',
  })
  profileId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'User ID associated with this profile',
  })
  userId: string;

  @ApiProperty({
    enum: ProfileType,
    example: ProfileType.INDIVIDUAL,
    description: 'Type of seller profile',
  })
  profileType: ProfileType;

  @ApiProperty({
    example: 'Artisan Gallery',
    description: 'Display name for the seller profile',
  })
  displayName: string;

  @ApiProperty({
    example: 'Contemporary artist specializing in abstract paintings',
    required: false,
    description: 'Biography or description of the seller',
  })
  @IsOptional()
  bio?: string | null;

  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    required: false,
    description: 'URL to profile image',
  })
  @IsOptional()
  profileImageUrl?: string | null;

  @ApiProperty({
    example: 'https://example.com/cover.jpg',
    required: false,
    description: 'URL to cover image',
  })
  @IsOptional()
  coverImageUrl?: string | null;

  @ApiProperty({
    example: 'https://artisan-gallery.com',
    required: false,
    description: 'Personal website URL',
  })
  @IsOptional()
  websiteUrl?: string | null;

  @ApiProperty({
    example: 'Ho Chi Minh City, Vietnam',
    required: false,
    description: 'Location of the seller',
  })
  @IsOptional()
  location?: string | null;

  @ApiProperty({
    example: true,
    description: 'Whether Stripe onboarding is completed',
  })
  stripeOnboardingComplete: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether PayPal onboarding is completed',
  })
  paypalOnboardingComplete: boolean;

  @ApiProperty({
    example: 'https://instagram.com/artisan_gallery',
    required: false,
    description: 'Instagram profile URL',
  })
  @IsOptional()
  instagramUrl?: string | null;

  @ApiProperty({
    example: 'https://facebook.com/artisan.gallery',
    required: false,
    description: 'Facebook page URL',
  })
  @IsOptional()
  facebookUrl?: string | null;

  @ApiProperty({
    example: 'https://twitter.com/artisan_gallery',
    required: false,
    description: 'Twitter profile URL',
  })
  @IsOptional()
  twitterUrl?: string | null;

  @ApiProperty({
    example: 'https://linkedin.com/in/artisan-gallery',
    required: false,
    description: 'LinkedIn profile URL',
  })
  @IsOptional()
  linkedinUrl?: string | null;

  @ApiProperty({
    example: '+84123456789',
    required: false,
    description: 'Business phone number',
  })
  @IsOptional()
  businessPhone?: string | null;

  @ApiProperty({
    type: () => BusinessAddress,
    required: false,
    description: 'Business address information',
  })
  @IsOptional()
  businessAddress?: BusinessAddress | null;

  @ApiProperty({ example: true, description: 'Whether the profile is active' })
  isActive: boolean;

  @ApiProperty({
    example: true,
    description: 'Whether the profile is verified by admin',
  })
  isVerified: boolean;

  @ApiProperty({
    example: '2026-01-09T07:00:00.000Z',
    required: false,
    description: 'Timestamp when the profile was verified',
  })
  @IsOptional()
  verifiedAt?: Date | null;

  @ApiProperty({ example: 25, description: 'Number of artworks sold' })
  soldArtworkCount: number;

  @ApiProperty({ example: '150000.00', description: 'Total sales amount' })
  totalSales: string;

  @ApiProperty({
    example: '4.8',
    required: false,
    description: 'Average rating from reviews',
  })
  @IsOptional()
  averageRating?: string | null;

  @ApiProperty({
    example: false,
    description: 'Whether the profile is featured on homepage',
  })
  isFeatured: boolean;

  @ApiProperty({
    example:
      'Contemporary art gallery specializing in abstract and modern pieces',
    required: false,
    description: 'SEO meta description',
  })
  @IsOptional()
  metaDescription?: string | null;

  @ApiProperty({
    type: [String],
    example: ['tag-uuid-1', 'tag-uuid-2', 'tag-uuid-3'],
    required: false,
    description: 'Array of Tag IDs from artwork-service Tag table',
  })
  @IsOptional()
  tagIds?: string[] | null;

  @ApiProperty({
    example: '2026-01-01T00:00:00.000Z',
    description: 'Profile creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-01-09T07:00:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}

export class SellerWebsitePayload {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique website identifier',
  })
  websiteId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'Seller profile ID',
  })
  sellerId: string;

  @ApiProperty({
    example: 'portfolio',
    description: 'Type of website (portfolio, shop, blog, etc.)',
  })
  websiteType: string;

  @ApiProperty({
    example: 'My Portfolio',
    description: 'Title of the website link',
  })
  title: string;

  @ApiProperty({
    example: 'https://myportfolio.com',
    description: 'Website URL',
  })
  url: string;

  @ApiProperty({
    example: 'My personal art portfolio and gallery',
    required: false,
    description: 'Description of the website',
  })
  @IsOptional()
  description?: string | null;

  @ApiProperty({
    example: 'https://example.com/icon.png',
    required: false,
    description: 'Icon or favicon URL',
  })
  @IsOptional()
  icon?: string | null;

  @ApiProperty({ example: 1, description: 'Display order for sorting' })
  displayOrder: number;

  @ApiProperty({
    example: true,
    description: 'Whether the website link is visible',
  })
  isVisible: boolean;

  @ApiProperty({
    example: '2026-01-01T00:00:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-01-09T07:00:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}

export class SellerProfileWithRelationsPayload extends SellerProfilePayload {
  @ApiProperty({
    type: [SellerWebsitePayload],
    required: false,
    description: 'Associated websites for this seller profile',
  })
  @IsOptional()
  websites?: SellerWebsitePayload[];
}

export class PaginatedSellerProfilesPayload {
  @ApiProperty({
    type: [SellerProfilePayload],
    description: 'Array of seller profiles',
  })
  items: SellerProfilePayload[];

  @ApiProperty({
    example: 100,
    description: 'Total number of profiles matching criteria',
  })
  total: number;

  @ApiProperty({ example: 0, description: 'Number of items skipped' })
  skip: number;

  @ApiProperty({ example: 20, description: 'Number of items returned' })
  take: number;

  @ApiProperty({
    example: true,
    description: 'Whether more items are available',
  })
  hasMore: boolean;
}

export class CreateSellerProfileResponse {
  @ApiProperty({
    example: true,
    description: 'Whether the profile was created successfully',
  })
  success: boolean;

  @ApiProperty({
    example: 'Seller profile created successfully',
    description: 'Response message',
  })
  message: string;

  @ApiProperty({
    type: () => SellerProfilePayload,
    description: 'The created seller profile',
  })
  sellerProfile: SellerProfilePayload;
}

export class UpdateSellerProfileResponse {
  @ApiProperty({
    example: true,
    description: 'Whether the profile was updated successfully',
  })
  success: boolean;

  @ApiProperty({
    example: 'Seller profile updated successfully',
    description: 'Response message',
  })
  message: string;

  @ApiProperty({
    type: () => SellerProfilePayload,
    description: 'The updated seller profile',
  })
  sellerProfile: SellerProfilePayload;
}

export class DeleteSellerProfileResponse {
  @ApiProperty({
    example: true,
    description: 'Whether the profile was deleted successfully',
  })
  success: boolean;

  @ApiProperty({
    example: 'Seller profile deleted successfully',
    description: 'Response message',
  })
  message: string;
}

export class SellerProfileOperationResponse {
  @ApiProperty({
    example: true,
    description: 'Whether the operation was successful',
  })
  success: boolean;

  @ApiProperty({
    example: 'Operation completed successfully',
    description: 'Response message',
  })
  message: string;
}
