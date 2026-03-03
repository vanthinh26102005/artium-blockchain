import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOptionsOrder } from 'typeorm';
import { InvoiceItem } from '../../domain/entities';
import { IInvoiceItemRepository } from '../../domain/interfaces';
import {
  FindManyOptions,
  FindOneOptions,
  WhereOperator,
  mapToTypeOrmWhere,
} from '@app/common';

@Injectable()
export class InvoiceItemRepository implements IInvoiceItemRepository {
  constructor(
    @InjectRepository(InvoiceItem)
    private readonly ormRepository: Repository<InvoiceItem>,
  ) {}

  private getRepo(transactionManager?: EntityManager): Repository<InvoiceItem> {
    return transactionManager
      ? transactionManager.getRepository(InvoiceItem)
      : this.ormRepository;
  }

  async create(
    data: Omit<InvoiceItem, 'itemId' | 'createdAt'>,
    transactionManager?: EntityManager,
  ): Promise<InvoiceItem> {
    const repo = this.getRepo(transactionManager);
    const item = repo.create(data);
    return repo.save(item);
  }

  async update(
    id: string,
    data: Partial<InvoiceItem>,
    transactionManager?: EntityManager,
  ): Promise<InvoiceItem | null> {
    const repo = this.getRepo(transactionManager);
    await repo.update({ id }, data);
    return this.findById(id, transactionManager);
  }

  async delete(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.delete({ id });
    return (result.affected ?? 0) > 0;
  }

  async findById(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<InvoiceItem | null> {
    const repo = this.getRepo(transactionManager);
    return repo.findOne({
      where: { id },
      relations: ['invoice'],
    });
  }

  async findOne(
    options: FindOneOptions<InvoiceItem>,
    transactionManager?: EntityManager,
  ): Promise<InvoiceItem | null> {
    const repo = this.getRepo(transactionManager);
    const { where, orderBy, ...rest } = options;
    return repo.findOne({
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<InvoiceItem>,
    });
  }

  async find(
    options?: FindManyOptions<InvoiceItem>,
    transactionManager?: EntityManager,
  ): Promise<InvoiceItem[]> {
    const repo = this.getRepo(transactionManager);
    const { where, orderBy, ...rest } = options || {};
    return repo.find({
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<InvoiceItem>,
    });
  }

  async count(
    where?: WhereOperator<InvoiceItem>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    return repo.count({ where: mapToTypeOrmWhere(where) });
  }

  async exists(
    where: WhereOperator<InvoiceItem>,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const count = await this.count(where, transactionManager);
    return count > 0;
  }

  async createMany(
    data: Omit<InvoiceItem, 'id'>[],
    transactionManager?: EntityManager,
  ): Promise<InvoiceItem[]> {
    const repo = this.getRepo(transactionManager);
    const items = repo.create(data);
    return repo.save(items);
  }

  async updateMany(
    where: WhereOperator<InvoiceItem>,
    data: Partial<InvoiceItem>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.update(mapToTypeOrmWhere(where), data);
    return result.affected ?? 0;
  }

  async deleteMany(
    where: WhereOperator<InvoiceItem>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.delete(mapToTypeOrmWhere(where));
    return result.affected ?? 0;
  }

  // Specialized methods

  async findByInvoiceId(
    invoiceId: string,
    transactionManager?: EntityManager,
  ): Promise<InvoiceItem[]> {
    return this.find(
      { where: { invoiceId: invoiceId.toString() } },
      transactionManager,
    );
  }

  async findByArtworkId(
    artworkId: string,
    transactionManager?: EntityManager,
  ): Promise<InvoiceItem[]> {
    return this.find({ where: { artworkId } }, transactionManager);
  }

  async deleteByInvoiceId(
    invoiceId: string,
    transactionManager?: EntityManager,
  ): Promise<number> {
    return this.deleteMany(
      { invoiceId: invoiceId.toString() },
      transactionManager,
    );
  }
}
