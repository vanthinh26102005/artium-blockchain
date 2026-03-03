import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GetFeaturedSellerProfilesQuery } from '../GetFeaturedSellerProfiles.query';
import { ISellerProfileRepository } from '../../../domain/interfaces/seller-profile.repository.interface';
import { SellerProfile } from '../../../domain/entities/seller_profiles.entity';

/**
 * Query handler for retrieving featured seller profiles
 *
 * Returns:
 * - Array of featured seller profiles
 * - Only verified, active sellers marked as featured
 *
 * Use Cases:
 * - Homepage featured sellers carousel
 * - Marketing campaigns
 * - Curated seller recommendations
 */
@QueryHandler(GetFeaturedSellerProfilesQuery)
export class GetFeaturedSellerProfilesHandler implements IQueryHandler<
  GetFeaturedSellerProfilesQuery,
  SellerProfile[]
> {
  private readonly logger = new Logger(GetFeaturedSellerProfilesHandler.name);

  constructor(
    @Inject(ISellerProfileRepository)
    private readonly sellerProfileRepository: ISellerProfileRepository,
  ) {}

  async execute(
    query: GetFeaturedSellerProfilesQuery,
  ): Promise<SellerProfile[]> {
    const { limit } = query;

    this.logger.debug(`Fetching featured seller profiles, limit: ${limit}`);

    const profiles =
      await this.sellerProfileRepository.getFeaturedProfiles(limit);

    this.logger.debug(`Found ${profiles.length} featured seller profiles`);

    return profiles;
  }
}
