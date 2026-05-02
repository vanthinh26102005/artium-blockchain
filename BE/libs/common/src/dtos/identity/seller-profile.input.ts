import { BusinessAddressInput } from '../users/input';
import { ProfileType } from '../../enums/profile-type.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateSellerProfileInput {
  userId?: string;
  profileType?: ProfileType;
  displayName?: string;
  bio?: string | null;
  profileImageUrl?: string | null;
  coverImageUrl?: string | null;
  websiteUrl?: string | null;
  location?: string | null;
  stripeAccountId?: string | null;
  paypalMerchantId?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
  businessRegistration?: string | null;
  taxId?: string | null;
  businessAddress?: BusinessAddressInput | null;
  businessPhone?: string | null;
  isActive?: boolean;
  isVerified?: boolean;
  verifiedAt?: Date | null;
  stripeOnboardingComplete?: boolean;
  paypalOnboardingComplete?: boolean;
  isFeatured?: boolean;
  metaDescription?: string | null;
  tagIds?: string[] | null;
}

export class UpdateSellerProfileInput {
  profileType?: ProfileType;
  displayName?: string;
  bio?: string | null;
  profileImageUrl?: string | null;
  coverImageUrl?: string | null;
  websiteUrl?: string | null;
  location?: string | null;
  stripeAccountId?: string | null;
  paypalMerchantId?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
  businessRegistration?: string | null;
  taxId?: string | null;
  businessAddress?: BusinessAddressInput | null;
  businessPhone?: string | null;
  isActive?: boolean;
  isVerified?: boolean;
  verifiedAt?: Date | null;
  stripeOnboardingComplete?: boolean;
  paypalOnboardingComplete?: boolean;
  isFeatured?: boolean;
  metaDescription?: string | null;
  tagIds?: string[] | null;
}

export class CreateSellerProfileInputType {
  @ApiProperty({
    enum: ProfileType,
    example: ProfileType.INDIVIDUAL,
    description: 'Type of seller profile (INDIVIDUAL, BUSINESS, ARTIST, etc.)',
  })
  @IsEnum(ProfileType)
  @IsNotEmpty()
  profileType: ProfileType;

  @ApiProperty({
    example: 'Artisan Gallery',
    description: 'Display name for the seller profile',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  displayName: string;

  @ApiProperty({
    example:
      'Contemporary artist specializing in abstract paintings and modern art',
    required: false,
    description: 'Biography or description of the seller',
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    required: false,
    description: 'URL to profile image',
  })
  @IsUrl()
  @IsOptional()
  profileImageUrl?: string;

  @ApiProperty({
    example: 'https://my-art-website.com',
    required: false,
    description: 'Personal website URL',
  })
  @IsUrl()
  @IsOptional()
  websiteUrl?: string;

  @ApiProperty({
    example: 'Ho Chi Minh City, Vietnam',
    required: false,
    description: 'Location of the seller',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;

  @ApiProperty({
    type: () => BusinessAddressInput,
    required: false,
    description: 'Business address information',
  })
  @IsOptional()
  businessAddress?: BusinessAddressInput | null;

  @ApiProperty({
    example:
      'Contemporary art gallery specializing in abstract and modern pieces',
    required: false,
    description: 'SEO meta description',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  metaDescription?: string;

  @ApiProperty({
    type: [String],
    example: ['tag-uuid-1', 'tag-uuid-2', 'tag-uuid-3'],
    required: false,
    description: 'Array of Tag IDs from artwork-service Tag table',
  })
  @IsOptional()
  tagIds?: string[];
}

export class UpdateSellerProfileInputType {
  @ApiProperty({
    enum: ProfileType,
    example: ProfileType.INDIVIDUAL,
    required: false,
    description: 'Type of seller profile',
  })
  @IsEnum(ProfileType)
  @IsOptional()
  profileType?: ProfileType;

  @ApiProperty({
    example: 'Updated Gallery Name',
    required: false,
    description: 'Display name for the seller profile',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  displayName?: string;

  @ApiProperty({
    example:
      'Updated biography with more details about the artist and their work',
    required: false,
    description: 'Biography or description',
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({
    example: 'https://example.com/new-profile.jpg',
    required: false,
    description: 'URL to profile image',
  })
  @IsUrl()
  @IsOptional()
  profileImageUrl?: string;

  @ApiProperty({
    example: 'https://example.com/cover.jpg',
    required: false,
    description: 'URL to cover image',
  })
  @IsUrl()
  @IsOptional()
  coverImageUrl?: string;

  @ApiProperty({
    example: 'https://my-art-website.com',
    required: false,
    description: 'Personal website URL',
  })
  @IsUrl()
  @IsOptional()
  websiteUrl?: string;

  @ApiProperty({
    example: 'Ho Chi Minh City, Vietnam',
    required: false,
    description: 'Location of the seller',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;

  @ApiProperty({
    example: 'https://instagram.com/artisan_gallery',
    required: false,
    description: 'Instagram profile URL',
  })
  @IsUrl()
  @IsOptional()
  instagramUrl?: string;

  @ApiProperty({
    example: 'https://facebook.com/artisan.gallery',
    required: false,
    description: 'Facebook page URL',
  })
  @IsUrl()
  @IsOptional()
  facebookUrl?: string;

  @ApiProperty({
    example: 'https://twitter.com/artisan_gallery',
    required: false,
    description: 'Twitter profile URL',
  })
  @IsUrl()
  @IsOptional()
  twitterUrl?: string;

  @ApiProperty({
    example: 'https://linkedin.com/in/artisan-gallery',
    required: false,
    description: 'LinkedIn profile URL',
  })
  @IsUrl()
  @IsOptional()
  linkedinUrl?: string;

  @ApiProperty({
    example: '0123456789',
    required: false,
    description: 'Business registration number',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  businessRegistration?: string;

  @ApiProperty({
    example: '0123456789-001',
    required: false,
    description: 'Tax identification number',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  taxId?: string;

  @ApiProperty({
    example: '+84123456789',
    required: false,
    description: 'Business phone number',
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  businessPhone?: string;

  @ApiProperty({
    type: () => BusinessAddressInput,
    required: false,
    description: 'Business address information',
  })
  @IsOptional()
  businessAddress?: BusinessAddressInput | null;

  @ApiProperty({
    example: true,
    required: false,
    description: 'Whether the profile is active',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: 'Professional art gallery in Ho Chi Minh City',
    required: false,
    description: 'SEO meta description',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  metaDescription?: string;

  @ApiProperty({
    type: [String],
    example: ['tag-uuid-4', 'tag-uuid-5', 'tag-uuid-6'],
    required: false,
    description: 'Array of Tag IDs from artwork-service Tag table',
  })
  @IsOptional()
  tagIds?: string[];
}

export class UpdatePaymentOnboardingInput {
  @ApiProperty({
    example: 'acct_1234567890',
    required: false,
    description: 'Stripe connected account ID',
  })
  @IsString()
  @IsOptional()
  stripeAccountId?: string;

  @ApiProperty({
    example: true,
    required: false,
    description: 'Whether Stripe onboarding is completed',
  })
  @IsBoolean()
  @IsOptional()
  stripeOnboardingComplete?: boolean;

  @ApiProperty({
    example: 'MERCHANT123456',
    required: false,
    description: 'PayPal merchant ID',
  })
  @IsString()
  @IsOptional()
  paypalMerchantId?: string;

  @ApiProperty({
    example: false,
    required: false,
    description: 'Whether PayPal onboarding is completed',
  })
  @IsBoolean()
  @IsOptional()
  paypalOnboardingComplete?: boolean;
}

export class UpdateVerificationStatusInput {
  @ApiProperty({
    example: true,
    description: 'Whether the seller profile is verified by admin',
  })
  @IsBoolean()
  @IsNotEmpty()
  isVerified: boolean;

  @ApiProperty({
    example: 'Verified after reviewing business documents and portfolio',
    required: false,
    description: 'Admin notes about the verification',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  verificationNotes?: string;
}

export class UpdateProfileVisibilityInput {
  @ApiProperty({
    example: true,
    description: 'Whether the profile is active and visible to public',
  })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @ApiProperty({
    example: false,
    required: false,
    description: 'Whether the profile is featured on homepage (admin only)',
  })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}

export class ListSellerProfilesInput {
  @ApiProperty({
    enum: ProfileType,
    example: ProfileType.INDIVIDUAL,
    required: false,
    description: 'Filter by profile type',
  })
  @IsEnum(ProfileType)
  @IsOptional()
  profileType?: ProfileType;

  @ApiProperty({
    example: true,
    required: false,
    description: 'Filter by active status',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: true,
    required: false,
    description: 'Filter by verified status',
  })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @ApiProperty({
    example: false,
    required: false,
    description: 'Filter by featured status',
  })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiProperty({
    example: 'Ho Chi Minh City',
    required: false,
    description: 'Filter by location',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    example: 'contemporary art',
    required: false,
    description: 'Search query for display name and bio',
  })
  @IsString()
  @IsOptional()
  searchQuery?: string;

  @ApiProperty({
    example: 0,
    required: false,
    default: 0,
    description: 'Number of records to skip for pagination',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  skip?: number;

  @ApiProperty({
    example: 20,
    required: false,
    default: 20,
    description: 'Number of records to return (max 100)',
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  take?: number;

  @ApiProperty({
    example: 'createdAt',
    required: false,
    default: 'createdAt',
    description: 'Field to sort by',
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiProperty({
    example: 'DESC',
    required: false,
    default: 'DESC',
    description: 'Sort order (ASC or DESC)',
    enum: ['ASC', 'DESC'],
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}
