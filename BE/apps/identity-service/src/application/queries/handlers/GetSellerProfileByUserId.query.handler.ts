import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { GetSellerProfileByUserIdQuery } from '../GetSellerProfileByUserId.query';
import { ISellerProfileRepository } from '../../../domain/interfaces/seller-profile.repository.interface';
import { SellerProfile } from '../../../domain/entities/seller_profiles.entity';

@QueryHandler(GetSellerProfileByUserIdQuery)
export class GetSellerProfileByUserIdHandler implements IQueryHandler<
  GetSellerProfileByUserIdQuery,
  SellerProfile | null
> {
  private readonly logger = new Logger(GetSellerProfileByUserIdHandler.name);

  constructor(
    @Inject(ISellerProfileRepository)
    private readonly sellerProfileRepository: ISellerProfileRepository,
  ) {}

  async execute(
    query: GetSellerProfileByUserIdQuery,
  ): Promise<SellerProfile | null> {
    const { userId } = query;

    if (!userId) {
      throw RpcExceptionHelper.badRequest('User ID is required');
    }

    this.logger.debug(`Fetching seller profile by user ID: ${userId}`);

    const profile = await this.sellerProfileRepository.findByUserId(userId);

    if (!profile) {
      this.logger.debug(`No seller profile found for user: ${userId}`);
    }

    return profile;
  }
}
