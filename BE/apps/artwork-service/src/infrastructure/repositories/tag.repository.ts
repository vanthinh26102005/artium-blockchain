import {
  FindManyOptions,
  FindOneOptions,
  WhereOperator,
  mapToTypeOrmWhere,
  TagStatus,
} from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  FindOptionsOrder,
  In,
  Like,
  Repository,
  FindManyOptions as TypeOrmFindManyOptions,
  FindOneOptions as TypeOrmFindOneOptions,
} from 'typeorm';
import { ITagRepository, Tag } from '../../domain';

@Injectable()
export class TagRepository implements ITagRepository {
  private readonly logger = new Logger(TagRepository.name);

  constructor(
    @InjectRepository(Tag)
    private readonly ormRepository: Repository<Tag>,
  ) {}

  private getRepo(transactionManager?: EntityManager): Repository<Tag> {
    return transactionManager
      ? transactionManager.getRepository(Tag)
      : this.ormRepository;
  }

  async create(
    data: Omit<Tag, 'id'>,
    transactionManager?: EntityManager,
  ): Promise<Tag> {
    const repo = this.getRepo(transactionManager);
    const tag = repo.create(data);
    return repo.save(tag);
  }

  async update(
    id: string,
    data: Partial<Tag>,
    transactionManager?: EntityManager,
  ): Promise<Tag | null> {
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
  ): Promise<Tag | null> {
    return this.getRepo(transactionManager).findOneBy({ id });
  }

  async findOne(
    options: FindOneOptions<Tag>,
    transactionManager?: EntityManager,
  ): Promise<Tag | null> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindOneOptions<Tag> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<Tag>,
    };
    return this.getRepo(transactionManager).findOne(typeOrmOptions);
  }

  async find(
    options: FindManyOptions<Tag> = {},
    transactionManager?: EntityManager,
  ): Promise<Tag[]> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindManyOptions<Tag> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<Tag>,
    };
    return this.getRepo(transactionManager).find(typeOrmOptions);
  }

  async count(
    where?: WhereOperator<Tag>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    return this.getRepo(transactionManager).count({ where: typeOrmWhere });
  }

  async exists(
    where: WhereOperator<Tag>,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    const repo = this.getRepo(transactionManager);
    if ('exists' in repo) {
      return repo.exists({ where: typeOrmWhere });
    }
    return (repo as any).exist({ where: typeOrmWhere });
  }

  async createMany(
    data: Omit<Tag, 'id' | 'createdAt'>[],
    transactionManager?: EntityManager,
  ): Promise<Tag[]> {
    return this.getRepo(transactionManager).save(data);
  }

  async updateMany(
    where: WhereOperator<Tag>,
    data: Partial<Tag>,
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
    where: WhereOperator<Tag>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    const result = await this.getRepo(transactionManager).delete(typeOrmWhere);
    return result.affected ?? 0;
  }

  async findByName(
    name: string,
    transactionManager?: EntityManager,
  ): Promise<Tag | null> {
    return this.getRepo(transactionManager).findOneBy({ name });
  }

  async findOrCreateMany(
    sellerId: string,
    tagNames: string[],
    transactionManager?: EntityManager,
  ): Promise<Tag[]> {
    if (tagNames.length === 0) {
      return [];
    }

    const existingTags = await this.findManyByNames(
      tagNames,
      transactionManager,
    );
    const existingTagNames = new Set(existingTags.map((tag) => tag.name));

    const newTagNames = tagNames.filter((name) => !existingTagNames.has(name));

    let newTags: Tag[] = [];
    if (newTagNames.length > 0) {
      const tagsToCreate = newTagNames.map((name) => ({
        name,
        sellerId,
        status: TagStatus.CUSTOM,
      }));
      newTags = await this.createMany(tagsToCreate, transactionManager);
    }

    return [...existingTags, ...newTags];
  }

  async findAvailableForSeller(
    sellerId: string,
    options: FindManyOptions<Tag> = {},
    transactionManager?: EntityManager,
  ): Promise<Tag[]> {
    const repo = this.getRepo(transactionManager);

    const baseWhere = mapToTypeOrmWhere(options.where);

    const typeOrmOptions: TypeOrmFindManyOptions<Tag> = {
      ...options,
      where: [
        { ...baseWhere, sellerId: sellerId },
        { ...baseWhere, status: TagStatus.SYSTEM },
      ],
      order: options.orderBy as FindOptionsOrder<Tag>,
    };

    return repo.find(typeOrmOptions);
  }

  async findSystemTags(
    options: FindManyOptions<Tag> = {},
    transactionManager?: EntityManager,
  ): Promise<Tag[]> {
    const existingWhere = options.where || {};
    const mergedWhere = {
      ...existingWhere,
      status: TagStatus.SYSTEM,
    } as WhereOperator<Tag>;

    return this.find({ ...options, where: mergedWhere }, transactionManager);
  }

  async searchForSeller(
    sellerId: string,
    query: string,
    limit = 10,
    transactionManager?: EntityManager,
  ): Promise<Tag[]> {
    const repo = this.getRepo(transactionManager);
    const searchQuery = `%${query}%`;

    return repo.find({
      where: [
        { sellerId: sellerId, name: Like(searchQuery) },
        { status: TagStatus.SYSTEM, name: Like(searchQuery) },
      ],
      order: { name: 'ASC' },
      take: limit,
    });
  }

  async findManyByNames(
    names: string[],
    transactionManager?: EntityManager,
  ): Promise<Tag[]> {
    if (names.length === 0) {
      return [];
    }
    const repo = this.getRepo(transactionManager);
    return repo.find({
      where: {
        name: In(names),
      },
    });
  }
}
