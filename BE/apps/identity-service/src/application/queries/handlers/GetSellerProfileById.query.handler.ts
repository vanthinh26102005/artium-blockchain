import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { GetSellerProfileByIdQuery } from '../GetSellerProfileById.query';
import { ISellerProfileRepository } from '../../../domain/interfaces/seller-profile.repository.interface';
import { SellerProfile } from '../../../domain/entities/seller_profiles.entity';

/**
 * Query handler for retrieving a seller profile by ID
 *
 * Returns:
 * - SellerProfile entity if found
 * - null if not found
 *
 * Use Cases:
 * - Fetching profile for updates
 * - Admin viewing profile details
 * - System operations requiring profile data
 */
@QueryHandler(GetSellerProfileByIdQuery)
export class GetSellerProfileByIdHandler implements IQueryHandler<
  GetSellerProfileByIdQuery,
  SellerProfile | null
> {
  private readonly logger = new Logger(GetSellerProfileByIdHandler.name);

  constructor(
    @Inject(ISellerProfileRepository)
    private readonly sellerProfileRepository: ISellerProfileRepository,
  ) {}

  async execute(
    query: GetSellerProfileByIdQuery,
  ): Promise<SellerProfile | null> {
    const { profileId } = query;

    if (!profileId) {
      throw RpcExceptionHelper.badRequest('Profile ID is required');
    }

    this.logger.debug(`Fetching seller profile by ID: ${profileId}`);

    const profile = await this.sellerProfileRepository.findById(profileId);

    if (!profile) {
      this.logger.debug(`Seller profile not found: ${profileId}`);
    }

    return profile;
  }
}
