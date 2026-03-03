import { IRepository, ProfileType } from '@app/common';
import { EntityManager } from 'typeorm';
import { SellerProfile } from '../entities/seller_profiles.entity';
import {
  CreateSellerProfileInput,
  UpdateSellerProfileInput,
} from '../dtos/seller-profile.input';

export const ISellerProfileRepository = Symbol('ISellerProfileRepository');

export interface ISellerProfileRepository extends IRepository<
  SellerProfile,
  string
> {
  create(
    data: CreateSellerProfileInput,
    transactionManager?: EntityManager,
  ): Promise<SellerProfile>;

  update(
    profileId: string,
    data: UpdateSellerProfileInput,
    transactionManager?: EntityManager,
  ): Promise<SellerProfile | null>;

  softDelete(
    profileId: string,
    transactionManager?: EntityManager,
  ): Promise<SellerProfile | null>;

  updatePaymentOnboarding(
    profileId: string,
    provider: 'stripe' | 'paypal',
    accountId?: string,
    onboardingComplete?: boolean,
    transactionManager?: EntityManager,
  ): Promise<SellerProfile | null>;

  updateVerificationStatus(
    profileId: string,
    isVerified: boolean,
    verifiedBy?: string,
    transactionManager?: EntityManager,
  ): Promise<SellerProfile | null>;

  updateVisibility(
    profileId: string,
    isActive: boolean,
    isFeatured?: boolean,
    transactionManager?: EntityManager,
  ): Promise<SellerProfile | null>;

  updateSalesStats(
    profileId: string,
    salesAmount: number,
    transactionManager?: EntityManager,
  ): Promise<void>;

  updateAverageRating(
    profileId: string,
    averageRating: number,
    transactionManager?: EntityManager,
  ): Promise<void>;

  findByUserId(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<SellerProfile | null>;

  findBySlug(
    slug: string,
    transactionManager?: EntityManager,
  ): Promise<SellerProfile | null>;

  findByStripeAccountId(
    stripeAccountId: string,
    transactionManager?: EntityManager,
  ): Promise<SellerProfile | null>;

  findWithFilters(
    filters: {
      profileType?: ProfileType;
      isActive?: boolean;
      isVerified?: boolean;
      isFeatured?: boolean;
      location?: string;
      searchQuery?: string;
    },
    skip?: number,
    take?: number,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
    transactionManager?: EntityManager,
  ): Promise<{ items: SellerProfile[]; total: number }>;

  isSlugTaken(
    slug: string,
    excludeProfileId?: string,
    transactionManager?: EntityManager,
  ): Promise<boolean>;

  getFeaturedProfiles(
    limit?: number,
    transactionManager?: EntityManager,
  ): Promise<SellerProfile[]>;
}
