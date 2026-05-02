import {
  ArtworkStatus,
  FindManyOptions,
  FindOneOptions,
  WhereOperator,
} from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { mapToTypeOrmWhere } from '@app/common';
import {
  Between,
  EntityManager,
  FindOptionsOrder,
  FindOptionsWhere,
  Like,
  Repository,
  FindManyOptions as TypeOrmFindManyOptions,
  FindOneOptions as TypeOrmFindOneOptions,
} from 'typeorm';
import { Artwork, IArtworkRepository } from '../../domain';

@Injectable()
export class ArtworkRepository implements IArtworkRepository {
  private readonly logger = new Logger(ArtworkRepository.name);
  private readonly filterableArtworkFields = new Set([
    'id',
    'sellerId',
    'creatorName',
    'title',
    'description',
    'creationYear',
    'editionRun',
    'materials',
    'location',
    'price',
    'currency',
    'quantity',
    'status',
    'isPublished',
    'folderId',
    'viewCount',
    'likeCount',
    'commentCount',
    'moodboardCount',
    'ipfsMetadataHash',
    'reservePrice',
    'minBidIncrement',
    'auctionDuration',
    'onChainAuctionId',
  ]);

  constructor(
    @InjectRepository(Artwork)
    private readonly ormRepository: Repository<Artwork>,
  ) {}

  private getRepo(transactionManager?: EntityManager): Repository<Artwork> {
    return transactionManager
      ? transactionManager.getRepository(Artwork)
      : this.ormRepository;
  }

  private sanitizeArtworkWhere(where?: Record<string, unknown>) {
    if (!where) {
      return {};
    }

    return Object.entries(where).reduce<Record<string, unknown>>(
      (acc, [key, value]) => {
        if (this.filterableArtworkFields.has(key)) {
          acc[key] = value;
        }

        return acc;
      },
      {},
    );
  }

  async create(
    data: Omit<Artwork, 'id' | 'createdAt' | 'folder'>,
    transactionManager?: EntityManager,
  ): Promise<Artwork> {
    const repo = this.getRepo(transactionManager);
    const artwork = repo.create(data);
    return repo.save(artwork);
  }

  async update(
    id: string,
    data: Partial<Artwork>,
    transactionManager?: EntityManager,
  ): Promise<Artwork | null> {
    const repo = this.getRepo(transactionManager);
    const entity = await repo.findOneBy({ id });
    if (!entity) {
      return null;
    }
    repo.merge(entity, data);
    return repo.save(entity);
  }

  async delete(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const result = await this.getRepo(transactionManager).delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findById(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<Artwork | null> {
    return this.getRepo(transactionManager).findOneBy({ id });
  }

  async findOne(
    options: FindOneOptions<Artwork>,
    transactionManager?: EntityManager,
  ): Promise<Artwork | null> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindOneOptions<Artwork> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<Artwork>,
    };
    return this.getRepo(transactionManager).findOne(typeOrmOptions);
  }

  async find(
    options: FindManyOptions<Artwork> = {},
    transactionManager?: EntityManager,
  ): Promise<Artwork[]> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindManyOptions<Artwork> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<Artwork>,
    };
    return this.getRepo(transactionManager).find(typeOrmOptions);
  }

  async findAndCount(
    options: FindManyOptions<Artwork> & {
      searchQuery?: string;
      minPrice?: number;
      maxPrice?: number;
      includeSellerAuctionLifecycle?: unknown;
    } = {},
    transactionManager?: EntityManager,
  ): Promise<[Artwork[], number]> {
    const {
      where,
      orderBy,
      searchQuery,
      minPrice,
      maxPrice,
      includeSellerAuctionLifecycle: _includeSellerAuctionLifecycle,
      ...rest
    } = options;

    const safeWhere = this.sanitizeArtworkWhere(
      where as Record<string, unknown> | undefined,
    );

    let typeOrmWhere: FindOptionsWhere<Artwork> | FindOptionsWhere<Artwork>[] =
      mapToTypeOrmWhere(safeWhere as WhereOperator<Artwork>);

    // Handle search query - search across title, description, materials, and creatorName
    if (searchQuery) {
      const searchPattern = `%${searchQuery}%`;
      const baseWhere = mapToTypeOrmWhere(safeWhere as WhereOperator<Artwork>);

      // Create an array of search conditions (OR logic)
      typeOrmWhere = [
        { ...baseWhere, title: Like(searchPattern) },
        { ...baseWhere, description: Like(searchPattern) },
        { ...baseWhere, materials: Like(searchPattern) },
        { ...baseWhere, creatorName: Like(searchPattern) },
      ];
    }

    // Handle price range filters
    if ((minPrice !== undefined || maxPrice !== undefined) && !searchQuery) {
      const baseWhere = typeOrmWhere as FindOptionsWhere<Artwork>;
      if (minPrice !== undefined && maxPrice !== undefined) {
        typeOrmWhere = {
          ...baseWhere,
          price: Between(minPrice.toString(), maxPrice.toString()),
        };
      } else if (minPrice !== undefined) {
        // For minimum price only, we'd need to use query builder for proper >= comparison
        // For now, just pass through
      } else if (maxPrice !== undefined) {
        // For maximum price only, we'd need to use query builder for proper <= comparison
        // For now, just pass through
      }
    }

    const typeOrmOptions: TypeOrmFindManyOptions<Artwork> = {
      ...rest,
      where: typeOrmWhere,
      order: orderBy as FindOptionsOrder<Artwork>,
    };

    return this.getRepo(transactionManager).findAndCount(typeOrmOptions);
  }

  async count(
    where?: WhereOperator<Artwork>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    return this.getRepo(transactionManager).count({ where: typeOrmWhere });
  }

  async exists(
    where: WhereOperator<Artwork>,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const typeOrmWhere = mapToTypeOrmWhere(where);

    const repo = this.getRepo(transactionManager);
    if ('exists' in repo) {
      return repo.exists({ where: typeOrmWhere });
    }

    return (repo as any).exists({ where: typeOrmWhere });
  }

  async incrementLikeCount(
    artworkId: string,
    increment: number,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(transactionManager);
    await repo.increment({ id: artworkId }, 'likeCount', increment);
  }

  async createMany(
    data: Omit<Artwork, 'id' | 'createdAt' | 'updatedAt'>[],
    transactionManager?: EntityManager,
  ): Promise<Artwork[]> {
    return this.getRepo(transactionManager).save(data);
  }

  async updateMany(
    where: WhereOperator<Artwork>,
    data: Partial<Artwork>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    const result = await this.getRepo(transactionManager).update(
      typeOrmWhere,
      data as any,
    );
    return result.affected ?? 0;
  }

  async deleteMany(
    where: WhereOperator<Artwork>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    const result = await this.getRepo(transactionManager).delete(typeOrmWhere);
    return result.affected ?? 0;
  }

  async findManyBySellerId(
    sellerId: string,
    options: FindManyOptions<Artwork> = {},
    transactionManager?: EntityManager,
  ): Promise<Artwork[]> {
    const existingWhere = options.where || {};
    const mergedWhere = {
      ...existingWhere,
      sellerId,
    } as WhereOperator<Artwork>;

    return this.find({ ...options, where: mergedWhere }, transactionManager);
  }

  async findManyByFolderId(
    folderId: string,
    options: FindManyOptions<Artwork> = {},
    transactionManager?: EntityManager,
  ): Promise<Artwork[]> {
    const existingWhere = options.where || {};
    const mergedWhere = {
      ...existingWhere,
      folder: { id: folderId },
    } as WhereOperator<Artwork>;

    return this.find({ ...options, where: mergedWhere }, transactionManager);
  }

  async updateStatus(
    artworkIds: string[],
    status: ArtworkStatus,
    transactionManager?: EntityManager,
  ): Promise<number> {
    if (artworkIds.length === 0) {
      return 0;
    }
    return this.updateMany(
      { id: { $in: artworkIds } },
      { status },
      transactionManager,
    );
  }

  async markAsSold(
    artworkId: string,
    quantitySold = 1,
    transactionManager?: EntityManager,
  ): Promise<Artwork | null> {
    const repo = this.getRepo(transactionManager);
    const artwork = await repo.findOneBy({ id: artworkId });

    if (!artwork) {
      return null;
    }

    const newQuantity = artwork.quantity - quantitySold;
    artwork.quantity = Math.max(0, newQuantity);
    artwork.status = ArtworkStatus.SOLD;

    return repo.save(artwork);
  }

  async search(
    sellerId: string,
    query: string,
    options: FindManyOptions<Artwork> = {},
    transactionManager?: EntityManager,
  ): Promise<Artwork[]> {
    const repo = this.getRepo(transactionManager);
    const searchQuery = `%${query}%`;

    // Base `where` conditions for the search
    const searchConditions: FindOptionsWhere<Artwork>[] = [
      { sellerId, title: Like(searchQuery) },
      { sellerId, description: Like(searchQuery) },
      { sellerId, materials: Like(searchQuery) },
      { sellerId, creatorName: Like(searchQuery) },
    ];

    const typeOrmOptions: TypeOrmFindManyOptions<Artwork> = {
      ...options,
      where: searchConditions,
      order: options.orderBy as FindOptionsOrder<Artwork>,
    };

    return repo.find(typeOrmOptions);
  }

  async findManyByTags(
    sellerId: string,
    tagIds: string[],
    options: { match?: 'all' | 'any' } = { match: 'any' },
    findOptions: FindManyOptions<Artwork> = {},
    transactionManager?: EntityManager,
  ): Promise<Artwork[]> {
    if (tagIds.length === 0) {
      return [];
    }

    const repo = this.getRepo(transactionManager);
    const qb = repo.createQueryBuilder('artwork');

    qb.innerJoin('artwork.tags', 'tag')
      .where('artwork.sellerId = :sellerId', { sellerId })
      .andWhere('tag.id IN (:...tagIds)', { tagIds });

    if (options.match === 'all') {
      qb.groupBy('artwork.id').having('COUNT(DISTINCT tag.tagId) = :tagCount', {
        tagCount: tagIds.length,
      });
    } else {
      // For 'any', the join and where clause are sufficient. We just need to ensure distinct artworks.
      qb.groupBy('artwork.id');
    }

    // Apply ordering
    if (findOptions.orderBy) {
      Object.entries(findOptions.orderBy).forEach(([key, value]) => {
        qb.addOrderBy(`artwork.${key}`, value.toUpperCase() as 'ASC' | 'DESC');
      });
    }

    // Apply pagination
    if (findOptions.skip) qb.skip(findOptions.skip);
    if (findOptions.take) qb.take(findOptions.take);

    return qb.getMany();
  }

  async findByPriceRange(
    sellerId: string,
    minPrice: number,
    maxPrice: number,
    currency: string,
    options: FindManyOptions<Artwork> = {},
    transactionManager?: EntityManager,
  ): Promise<Artwork[]> {
    const where: FindOptionsWhere<Artwork> = {
      ...mapToTypeOrmWhere(options.where),
      sellerId,
      currency,
      price: Between(minPrice.toString(), maxPrice.toString()),
    };

    return this.getRepo(transactionManager).find({
      ...options,
      where,
    });
  }

  async countByStatus(
    sellerId: string,
    transactionManager?: EntityManager,
  ): Promise<Record<ArtworkStatus, number>> {
    const repo = this.getRepo(transactionManager);

    const counts = await repo
      .createQueryBuilder('artwork')
      .select('artwork.status', 'status')
      .addSelect('COUNT(artwork.id)', 'count')
      .where('artwork.sellerId = :sellerId', { sellerId })
      .groupBy('artwork.status')
      .getRawMany();

    // Initialize result with all statuses set to 0
    const result: Record<string, number> = {};
    for (const status of Object.values(ArtworkStatus)) {
      result[status] = 0;
    }

    // Populate with actual counts from the query
    for (const item of counts) {
      result[item.status] = parseInt(item.count, 10);
    }

    return result as Record<ArtworkStatus, number>;
  }
}
