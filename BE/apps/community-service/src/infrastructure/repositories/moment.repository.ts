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
  LessThan,
} from 'typeorm';
import {
  Moment,
  IMomentRepository,
  CreateMomentInput,
  UpdateMomentInput,
} from '../../domain';

@Injectable()
export class MomentRepository implements IMomentRepository {
  private readonly logger = new Logger(MomentRepository.name);

  constructor(
    @InjectRepository(Moment)
    private readonly ormRepository: Repository<Moment>,
  ) {}

  private getRepo(manager?: EntityManager): Repository<Moment> {
    return manager ? manager.getRepository(Moment) : this.ormRepository;
  }

  // --- IRepository Implementation ---

  async create(
    data:
      | Omit<CreateMomentInput, 'taggedArtworkIds'>
      | Omit<Moment, 'id' | 'createdAt'>,
    transactionManager?: EntityManager,
  ): Promise<Moment> {
    const repo = this.getRepo(transactionManager);
    return repo.save(repo.create(data as unknown as Partial<Moment>));
  }

  async update(
    id: string,
    data: Partial<Moment> | UpdateMomentInput,
    transactionManager?: EntityManager,
  ): Promise<Moment | null> {
    const repo = this.getRepo(transactionManager);

    const entity = await repo.findOneBy({ id });
    if (!entity) return null;

    repo.merge(entity, data as Partial<Moment>);
    return repo.save(entity);
  }

  async delete(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findById(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<Moment | null> {
    return this.getRepo(transactionManager).findOneBy({ id });
  }

  async findOne(
    options: FindOneOptions<Moment>,
    transactionManager?: EntityManager,
  ): Promise<Moment | null> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindOneOptions<Moment> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<Moment>,
    };
    return this.getRepo(transactionManager).findOne(typeOrmOptions);
  }

  async find(
    options: FindManyOptions<Moment> = {},
    transactionManager?: EntityManager,
  ): Promise<Moment[]> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindManyOptions<Moment> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<Moment>,
    };
    return this.getRepo(transactionManager).find(typeOrmOptions);
  }

  async count(
    where?: WhereOperator<Moment>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    return this.getRepo(transactionManager).count({ where: typeOrmWhere });
  }

  async exists(
    where: WhereOperator<Moment>,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    return this.getRepo(transactionManager).exist({ where: typeOrmWhere });
  }

  async createMany(
    data: Omit<Moment, 'id'>[],
    transactionManager?: EntityManager,
  ): Promise<Moment[]> {
    return this.getRepo(transactionManager).save(data as Moment[]);
  }

  async updateMany(
    where: WhereOperator<Moment>,
    data: Partial<Moment>,
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
    where: WhereOperator<Moment>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    const result = await this.getRepo(transactionManager).delete(typeOrmWhere);
    return result.affected ?? 0;
  }

  // --- Custom Methods ---

  async findByUserId(
    userId: string,
    options?: FindManyOptions<Moment>,
    transactionManager?: EntityManager,
  ): Promise<Moment[]> {
    const where: WhereOperator<Moment> = { ...options?.where, userId };
    return this.find({ ...options, where }, transactionManager);
  }

  async findActive(
    options?: FindManyOptions<Moment>,
    transactionManager?: EntityManager,
  ): Promise<Moment[]> {
    const where: WhereOperator<Moment> = {
      ...options?.where,
      isArchived: false,
    };
    return this.find({ ...options, where }, transactionManager);
  }

  async findExpired(transactionManager?: EntityManager): Promise<Moment[]> {
    const repo = this.getRepo(transactionManager);
    return repo.find({
      where: {
        isArchived: false,
        expiresAt: LessThan(new Date()),
      },
    });
  }

  async incrementViewCount(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(transactionManager);
    await repo.increment({ id }, 'viewCount', 1);
  }

  async incrementLikeCount(
    id: string,
    increment: number,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(transactionManager);
    await repo.increment({ id }, 'likeCount', increment);
  }

  async incrementCommentCount(
    id: string,
    increment: number,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(transactionManager);
    await repo.increment({ id }, 'commentCount', increment);
  }

  async archive(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<Moment | null> {
    return this.update(id, { isArchived: true }, transactionManager);
  }

  async unarchive(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<Moment | null> {
    return this.update(id, { isArchived: false }, transactionManager);
  }

  async pin(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<Moment | null> {
    return this.update(id, { isPinned: true }, transactionManager);
  }

  async unpin(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<Moment | null> {
    return this.update(id, { isPinned: false }, transactionManager);
  }
}
