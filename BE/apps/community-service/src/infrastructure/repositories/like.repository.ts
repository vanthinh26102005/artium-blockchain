import {
  FindManyOptions,
  FindOneOptions,
  mapToTypeOrmWhere,
  WhereOperator,
} from '@app/common';
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
  Like,
  ILikeRepository,
  CreateLikeInput,
  LikeableType,
} from '../../domain';

@Injectable()
export class LikeRepository implements ILikeRepository {
  private readonly logger = new Logger(LikeRepository.name);

  constructor(
    @InjectRepository(Like)
    private readonly ormRepository: Repository<Like>,
  ) {}

  private getRepo(manager?: EntityManager): Repository<Like> {
    return manager ? manager.getRepository(Like) : this.ormRepository;
  }

  // --- IRepository Implementation ---

  async create(
    data: CreateLikeInput | Omit<Like, 'id' | 'createdAt'>,
    manager?: EntityManager,
  ): Promise<Like> {
    const repo = this.getRepo(manager);
    return repo.save(repo.create(data as unknown as Partial<Like>));
  }

  async update(
    id: string,
    data: Partial<Like>,
    manager?: EntityManager,
  ): Promise<Like | null> {
    const repo = this.getRepo(manager);
    const entity = await repo.findOneBy({ id });
    if (!entity) return null;
    repo.merge(entity, data);
    return repo.save(entity);
  }

  // Overloaded delete implementation to handle both IRepository (id) and Custom (userId, type, entityId)
  async delete(
    idOrUserId: string,
    likeableTypeOrManager?: LikeableType | EntityManager,
    likeableId?: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    // Check if 2nd arg is EntityManager (standard IRepository call: delete(id, manager))
    // or if 2nd arg is undefined (standard IRepository call: delete(id))
    // Note: LikeableType is string/enum. EntityManager is object.

    let transactionManager: EntityManager | undefined = manager;

    if (likeableTypeOrManager && typeof likeableTypeOrManager !== 'string') {
      // It's EntityManager
      transactionManager = likeableTypeOrManager;
      // Standard delete by ID
      const repo = this.getRepo(transactionManager);
      const result = await repo.delete(idOrUserId);
      return (result.affected ?? 0) > 0;
    } else if (!likeableTypeOrManager && !likeableId) {
      // Standard delete by ID with no manager
      const repo = this.getRepo(undefined);
      const result = await repo.delete(idOrUserId);
      return (result.affected ?? 0) > 0;
    }

    // Custom delete: delete(userId, likeableType, likeableId, manager)
    const userId = idOrUserId;
    const type = likeableTypeOrManager as LikeableType;
    const entityId = likeableId!;
    // manager is passed as 4th arg

    const repo = this.getRepo(transactionManager);
    const result = await repo.delete({
      userId,
      likeableType: type,
      likeableId: entityId,
    });
    return (result.affected ?? 0) > 0;
  }

  async findById(id: string, manager?: EntityManager): Promise<Like | null> {
    return this.getRepo(manager).findOneBy({ id });
  }

  async findOne(
    options: FindOneOptions<Like>,
    manager?: EntityManager,
  ): Promise<Like | null> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindOneOptions<Like> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<Like>,
    };
    return this.getRepo(manager).findOne(typeOrmOptions);
  }

  async find(
    options: FindManyOptions<Like> = {},
    manager?: EntityManager,
  ): Promise<Like[]> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindManyOptions<Like> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<Like>,
    };
    return this.getRepo(manager).find(typeOrmOptions);
  }

  async count(
    where?: WhereOperator<Like>,
    manager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    return this.getRepo(manager).count({ where: typeOrmWhere });
  }

  async exists(
    where: WhereOperator<Like>,
    manager?: EntityManager,
  ): Promise<boolean> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    return this.getRepo(manager).exist({ where: typeOrmWhere });
  }

  async createMany(
    data: Omit<Like, 'id'>[],
    manager?: EntityManager,
  ): Promise<Like[]> {
    return this.getRepo(manager).save(data as Like[]);
  }

  async updateMany(
    where: WhereOperator<Like>,
    data: Partial<Like>,
    manager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    const result = await this.getRepo(manager).update(typeOrmWhere, data);
    return result.affected ?? 0;
  }

  async deleteMany(
    where: WhereOperator<Like>,
    manager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    const result = await this.getRepo(manager).delete(typeOrmWhere);
    return result.affected ?? 0;
  }

  // --- Custom Methods ---

  async findByEntity(
    likeableType: LikeableType,
    likeableId: string,
    skip?: number,
    take?: number,
    manager?: EntityManager,
  ): Promise<Like[]> {
    return this.find(
      {
        where: { likeableType, likeableId },
        skip,
        take,
      },
      manager,
    );
  }

  async findByUserId(
    userId: string,
    likeableType?: LikeableType,
    skip?: number,
    take?: number,
    manager?: EntityManager,
  ): Promise<Like[]> {
    const where: any = { userId };
    if (likeableType) where.likeableType = likeableType;

    return this.find(
      {
        where,
        skip,
        take,
      },
      manager,
    );
  }

  async isLiked(
    userId: string,
    likeableType: LikeableType,
    likeableId: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    return this.exists({ userId, likeableType, likeableId }, manager);
  }

  async countByEntity(
    likeableType: LikeableType,
    likeableId: string,
    manager?: EntityManager,
  ): Promise<number> {
    return this.count({ likeableType, likeableId }, manager);
  }

  async findLikedEntityIds(
    userId: string,
    likeableType: LikeableType,
    entityIds: string[],
    manager?: EntityManager,
  ): Promise<string[]> {
    const repo = this.getRepo(manager);
    const likes = await repo
      .createQueryBuilder('like')
      .where('like.userId = :userId', { userId })
      .andWhere('like.likeableType = :likeableType', { likeableType })
      .andWhere('like.likeableId IN (:...entityIds)', { entityIds })
      .select('like.likeableId')
      .getMany();

    return likes.map((like) => like.likeableId);
  }
}
