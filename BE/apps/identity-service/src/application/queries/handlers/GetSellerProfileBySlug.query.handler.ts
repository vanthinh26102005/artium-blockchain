import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { GetSellerProfileBySlugQuery } from '../GetSellerProfileBySlug.query';
import { ISellerProfileRepository } from '../../../domain/interfaces/seller-profile.repository.interface';
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
  ) {}

  async execute(
    query: GetSellerProfileBySlugQuery,
  ): Promise<SellerProfile | null> {
    const { slug } = query;

    if (!slug) {
      throw RpcExceptionHelper.badRequest('Slug is required');
    }

    this.logger.debug(`Fetching seller profile by slug: ${slug}`);

    const profile = await this.sellerProfileRepository.findBySlug(slug);

    if (!profile) {
      this.logger.debug(`Seller profile not found for slug: ${slug}`);
    }

    return profile;
  }
}
