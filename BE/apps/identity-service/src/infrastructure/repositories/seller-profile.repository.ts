import {
  FindManyOptions,
  FindOneOptions,
  WhereOperator,
  mapToTypeOrmWhere,
} from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  FindOptionsOrder,
  Repository,
  FindManyOptions as TypeOrmFindManyOptions,
  FindOneOptions as TypeOrmFindOneOptions,
  ILike,
} from 'typeorm';
import { SellerProfile } from '../../domain/entities/seller_profiles.entity';
import { ISellerProfileRepository } from '../../domain/interfaces/seller-profile.repository.interface';
import {
  CreateSellerProfileInput,
  UpdateSellerProfileInput,
} from '../../domain/dtos/seller-profile.input';

@Injectable()
export class SellerProfileRepository implements ISellerProfileRepository {
  private readonly logger = new Logger(SellerProfileRepository.name);

  constructor(
    @InjectRepository(SellerProfile)
    private readonly ormRepository: Repository<SellerProfile>,
  ) {}

  private getRepo(
    transactionManager?: EntityManager,
  ): Repository<SellerProfile> {
    return transactionManager
      ? transactionManager.getRepository(SellerProfile)
      : this.ormRepository;
  }

  async create(
    data: CreateSellerProfileInput,
    transactionManager?: EntityManager,
  ): Promise<SellerProfile> {
    const repo = this.getRepo(transactionManager);
    this.logger.debug(`Creating seller profile for userId: ${data.userId}`);
    return repo.save(data);
  }

  async update(
    profileId: string,
    data: UpdateSellerProfileInput,
    transactionManager?: EntityManager,
  ): Promise<SellerProfile | null> {
    const repo = this.getRepo(transactionManager);

    const entity = await repo.findOneBy({ id: profileId });
    if (!entity) {
      this.logger.warn(`Seller profile not found for update: ${profileId}`);
      return null;
    }

    repo.merge(entity, data);
    this.logger.debug(`Updating seller profile: ${profileId}`);
    return repo.save(entity);
  }

  async softDelete(
    profileId: string,
    transactionManager?: EntityManager,
  ): Promise<SellerProfile | null> {
    this.logger.debug(`Soft deleting seller profile: ${profileId}`);
    return this.update(profileId, { isActive: false }, transactionManager);
  }

  async updatePaymentOnboarding(
    profileId: string,
    provider: 'stripe' | 'paypal',
    accountId?: string,
    onboardingComplete?: boolean,
    transactionManager?: EntityManager,
  ): Promise<SellerProfile | null> {
    const repo = this.getRepo(transactionManager);

    const entity = await repo.findOneBy({ id: profileId });
    if (!entity) {
      this.logger.warn(
        `Seller profile not found for payment update: ${profileId}`,
      );
      return null;
    }

    if (provider === 'stripe') {
      if (accountId !== undefined) entity.stripeAccountId = accountId;
      if (onboardingComplete !== undefined)
        entity.stripeOnboardingComplete = onboardingComplete;
    } else if (provider === 'paypal') {
      if (accountId !== undefined) entity.paypalMerchantId = accountId;
      if (onboardingComplete !== undefined)
        entity.paypalOnboardingComplete = onboardingComplete;
    }

    this.logger.debug(
      `Updating ${provider} onboarding for profile: ${profileId}`,
    );
    return repo.save(entity);
  }

  async updateVerificationStatus(
    profileId: string,
    isVerified: boolean,
    verifiedBy?: string,
    transactionManager?: EntityManager,
  ): Promise<SellerProfile | null> {
    const repo = this.getRepo(transactionManager);

    const entity = await repo.findOneBy({ id: profileId });
    if (!entity) {
      this.logger.warn(
        `Seller profile not found for verification update: ${profileId}`,
      );
      return null;
    }

    entity.isVerified = isVerified;
    entity.verifiedAt = isVerified ? new Date() : null;

    this.logger.debug(
      `Updating verification status for profile: ${profileId} - Verified: ${isVerified}`,
    );
    return repo.save(entity);
  }

  async updateVisibility(
    profileId: string,
    isActive: boolean,
    isFeatured?: boolean,
    transactionManager?: EntityManager,
  ): Promise<SellerProfile | null> {
    const repo = this.getRepo(transactionManager);

    const entity = await repo.findOneBy({ id: profileId });
    if (!entity) {
      this.logger.warn(
        `Seller profile not found for visibility update: ${profileId}`,
      );
      return null;
    }

    entity.isActive = isActive;
    if (isFeatured !== undefined) {
      entity.isFeatured = isFeatured;
    }

    this.logger.debug(`Updating visibility for profile: ${profileId}`);
    return repo.save(entity);
  }

  async updateSalesStats(
    profileId: string,
    salesAmount: number,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(transactionManager);

    const entity = await repo.findOneBy({ id: profileId });
    if (!entity) return;

    const currentTotal = parseFloat(entity.totalSales || '0');
    entity.totalSales = (currentTotal + salesAmount).toFixed(2);
    entity.soldArtworkCount += 1;

    await repo.save(entity);
    this.logger.debug(
      `Updated sales stats for profile: ${profileId} - Added: ${salesAmount}`,
    );
  }

  async updateAverageRating(
    profileId: string,
    averageRating: number,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(transactionManager);
    await repo.update(
      { id: profileId },
      {
        averageRating: averageRating.toFixed(2),
      },
    );
    this.logger.debug(
      `Updated average rating for profile: ${profileId} - Avg: ${averageRating}`,
    );
  }

  async findByUserId(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<SellerProfile | null> {
    return this.getRepo(transactionManager).findOne({
      where: { userId },
      relations: ['websites'],
    });
  }

  async findByStripeAccountId(
    stripeAccountId: string,
    transactionManager?: EntityManager,
  ): Promise<SellerProfile | null> {
    return this.getRepo(transactionManager).findOneBy({ stripeAccountId });
  }

  async findWithFilters(
    filters: {
      profileType?: string;
      isActive?: boolean;
      isVerified?: boolean;
      isFeatured?: boolean;
      location?: string;
      searchQuery?: string;
    },
    skip: number = 0,
    take: number = 20,
    sortBy: string = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
    transactionManager?: EntityManager,
  ): Promise<{ items: SellerProfile[]; total: number }> {
    const repo = this.getRepo(transactionManager);
    const queryBuilder = repo.createQueryBuilder('seller_profile');

    // Apply filters
    if (filters.profileType) {
      queryBuilder.andWhere('seller_profile.profileType = :profileType', {
        profileType: filters.profileType,
      });
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('seller_profile.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters.isVerified !== undefined) {
      queryBuilder.andWhere('seller_profile.isVerified = :isVerified', {
        isVerified: filters.isVerified,
      });
    }

    if (filters.isFeatured !== undefined) {
      queryBuilder.andWhere('seller_profile.isFeatured = :isFeatured', {
        isFeatured: filters.isFeatured,
      });
    }

    if (filters.location) {
      queryBuilder.andWhere('seller_profile.location ILIKE :location', {
        location: `%${filters.location}%`,
      });
    }

    // Full-text search on displayName and bio
    if (filters.searchQuery) {
      queryBuilder.andWhere(
        '(seller_profile.displayName ILIKE :search OR seller_profile.bio ILIKE :search)',
        { search: `%${filters.searchQuery}%` },
      );
    }

    // Apply sorting
    const validSortFields = [
      'createdAt',
      'displayName',
      'averageRating',
      'totalSales',
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`seller_profile.${sortField}`, sortOrder);

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder.skip(skip).take(take);

    // Execute query
    const items = await queryBuilder.getMany();

    return { items, total };
  }

  async getFeaturedProfiles(
    limit: number = 10,
    transactionManager?: EntityManager,
  ): Promise<SellerProfile[]> {
    const repo = this.getRepo(transactionManager);
    return repo.find({
      where: {
        isFeatured: true,
        isActive: true,
        isVerified: true,
      },
      order: {
        averageRating: 'DESC',
        totalSales: 'DESC',
      },
      take: limit,
      relations: ['websites'],
    });
  }

  // --- Base IRepository Methods ---

  async delete(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const result = await this.getRepo(transactionManager).delete({ id });
    return (result.affected ?? 0) > 0;
  }

  async findById(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<SellerProfile | null> {
    return this.getRepo(transactionManager).findOne({
      where: { id },
      relations: ['websites'],
    });
  }

  async findOne(
    options: FindOneOptions<SellerProfile>,
    transactionManager?: EntityManager,
  ): Promise<SellerProfile | null> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindOneOptions<SellerProfile> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<SellerProfile>,
    };
    return this.getRepo(transactionManager).findOne(typeOrmOptions);
  }

  async find(
    options: FindManyOptions<SellerProfile> = {},
    transactionManager?: EntityManager,
  ): Promise<SellerProfile[]> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindManyOptions<SellerProfile> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<SellerProfile>,
    };
    return this.getRepo(transactionManager).find(typeOrmOptions);
  }

  async count(
    where?: WhereOperator<SellerProfile>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    return this.getRepo(transactionManager).count({ where: typeOrmWhere });
  }

  async exists(
    where: WhereOperator<SellerProfile>,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    return this.getRepo(transactionManager).exist({ where: typeOrmWhere });
  }

  // --- Bulk Operations ---

  async createMany(
    data: Omit<SellerProfile, 'profileId'>[],
    transactionManager?: EntityManager,
  ): Promise<SellerProfile[]> {
    return this.getRepo(transactionManager).save(data);
  }

  async updateMany(
    where: WhereOperator<SellerProfile>,
    data: Partial<SellerProfile>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    const result = await this.getRepo(transactionManager).update(
      typeOrmWhere,
      data,
    );
    return result.affected ?? 0;
  }

  async deleteMany(
    where: WhereOperator<SellerProfile>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    const result = await this.getRepo(transactionManager).delete(typeOrmWhere);
    return result.affected ?? 0;
  }
}
