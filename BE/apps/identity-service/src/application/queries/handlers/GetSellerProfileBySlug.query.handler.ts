import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { GetSellerProfileBySlugQuery } from '../GetSellerProfileBySlug.query';
import { ISellerProfileRepository } from '../../../domain/interfaces/seller-profile.repository.interface';
import { IUserRepository } from '../../../domain/interfaces/user.repository.interface';
import { SellerProfile } from '../../../domain/entities/seller_profiles.entity';

@QueryHandler(GetSellerProfileBySlugQuery)
export class GetSellerProfileBySlugHandler implements IQueryHandler<
  GetSellerProfileBySlugQuery,
  SellerProfile | null
> {
  private readonly logger = new Logger(GetSellerProfileBySlugHandler.name);

  constructor(
    @Inject(ISellerProfileRepository)
    private readonly sellerProfileRepository: ISellerProfileRepository,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    query: GetSellerProfileBySlugQuery,
  ): Promise<SellerProfile | null> {
    const { slug } = query;

    if (!slug) {
      throw RpcExceptionHelper.badRequest('Slug is required');
    }

    this.logger.debug(`Fetching seller profile by user slug: ${slug}`);

    // Slug belongs to User entity — look up user first, then find their seller profile
    const user = await this.userRepository.findBySlug(slug);
    if (!user) {
      this.logger.debug(`User not found for slug: ${slug}`);
      return null;
    }

    const profile = await this.sellerProfileRepository.findByUserId(user.id);

    if (!profile) {
      this.logger.debug(`Seller profile not found for user slug: ${slug}`);
    }

    return profile;
  }
}
