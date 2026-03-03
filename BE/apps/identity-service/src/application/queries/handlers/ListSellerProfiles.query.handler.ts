import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ListSellerProfilesQuery } from '../ListSellerProfiles.query';
import { ISellerProfileRepository } from '../../../domain/interfaces/seller-profile.repository.interface';
import { SellerProfile } from '../../../domain/entities/seller_profiles.entity';

export interface ListSellerProfilesResult {
  items: SellerProfile[];
  total: number;
  skip: number;
  take: number;
  hasMore: boolean;
}

@QueryHandler(ListSellerProfilesQuery)
export class ListSellerProfilesHandler implements IQueryHandler<
  ListSellerProfilesQuery,
  ListSellerProfilesResult
> {
  private readonly logger = new Logger(ListSellerProfilesHandler.name);

  constructor(
    @Inject(ISellerProfileRepository)
    private readonly sellerProfileRepository: ISellerProfileRepository,
  ) {}

  async execute(
    query: ListSellerProfilesQuery,
  ): Promise<ListSellerProfilesResult> {
    const { filters, skip, take, sortBy, sortOrder } = query;

    this.logger.debug(
      `Listing seller profiles with filters: ${JSON.stringify(filters)}`,
    );

    const { items, total } = await this.sellerProfileRepository.findWithFilters(
      filters,
      skip,
      take,
      sortBy,
      sortOrder,
    );

    const hasMore = skip + items.length < total;

    this.logger.debug(
      `Found ${items.length} seller profiles out of ${total} total`,
    );

    return {
      items,
      total,
      skip,
      take,
      hasMore,
    };
  }
}
