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
  Comment,
  ICommentRepository,
  CreateCommentInput,
  UpdateCommentInput,
  CommentableType,
} from '../../domain';

@Injectable()
export class CommentRepository implements ICommentRepository {
  private readonly logger = new Logger(CommentRepository.name);

  constructor(
    @InjectRepository(Comment)
    private readonly ormRepository: Repository<Comment>,
  ) {}

  private getRepo(manager?: EntityManager): Repository<Comment> {
    return manager ? manager.getRepository(Comment) : this.ormRepository;
  }

  // --- IRepository Implementation ---

  async create(
    data: CreateCommentInput | Omit<Comment, 'id' | 'createdAt'>,
    manager?: EntityManager,
  ): Promise<Comment> {
    const repo = this.getRepo(manager);
    return repo.save(repo.create(data as unknown as Partial<Comment>));
  }

  async update(
    id: string,
    data: UpdateCommentInput | Partial<Comment>,
    manager?: EntityManager,
  ): Promise<Comment | null> {
    const repo = this.getRepo(manager);
    const entity = await repo.findOneBy({ id });
    if (!entity) return null;
    repo.merge(entity, data as Partial<Comment>);

    // if ((data as UpdateCommentInput).isEdited === undefined && (data as any).content) {
    //      // Auto set edited flags if content changes? Logic usually in service, but repository handles data.
    //      // We stick to simple update here.
    // }

    return repo.save(entity);
  }

  async delete(id: string, manager?: EntityManager): Promise<boolean> {
    const repo = this.getRepo(manager);
    // Standard delete (hard delete)
    const result = await repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findById(id: string, manager?: EntityManager): Promise<Comment | null> {
    return this.getRepo(manager).findOneBy({ id });
  }

  async findOne(
    options: FindOneOptions<Comment>,
    manager?: EntityManager,
  ): Promise<Comment | null> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindOneOptions<Comment> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<Comment>,
    };
    return this.getRepo(manager).findOne(typeOrmOptions);
  }

  async find(
    options: FindManyOptions<Comment> = {},
    manager?: EntityManager,
  ): Promise<Comment[]> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindManyOptions<Comment> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<Comment>,
    };
    return this.getRepo(manager).find(typeOrmOptions);
  }

  async count(
    where?: WhereOperator<Comment>,
    manager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    return this.getRepo(manager).count({ where: typeOrmWhere });
  }

  async exists(
    where: WhereOperator<Comment>,
    manager?: EntityManager,
  ): Promise<boolean> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    return this.getRepo(manager).exist({ where: typeOrmWhere });
  }

  async createMany(
    data: Omit<Comment, 'id'>[],
    manager?: EntityManager,
  ): Promise<Comment[]> {
    return this.getRepo(manager).save(data as Comment[]);
  }

  async updateMany(
    where: WhereOperator<Comment>,
    data: Partial<Comment>,
    manager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    const result = await this.getRepo(manager).update(typeOrmWhere, data);
    return result.affected ?? 0;
  }

  async deleteMany(
    where: WhereOperator<Comment>,
    manager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    const result = await this.getRepo(manager).delete(typeOrmWhere);
    return result.affected ?? 0;
  }

  // --- Custom Methods ---

  async findByEntity(
    commentableType: CommentableType,
    commentableId: string,
    options?: FindManyOptions<Comment>,
    manager?: EntityManager,
  ): Promise<Comment[]> {
    return this.find(
      {
        ...options,
        where: { ...options?.where, commentableType, commentableId },
      },
      manager,
    );
  }

  async findReplies(
    parentCommentId: string,
    options?: FindManyOptions<Comment>,
    manager?: EntityManager,
  ): Promise<Comment[]> {
    return this.find(
      {
        ...options,
        where: { ...options?.where, parentCommentId },
      },
      manager,
    );
  }

  async findByUserId(
    userId: string,
    options?: FindManyOptions<Comment>,
    manager?: EntityManager,
  ): Promise<Comment[]> {
    return this.find(
      {
        ...options,
        where: { ...options?.where, userId },
      },
      manager,
    );
  }

  async softDelete(
    id: string,
    manager?: EntityManager,
  ): Promise<Comment | null> {
    return this.update(id, { isDeleted: true, deletedAt: new Date() }, manager);
  }

  async flag(id: string, manager?: EntityManager): Promise<Comment | null> {
    return this.update(id, { isFlagged: true }, manager);
  }

  async unflag(id: string, manager?: EntityManager): Promise<Comment | null> {
    return this.update(id, { isFlagged: false }, manager);
  }

  async incrementLikeCount(
    id: string,
    increment: number,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(manager);
    await repo.increment({ id }, 'likeCount', increment);
  }

  async incrementReplyCount(
    id: string,
    increment: number,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(manager);
    await repo.increment({ id }, 'replyCount', increment);
  }

  async countByEntity(
    commentableType: CommentableType,
    commentableId: string,
    manager?: EntityManager,
  ): Promise<number> {
    return this.count({ commentableType, commentableId }, manager);
  }
}
