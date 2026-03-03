import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, LessThan, FindOptionsOrder } from 'typeorm';
import { Invoice } from '../../domain/entities';
import { IInvoiceRepository } from '../../domain/interfaces';
import {
  InvoiceStatus,
  FindManyOptions,
  FindOneOptions,
  WhereOperator,
  mapToTypeOrmWhere,
} from '@app/common';

@Injectable()
export class InvoiceRepository implements IInvoiceRepository {
  constructor(
    @InjectRepository(Invoice)
    private readonly ormRepository: Repository<Invoice>,
  ) {}

  private getRepo(transactionManager?: EntityManager): Repository<Invoice> {
    return transactionManager
      ? transactionManager.getRepository(Invoice)
      : this.ormRepository;
  }

  async create(
    data: Omit<Invoice, 'invoiceId' | 'createdAt'>,
    transactionManager?: EntityManager,
  ): Promise<Invoice> {
    const repo = this.getRepo(transactionManager);
    const invoice = repo.create(data);
    return repo.save(invoice);
  }

  async update(
    invoiceId: string,
    data: Partial<Invoice>,
    transactionManager?: EntityManager,
  ): Promise<Invoice | null> {
    const repo = this.getRepo(transactionManager);
    await repo.update({ id: invoiceId }, data);
    return this.findById(invoiceId, transactionManager);
  }

  async delete(
    invoiceId: string,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.delete({ id: invoiceId });
    return (result.affected ?? 0) > 0;
  }

  async findById(
    invoiceId: string,
    transactionManager?: EntityManager,
  ): Promise<Invoice | null> {
    const repo = this.getRepo(transactionManager);
    return repo.findOne({
      where: { id: invoiceId },
      relations: ['items'],
    });
  }

  async findOne(
    options: FindOneOptions<Invoice>,
    transactionManager?: EntityManager,
  ): Promise<Invoice | null> {
    const repo = this.getRepo(transactionManager);
    const { where, orderBy, ...rest } = options;
    return repo.findOne({
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<Invoice>,
      relations: ['items'],
    });
  }

  async find(
    options?: FindManyOptions<Invoice>,
    transactionManager?: EntityManager,
  ): Promise<Invoice[]> {
    const repo = this.getRepo(transactionManager);
    const { where, orderBy, ...rest } = options || {};
    return repo.find({
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<Invoice>,
      relations: ['items'],
    });
  }

  async count(
    where?: WhereOperator<Invoice>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    return repo.count({ where: mapToTypeOrmWhere(where) });
  }

  async exists(
    where: WhereOperator<Invoice>,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const count = await this.count(where, transactionManager);
    return count > 0;
  }

  async createMany(
    data: Omit<Invoice, 'invoiceId'>[],
    transactionManager?: EntityManager,
  ): Promise<Invoice[]> {
    const repo = this.getRepo(transactionManager);
    const invoices = repo.create(data);
    return repo.save(invoices);
  }

  async updateMany(
    where: WhereOperator<Invoice>,
    data: Partial<Invoice>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.update(mapToTypeOrmWhere(where), data);
    return result.affected ?? 0;
  }

  async deleteMany(
    where: WhereOperator<Invoice>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.delete(mapToTypeOrmWhere(where));
    return result.affected ?? 0;
  }

  // Specialized methods

  async findBySellerId(
    sellerId: string,
    transactionManager?: EntityManager,
  ): Promise<Invoice[]> {
    return this.find({ where: { sellerId } }, transactionManager);
  }

  async findByCollectorId(
    collectorId: string,
    transactionManager?: EntityManager,
  ): Promise<Invoice[]> {
    return this.find({ where: { collectorId } }, transactionManager);
  }

  async findByStatus(
    status: InvoiceStatus,
    transactionManager?: EntityManager,
  ): Promise<Invoice[]> {
    return this.find({ where: { status } }, transactionManager);
  }

  async findByOrderId(
    orderId: string,
    transactionManager?: EntityManager,
  ): Promise<Invoice | null> {
    return this.findOne(
      { where: { orderId: orderId.toString() } },
      transactionManager,
    );
  }

  async findByInvoiceNumber(
    invoiceNumber: string,
    transactionManager?: EntityManager,
  ): Promise<Invoice | null> {
    return this.findOne({ where: { invoiceNumber } }, transactionManager);
  }

  async findOverdueInvoices(
    transactionManager?: EntityManager,
  ): Promise<Invoice[]> {
    const repo = this.getRepo(transactionManager);
    const now = new Date();
    return repo.find({
      where: {
        status: InvoiceStatus.SENT,
        dueDate: LessThan(now),
      },
      relations: ['items'],
    });
  }

  async markAsPaid(
    invoiceId: string,
    paymentTransactionId: string,
    transactionManager?: EntityManager,
  ): Promise<Invoice | null> {
    const repo = this.getRepo(transactionManager);
    await repo.update(
      { id: invoiceId },
      {
        status: InvoiceStatus.PAID,
        paymentTransactionId,
        paidAt: new Date(),
      },
    );
    return this.findById(invoiceId, transactionManager);
  }

  async cancelInvoice(
    invoiceId: string,
    transactionManager?: EntityManager,
  ): Promise<Invoice | null> {
    const repo = this.getRepo(transactionManager);
    await repo.update(
      { id: invoiceId },
      {
        status: InvoiceStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    );
    return this.findById(invoiceId, transactionManager);
  }

  async updateStatus(
    invoiceId: string,
    status: InvoiceStatus,
    transactionManager?: EntityManager,
  ): Promise<Invoice | null> {
    const updateData: Partial<Invoice> = { status };

    if (status === InvoiceStatus.SENT) {
      updateData.sentAt = new Date();
    }

    await this.update(invoiceId, updateData, transactionManager);
    return this.findById(invoiceId, transactionManager);
  }
}
