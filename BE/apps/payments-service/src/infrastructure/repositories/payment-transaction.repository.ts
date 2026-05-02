import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOptionsOrder } from 'typeorm';
import { PaymentTransaction } from '../../domain/entities';
import { IPaymentTransactionRepository } from '../../domain';
import {
  TransactionType,
  TransactionStatus,
  PaymentProvider,
  FindManyOptions,
  FindOneOptions,
  WhereOperator,
  mapToTypeOrmWhere,
} from '@app/common';

@Injectable()
export class PaymentTransactionRepository implements IPaymentTransactionRepository {
  constructor(
    @InjectRepository(PaymentTransaction)
    private readonly ormRepository: Repository<PaymentTransaction>,
  ) {}

  private getRepo(
    transactionManager?: EntityManager,
  ): Repository<PaymentTransaction> {
    return transactionManager
      ? transactionManager.getRepository(PaymentTransaction)
      : this.ormRepository;
  }

  async create(
    data: Omit<PaymentTransaction, 'transactionId' | 'createdAt'>,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction> {
    const repo = this.getRepo(transactionManager);
    const transaction = repo.create(data);
    return repo.save(transaction);
  }

  async update(
    transactionId: string,
    data: Partial<PaymentTransaction>,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction | null> {
    const repo = this.getRepo(transactionManager);
    await repo.update({ id: transactionId }, data);
    return this.findById(transactionId, transactionManager);
  }

  async delete(
    transactionId: string,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.delete({ id: transactionId });
    return (result.affected ?? 0) > 0;
  }

  async findById(
    transactionId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction | null> {
    const repo = this.getRepo(transactionManager);
    return repo.findOne({
      where: { id: transactionId },
    });
  }

  async findOne(
    options: FindOneOptions<PaymentTransaction>,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction | null> {
    const repo = this.getRepo(transactionManager);
    const { where, orderBy, ...rest } = options;
    return repo.findOne({
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<PaymentTransaction>,
    });
  }

  async find(
    options?: FindManyOptions<PaymentTransaction>,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction[]> {
    const repo = this.getRepo(transactionManager);
    const { where, orderBy, ...rest } = options || {};
    return repo.find({
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<PaymentTransaction>,
    });
  }

  async count(
    where?: WhereOperator<PaymentTransaction>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    return repo.count({ where: mapToTypeOrmWhere(where) });
  }

  async exists(
    where: WhereOperator<PaymentTransaction>,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const count = await this.count(where, transactionManager);
    return count > 0;
  }

  async createMany(
    data: Omit<PaymentTransaction, 'transactionId'>[],
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction[]> {
    const repo = this.getRepo(transactionManager);
    const transactions = repo.create(data);
    return repo.save(transactions);
  }

  async updateMany(
    where: WhereOperator<PaymentTransaction>,
    data: Partial<PaymentTransaction>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.update(mapToTypeOrmWhere(where), data);
    return result.affected ?? 0;
  }

  async deleteMany(
    where: WhereOperator<PaymentTransaction>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.delete(mapToTypeOrmWhere(where));
    return result.affected ?? 0;
  }

  // Specialized methods

  async findByUserId(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction[]> {
    return this.find(
      {
        where: { userId },
        orderBy: { createdAt: 'desc' },
      },
      transactionManager,
    );
  }

  async findBySellerId(
    sellerId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction[]> {
    return this.find(
      {
        where: { sellerId },
        orderBy: { createdAt: 'desc' },
      },
      transactionManager,
    );
  }

  async findByOrderId(
    orderId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction[]> {
    return this.find(
      {
        where: { orderId },
        orderBy: { createdAt: 'desc' },
      },
      transactionManager,
    );
  }

  async findByInvoiceId(
    invoiceId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction[]> {
    return this.find(
      {
        where: { invoiceId },
        orderBy: { createdAt: 'desc' },
      },
      transactionManager,
    );
  }

  async findByType(
    type: TransactionType,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction[]> {
    return this.find(
      {
        where: { type },
        orderBy: { createdAt: 'desc' },
      },
      transactionManager,
    );
  }

  async findByStatus(
    status: TransactionStatus,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction[]> {
    return this.find(
      {
        where: { status },
        orderBy: { createdAt: 'desc' },
      },
      transactionManager,
    );
  }

  async findByStripePaymentIntentId(
    stripePaymentIntentId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction | null> {
    return this.findOne(
      {
        where: { stripePaymentIntentId },
      },
      transactionManager,
    );
  }

  async findByStripeChargeId(
    stripeChargeId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction | null> {
    return this.findOne(
      {
        where: { stripeChargeId },
      },
      transactionManager,
    );
  }

  async findByPaypalOrderId(
    paypalOrderId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction | null> {
    return this.findOne(
      {
        where: { paypalOrderId },
      },
      transactionManager,
    );
  }

  async updateStatus(
    transactionId: string,
    status: TransactionStatus,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction | null> {
    const updateData: Partial<PaymentTransaction> = { status };

    if (status === TransactionStatus.PROCESSING) {
      updateData.processedAt = new Date();
    } else if (status === TransactionStatus.SUCCEEDED) {
      updateData.completedAt = new Date();
    }

    return this.update(transactionId, updateData, transactionManager);
  }

  async markAsCompleted(
    transactionId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction | null> {
    return this.update(
      transactionId,
      {
        status: TransactionStatus.SUCCEEDED,
        completedAt: new Date(),
      },
      transactionManager,
    );
  }

  async markAsFailed(
    transactionId: string,
    failureReason: string,
    failureCode?: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction | null> {
    return this.update(
      transactionId,
      {
        status: TransactionStatus.FAILED,
        failureReason,
        failureCode,
      },
      transactionManager,
    );
  }

  async recordRefund(
    transactionId: string,
    refundAmount: number,
    refundReason: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction | null> {
    const transaction = await this.findById(transactionId, transactionManager);
    if (!transaction) return null;

    const isFullRefund = refundAmount >= Number(transaction.amount);
    const newStatus = isFullRefund
      ? TransactionStatus.REFUNDED
      : TransactionStatus.PARTIALLY_REFUNDED;

    return this.update(
      transactionId,
      {
        status: newStatus,
        refundAmount,
        refundReason,
        refundedAt: new Date(),
      },
      transactionManager,
    );
  }

  async getTotalAmountBySeller(
    sellerId: string,
    status?: TransactionStatus,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    const whereCondition: any = {
      sellerId,
      type: TransactionType.PAYMENT,
    };

    if (status) {
      whereCondition.status = status;
    }

    const result = await repo
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where(whereCondition)
      .getRawOne();

    return Number(result?.total || 0);
  }

  async findPendingForPayout(
    sellerId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction[]> {
    return this.find(
      {
        where: {
          sellerId,
          type: TransactionType.PAYMENT,
          status: TransactionStatus.SUCCEEDED,
        },
        orderBy: { createdAt: 'asc' },
      },
      transactionManager,
    );
  }

  async findByTxHash(txHash: string): Promise<PaymentTransaction | null> {
    return this.ormRepository.findOne({ where: { txHash } });
  }

  async findEthereumTransactionsReadyForConfirmation(
    limit: number,
    staleAfter: Date,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction[]> {
    const repo = this.getRepo(transactionManager);
    return repo
      .createQueryBuilder('transaction')
      .where('transaction.provider = :provider', {
        provider: PaymentProvider.ETHEREUM,
      })
      .andWhere('transaction.status = :status', {
        status: TransactionStatus.PROCESSING,
      })
      .andWhere('transaction.next_confirmation_at IS NOT NULL')
      .andWhere('transaction.next_confirmation_at <= :now', { now: new Date() })
      .andWhere(
        '(transaction.confirmation_started_at IS NULL OR transaction.confirmation_started_at < :staleAfter)',
        { staleAfter },
      )
      .orderBy('transaction.next_confirmation_at', 'ASC')
      .addOrderBy('transaction.created_at', 'ASC')
      .limit(limit)
      .getMany();
  }

  async tryStartConfirmationAttempt(
    transactionId: string,
    startedAt: Date,
    staleAfter: Date,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const repo = this.getRepo(transactionManager);
    const result = await repo
      .createQueryBuilder()
      .update(PaymentTransaction)
      .set({
        confirmationStartedAt: startedAt,
        confirmationAttempts: () => '"confirmation_attempts" + 1',
      })
      .where('transaction_id = :transactionId', { transactionId })
      .andWhere('provider = :provider', { provider: PaymentProvider.ETHEREUM })
      .andWhere('status = :status', { status: TransactionStatus.PROCESSING })
      .andWhere(
        '(confirmation_started_at IS NULL OR confirmation_started_at < :staleAfter)',
        { staleAfter },
      )
      .execute();

    return (result.affected ?? 0) > 0;
  }

  async scheduleNextConfirmationAttempt(
    transactionId: string,
    nextConfirmationAt: Date,
    error: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction | null> {
    return this.update(
      transactionId,
      {
        status: TransactionStatus.PROCESSING,
        nextConfirmationAt,
        confirmationStartedAt: null,
        lastConfirmationError: error,
      },
      transactionManager,
    );
  }

  async markEthereumTransactionSucceeded(
    transactionId: string,
    confirmedBlockNumber: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction | null> {
    const repo = this.getRepo(transactionManager);
    const completedAt = new Date();
    const result = await repo
      .createQueryBuilder()
      .update(PaymentTransaction)
      .set({
        status: TransactionStatus.SUCCEEDED,
        processedAt: completedAt,
        completedAt,
        confirmationStartedAt: null,
        nextConfirmationAt: null,
        lastConfirmationError: null,
        confirmedBlockNumber,
      })
      .where('transaction_id = :transactionId', { transactionId })
      .andWhere('provider = :provider', { provider: PaymentProvider.ETHEREUM })
      .andWhere('status = :status', { status: TransactionStatus.PROCESSING })
      .execute();

    if ((result.affected ?? 0) === 0) {
      return this.findById(transactionId, transactionManager);
    }

    return this.findById(transactionId, transactionManager);
  }

  async markEthereumTransactionFailed(
    transactionId: string,
    failureReason: string,
    failureCode?: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction | null> {
    const repo = this.getRepo(transactionManager);
    const result = await repo
      .createQueryBuilder()
      .update(PaymentTransaction)
      .set({
        status: TransactionStatus.FAILED,
        failureReason,
        failureCode,
        processedAt: new Date(),
        confirmationStartedAt: null,
        nextConfirmationAt: null,
        lastConfirmationError: failureReason,
      })
      .where('transaction_id = :transactionId', { transactionId })
      .andWhere('provider = :provider', { provider: PaymentProvider.ETHEREUM })
      .andWhere('status = :status', { status: TransactionStatus.PROCESSING })
      .execute();

    if ((result.affected ?? 0) === 0) {
      return this.findById(transactionId, transactionManager);
    }

    return this.findById(transactionId, transactionManager);
  }
}
