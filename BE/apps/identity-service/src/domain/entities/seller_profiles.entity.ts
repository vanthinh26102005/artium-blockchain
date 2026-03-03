import { AbstractEntity, ProfileType } from '@app/common';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BusinessAddress } from '../dtos/bussiness-addess.object';
import { SellerWebsite } from './seller_websites.entity';

@Entity({ name: 'seller_profiles' })
@Index(['slug'], { unique: true })
@Index(['userId'], { unique: true })
@Index(['displayName'])
@Index(['isActive', 'profileType', 'isVerified'])
@Index(['isFeatured', 'isActive'])
export class SellerProfile extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'profile_id' })
  id!: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId!: string;

  @Column({
    name: 'profile_type',
    type: 'enum',
    enum: ProfileType,
    default: ProfileType.INDIVIDUAL,
  })
  profileType!: ProfileType;

  @Column({ name: 'display_name', type: 'varchar', length: 255 })
  displayName!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({
    name: 'profile_image_url',
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  profileImageUrl: string | null;

  @Column({
    name: 'cover_image_url',
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  coverImageUrl: string | null;

  @Column({
    name: 'website_url',
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  websiteUrl: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string | null;

  @Column({
    name: 'stripe_account_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  stripeAccountId: string | null;

  @Column({
    name: 'paypal_merchant_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  paypalMerchantId: string | null;

  @Column({
    name: 'instagram_url',
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  instagramUrl: string | null;

  @Column({
    name: 'facebook_url',
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  facebookUrl: string | null;

  @Column({
    name: 'twitter_url',
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  twitterUrl: string | null;

  @Column({
    name: 'linkedin_url',
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  linkedinUrl: string | null;

  @Column({
    name: 'business_registration',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  businessRegistration: string | null;

  @Column({ name: 'tax_id', type: 'varchar', length: 255, nullable: true })
  taxId: string | null;

  @Column({ name: 'business_address', type: 'jsonb', nullable: true })
  businessAddress: BusinessAddress | null;

  @Column({
    name: 'business_phone',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  businessPhone: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified!: boolean;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt: Date | null;

  @Column({
    name: 'stripe_onboarding_complete',
    type: 'boolean',
    default: false,
  })
  stripeOnboardingComplete!: boolean;

  @Column({
    name: 'paypal_onboarding_complete',
    type: 'boolean',
    default: false,
  })
  paypalOnboardingComplete!: boolean;

  @Column({ name: 'sold_artwork_count', type: 'int', default: 0 })
  soldArtworkCount!: number;

  @Column({
    name: 'total_sales',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalSales!: string;

  @Column({
    name: 'average_rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    nullable: true,
  })
  averageRating: string | null;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured!: boolean;

  @Column({
    name: 'meta_description',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  metaDescription: string | null;

  @Column({ name: 'tag_ids', type: 'jsonb', nullable: true })
  tagIds: string[] | null; // Array of Tag UUIDs from artwork-service

  @OneToMany(() => SellerWebsite, (website) => website.sellerProfile, {
    cascade: true,
  })
  websites: SellerWebsite[];
}
