import { FindManyOptions, FindOneOptions, WhereOperator } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { mapToTypeOrmWhere } from '@app/common';
import {
  EntityManager,
  FindOptionsOrder,
  Repository,
  FindManyOptions as TypeOrmFindManyOptions,
  FindOneOptions as TypeOrmFindOneOptions,
} from 'typeorm';
import { CreateUserInput, UpdateUserInput, User } from '../../domain';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  private readonly logger = new Logger(UserRepository.name);

  constructor(
    @InjectRepository(User)
    private readonly ormRepository: Repository<User>,
  ) {}
  private getRepo(transactionManager?: EntityManager): Repository<User> {
    return transactionManager
      ? transactionManager.getRepository(User)
      : this.ormRepository;
  }

  async create(
    data: CreateUserInput,
    transactionManager?: EntityManager,
  ): Promise<User> {
    const repo = this.getRepo(transactionManager);
    return repo.save(data);
  }

  async update(
    userId: string,
    data: UpdateUserInput,
    transactionManager?: EntityManager,
  ): Promise<User | null> {
    const repo = this.getRepo(transactionManager);

    const entity = await repo.findOneBy({ id: userId });
    if (!entity) return null;

    repo.merge(entity, data);

    return repo.save(entity);
  }

  async updateLastLogin(
    userId: string,
    loginDate: Date,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(transactionManager);
    await repo.update(userId, { lastLogin: loginDate });
  }

  async activate(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<User | null> {
    return this.update(userId, { isActive: true }, transactionManager);
  }

  async deactivate(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<User | null> {
    return this.update(userId, { isActive: false }, transactionManager);
  }

  async findByEmail(
    email: string,
    transactionManager?: EntityManager,
  ): Promise<User | null> {
    return this.getRepo(transactionManager).findOneBy({ email });
  }

  async findActiveByEmail(
    email: string,
    transactionManager?: EntityManager,
  ): Promise<User | null> {
    return this.getRepo(transactionManager).findOneBy({
      email,
      isActive: true,
    });
  }

  async findByWalletAddress(
    walletAddress: string,
    transactionManager?: EntityManager,
  ): Promise<User | null> {
    return this.getRepo(transactionManager).findOneBy({
      walletAddress: walletAddress.toLowerCase(),
    });
  }

  async findByStripeCustomerId(
    stripeCustomerId: string,
    transactionManager?: EntityManager,
  ): Promise<User | null> {
    return this.getRepo(transactionManager).findOneBy({ stripeCustomerId });
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
  ): Promise<User | null> {
    return this.getRepo(transactionManager).findOneBy({ id });
  }

  async findOne(
    options: FindOneOptions<User>,
    transactionManager?: EntityManager,
  ): Promise<User | null> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindOneOptions<User> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<User>,
    };
    return this.getRepo(transactionManager).findOne(typeOrmOptions);
  }

  async find(
    options: FindManyOptions<User> = {},
    transactionManager?: EntityManager,
  ): Promise<User[]> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindManyOptions<User> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<User>,
    };
    return this.getRepo(transactionManager).find(typeOrmOptions);
  }

  async count(
    where?: WhereOperator<User>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    return this.getRepo(transactionManager).count({ where: typeOrmWhere });
  }

  async exists(
    where: WhereOperator<User>,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    return this.getRepo(transactionManager).exist({ where: typeOrmWhere });
  }

  // --- Triển khai Thao tác hàng loạt (Bulk Operations) ---

  async createMany(
    data: Omit<User, 'id'>[],
    transactionManager?: EntityManager,
  ): Promise<User[]> {
    return this.getRepo(transactionManager).save(data);
  }

  async updateMany(
    where: WhereOperator<User>,
    data: Partial<User>,
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
    where: WhereOperator<User>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    const result = await this.getRepo(transactionManager).delete(typeOrmWhere);
    return result.affected ?? 0;
  }
}
