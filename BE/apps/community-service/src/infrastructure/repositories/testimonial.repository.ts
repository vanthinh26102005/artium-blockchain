import { FindManyOptions, FindOneOptions, mapToTypeOrmWhere, WhereOperator } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  FindOptionsOrder,
  Repository,
  FindManyOptions as TypeOrmFindManyOptions,
  FindOneOptions as TypeOrmFindOneOptions,
} from 'typeorm';
import {
  Testimonial,
  ITestimonialRepository,
  CreateTestimonialInput,
} from '../../domain';

@Injectable()
export class TestimonialRepository implements ITestimonialRepository {
  private readonly logger = new Logger(TestimonialRepository.name);

  constructor(
    @InjectRepository(Testimonial)
    private readonly ormRepository: Repository<Testimonial>,
  ) {}

  private getRepo(manager?: EntityManager): Repository<Testimonial> {
    return manager ? manager.getRepository(Testimonial) : this.ormRepository;
  }

  // --- IRepository Implementation ---

  async create(
    data: CreateTestimonialInput | Omit<Testimonial, 'id' | 'createdAt'>,
    manager?: EntityManager,
  ): Promise<Testimonial> {
    const repo = this.getRepo(manager);
    return repo.save(repo.create(data as unknown as Partial<Testimonial>));
  }

  async update(
    id: string,
    data: Partial<Testimonial>,
    manager?: EntityManager,
  ): Promise<Testimonial | null> {
    const repo = this.getRepo(manager);
    const entity = await repo.findOneBy({ id });
    if (!entity) return null;
    repo.merge(entity, data);
    return repo.save(entity);
  }

  async delete(id: string, manager?: EntityManager): Promise<boolean> {
    const repo = this.getRepo(manager);
    const result = await repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findById(
    id: string,
    manager?: EntityManager,
  ): Promise<Testimonial | null> {
    return this.getRepo(manager).findOneBy({ id });
  }

  async findOne(
    options: FindOneOptions<Testimonial>,
    manager?: EntityManager,
  ): Promise<Testimonial | null> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindOneOptions<Testimonial> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<Testimonial>,
    };
    return this.getRepo(manager).findOne(typeOrmOptions);
  }

  async find(
    options: FindManyOptions<Testimonial> = {},
    manager?: EntityManager,
  ): Promise<Testimonial[]> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindManyOptions<Testimonial> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<Testimonial>,
    };
    return this.getRepo(manager).find(typeOrmOptions);
  }

  async count(
    where?: WhereOperator<Testimonial>,
    manager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    return this.getRepo(manager).count({ where: typeOrmWhere });
  }

  async exists(
    where: WhereOperator<Testimonial>,
    manager?: EntityManager,
  ): Promise<boolean> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    return this.getRepo(manager).exist({ where: typeOrmWhere });
  }

  async createMany(
    data: Omit<Testimonial, 'id'>[],
    manager?: EntityManager,
  ): Promise<Testimonial[]> {
    return this.getRepo(manager).save(data as Testimonial[]);
  }

  async updateMany(
    where: WhereOperator<Testimonial>,
    data: Partial<Testimonial>,
    manager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    const result = await this.getRepo(manager).update(typeOrmWhere, data);
    return result.affected ?? 0;
  }

  async deleteMany(
    where: WhereOperator<Testimonial>,
    manager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    const result = await this.getRepo(manager).delete(typeOrmWhere);
    return result.affected ?? 0;
  }

  // --- Custom Methods ---

  async findByArtworkId(
    artworkId: string,
    options?: FindManyOptions<Testimonial>,
    manager?: EntityManager,
  ): Promise<Testimonial[]> {
    return this.find(
      { ...options, where: { ...options?.where, artworkId } },
      manager,
    );
  }

  async findBySellerId(
    sellerId: string,
    options?: FindManyOptions<Testimonial>,
    manager?: EntityManager,
  ): Promise<Testimonial[]> {
    return this.find(
      { ...options, where: { ...options?.where, sellerId } },
      manager,
    );
  }

  async findByBuyerId(
    buyerId: string,
    options?: FindManyOptions<Testimonial>,
    manager?: EntityManager,
  ): Promise<Testimonial[]> {
    return this.find(
      { ...options, where: { ...options?.where, buyerId } },
      manager,
    );
  }

  async findApproved(
    sellerId: string,
    options?: FindManyOptions<Testimonial>,
    manager?: EntityManager,
  ): Promise<Testimonial[]> {
    return this.find(
      {
        ...options,
        where: { ...options?.where, sellerId, isApproved: true },
      },
      manager,
    );
  }

  async approve(
    id: string,
    approvedBy: string,
    manager?: EntityManager,
  ): Promise<Testimonial | null> {
    return this.update(
      id,
      { isApproved: true, approvedBy, approvedAt: new Date() },
      manager,
    );
  }

  async reject(
    id: string,
    manager?: EntityManager,
  ): Promise<Testimonial | null> {
    // Rejection might just mean not approved, or deleted.
    // Assuming just setting isApproved to false.
    return this.update(id, { isApproved: false }, manager);
  }

  async flag(
    id: string,
    reason: string,
    manager?: EntityManager,
  ): Promise<Testimonial | null> {
    return this.update(id, { isFlagged: true, flagReason: reason }, manager);
  }

  async addSellerResponse(
    id: string,
    response: string,
    manager?: EntityManager,
  ): Promise<Testimonial | null> {
    return this.update(
      id,
      { sellerResponse: response, sellerRespondedAt: new Date() },
      manager,
    );
  }

  async incrementHelpfulCount(
    id: string,
    isHelpful: boolean,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(manager);
    if (isHelpful) {
      await repo.increment({ id }, 'helpfulCount', 1);
    } else {
      await repo.increment({ id }, 'notHelpfulCount', 1);
    }
  }

  async getAverageRatingForSeller(
    sellerId: string,
    manager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(manager);
    const { avg } = await repo
      .createQueryBuilder('testimonial')
      .select('AVG(testimonial.rating)', 'avg')
      .where('testimonial.sellerId = :sellerId', { sellerId })
      .andWhere('testimonial.isApproved = :isApproved', { isApproved: true })
      .getRawOne();

    return parseFloat(avg) || 0;
  }

  async getAverageRatingForArtwork(
    artworkId: string,
    manager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(manager);
    const { avg } = await repo
      .createQueryBuilder('testimonial')
      .select('AVG(testimonial.rating)', 'avg')
      .where('testimonial.artworkId = :artworkId', { artworkId })
      .andWhere('testimonial.isApproved = :isApproved', { isApproved: true })
      .getRawOne();

    return parseFloat(avg) || 0;
  }

  async hasUserReviewedArtwork(
    buyerId: string,
    artworkId: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    return this.exists({ buyerId, artworkId }, manager);
  }
}
