import { FindManyOptions, FindOneOptions, WhereOperator } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { mapToTypeOrmWhere } from '@app/common';
import {
  EntityManager,
  FindOptionsOrder,
  FindOptionsWhere,
  In,
  LessThan,
  Raw,
  Repository,
  FindManyOptions as TypeOrmFindManyOptions,
  FindOneOptions as TypeOrmFindOneOptions,
} from 'typeorm';
import {
  CreateNotificationHistoryInput,
  INotificationHistoryRepository,
  NotificationHistory,
  NotificationStatus,
  NotificationTriggerEvent,
  UpdateNotificationHistoryInput,
} from '../../domain';

@Injectable()
export class NotificationHistoryRepository implements INotificationHistoryRepository {
  private readonly logger = new Logger(NotificationHistoryRepository.name);

  constructor(
    @InjectRepository(NotificationHistory)
    private readonly ormRepository: Repository<NotificationHistory>,
  ) {}

  // --- Helpers ---

  private getRepo(
    transactionManager?: EntityManager,
  ): Repository<NotificationHistory> {
    return transactionManager
      ? transactionManager.getRepository(NotificationHistory)
      : this.ormRepository;
  }

  // --- CRUD & IRepository methods ---

  async create(
    data: CreateNotificationHistoryInput,
    transactionManager?: EntityManager,
  ): Promise<NotificationHistory> {
    const repo = this.getRepo(transactionManager);
    const entity = repo.create({
      ...data,
      status: data.status ?? NotificationStatus.PENDING,
    } as Partial<NotificationHistory>);
    const saved = await repo.save(entity);
    this.logger.debug(`Created NotificationHistory id=${saved.id}`);
    return saved;
  }

  async update(
    id: string,
    data: UpdateNotificationHistoryInput,
    transactionManager?: EntityManager,
  ): Promise<NotificationHistory | null> {
    const repo = this.getRepo(transactionManager);
    const existing = await repo.findOneBy({ id });
    if (!existing) return null;

    repo.merge(existing, data as Partial<NotificationHistory>);
    const saved = await repo.save(existing);
    this.logger.debug(`Updated NotificationHistory id=${id}`);
    return saved;
  }

  async delete(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const result = await this.getRepo(transactionManager).delete(id);
    const ok = (result.affected ?? 0) > 0;
    if (ok) this.logger.debug(`Deleted NotificationHistory id=${id}`);
    return ok;
  }

  async findById(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<NotificationHistory | null> {
    return this.getRepo(transactionManager).findOneBy({ id });
  }

  async findOne(
    options: FindOneOptions<NotificationHistory>,
    transactionManager?: EntityManager,
  ): Promise<NotificationHistory | null> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindOneOptions<NotificationHistory> = {
      ...rest,
      where: mapToTypeOrmWhere(where as any),
      order: orderBy as FindOptionsOrder<NotificationHistory>,
    };
    return this.getRepo(transactionManager).findOne(typeOrmOptions);
  }

  async find(
    options: FindManyOptions<NotificationHistory> = {},
    transactionManager?: EntityManager,
  ): Promise<NotificationHistory[]> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindManyOptions<NotificationHistory> = {
      ...rest,
      where: mapToTypeOrmWhere(where as any),
      order: orderBy as FindOptionsOrder<NotificationHistory>,
    };
    return this.getRepo(transactionManager).find(typeOrmOptions);
  }

  async count(
    where?: WhereOperator<NotificationHistory>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where as any);
    return this.getRepo(transactionManager).count({ where: typeOrmWhere });
  }

  async exists(
    where: WhereOperator<NotificationHistory>,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const typeOrmWhere = mapToTypeOrmWhere(where as any);
    return this.getRepo(transactionManager).exists({ where: typeOrmWhere });
  }

  async createMany(
    data: Omit<NotificationHistory, 'id'>[],
    transactionManager?: EntityManager,
  ): Promise<NotificationHistory[]> {
    return this.getRepo(transactionManager).save(data);
  }

  async updateMany(
    where: WhereOperator<NotificationHistory>,
    data: Partial<NotificationHistory>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where as any);
    const result = await this.getRepo(transactionManager).update(
      typeOrmWhere,
      data,
    );
    return result.affected ?? 0;
  }

  async deleteMany(
    where: WhereOperator<NotificationHistory>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where as any);
    const result = await this.getRepo(transactionManager).delete(typeOrmWhere);
    return result.affected ?? 0;
  }

  // --- Specialised methods ---

  async markAsSent(
    historyId: string,
    options?: { providerId?: string; providerResponse?: Record<string, any> },
    transactionManager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(transactionManager);
    const updatePayload: Partial<NotificationHistory> = {
      status: NotificationStatus.SENT,
      sentAt: new Date(),
      metadata: {
        ...(options?.providerResponse
          ? { providerResponse: options.providerResponse }
          : {}),
        ...(options?.providerId ? { providerId: options.providerId } : {}),
      } as Record<string, any>,
    };

    // Merge existing metadata if any
    if (!transactionManager) {
      // safe update outside explicit transaction
      const existing = await repo.findOneBy({ id: historyId });
      if (existing) {
        updatePayload.metadata = {
          ...(existing.metadata ?? {}),
          ...(updatePayload.metadata ?? {}),
        };
      }
    } else {
      const existing = await repo.findOne({ where: { id: historyId } });
      if (existing)
        updatePayload.metadata = {
          ...(existing.metadata ?? {}),
          ...(updatePayload.metadata ?? {}),
        };
    }

    await repo.update(historyId, updatePayload as any);
    this.logger.log(`Marked NotificationHistory id=${historyId} as SENT`);
  }

  async markAsFailed(
    historyId: string,
    failureReason: string,
    options?: { retryable?: boolean; meta?: Record<string, any> },
    transactionManager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(transactionManager);
    const existing = await repo.findOneBy({ id: historyId });

    const metadata = {
      ...(existing?.metadata ?? {}),
      ...(options?.meta ?? {}),
      lastFailureAt: new Date().toISOString(),
      retryable: options?.retryable ?? false,
    };

    await repo.update(historyId, {
      status: NotificationStatus.FAILED,
      failureReason,
      metadata,
      sentAt: new Date(),
    } as any);
    this.logger.warn(
      `Marked NotificationHistory id=${historyId} as FAILED — reason=${failureReason}`,
    );
  }

  async incrementRetryCount(
    historyId: string,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);

    if (transactionManager) {
      const managerRepo = transactionManager.getRepository(NotificationHistory);

      const record = await managerRepo.findOneBy({ id: historyId });
      if (!record)
        throw new Error(`NotificationHistory ${historyId} not found`);

      if (record.status === NotificationStatus.SENT) {
        this.logger.warn(
          `Notification ${historyId} already SENT, skip increment retryCount.`,
        );
        return Number(record.metadata?.retryCount ?? 0);
      }

      const meta = { ...(record.metadata ?? {}) } as any;
      const current = Number(meta.retryCount ?? 0);
      const next = current + 1;
      meta.retryCount = next;

      await managerRepo.update(historyId, { metadata: meta } as any);
      this.logger.debug(
        `Incremented retryCount for id=${historyId} to ${next} (within transaction)`,
      );

      return next;
    } else {
      // Non-transaction (best-effort; not fully atomic)
      const record = await repo.findOneBy({ id: historyId });
      if (!record)
        throw new Error(`NotificationHistory ${historyId} not found`);

      const meta = { ...(record.metadata ?? {}) } as any;
      const current = Number(meta.retryCount ?? 0);
      const next = current + 1;
      meta.retryCount = next;

      await repo.update(historyId, { metadata: meta } as any);
      this.logger.debug(
        `Incremented retryCount for id=${historyId} to ${next}`,
      );

      return next;
    }
  }

  async findByUserId(
    userId: string,
    options: FindManyOptions<NotificationHistory> = {},
    transactionManager?: EntityManager,
  ): Promise<NotificationHistory[]> {
    const repo = this.getRepo(transactionManager);
    const { where = {}, orderBy, ...rest } = options;
    const mergedWhere = {
      ...(where as any),
      userId,
    } as WhereOperator<NotificationHistory>;
    const typeOrmOptions: TypeOrmFindManyOptions<NotificationHistory> = {
      ...rest,
      where: mapToTypeOrmWhere(mergedWhere as any),
      order: orderBy as FindOptionsOrder<NotificationHistory>,
    };
    return repo.find(typeOrmOptions);
  }

  async findPendingByTriggerEvent(
    triggerEvent: NotificationTriggerEvent,
    options?: { limit?: number; olderThan?: Date },
    transactionManager?: EntityManager,
  ): Promise<NotificationHistory[]> {
    const repo = this.getRepo(transactionManager);

    const where: FindOptionsWhere<NotificationHistory> = {
      status: NotificationStatus.PENDING,
      triggerEvent: triggerEvent,
    };

    if (options?.olderThan) {
      where.createdAt = LessThan(options.olderThan);
    }

    const findOptions: TypeOrmFindManyOptions<NotificationHistory> = {
      where,
      order: { createdAt: 'ASC' },
      take: options?.limit,
    };

    const list = await repo.find(findOptions);
    this.logger.debug(
      `Fetched ${list.length} pending NotificationHistory records for triggerEvent=${triggerEvent}`,
    );
    return list;
  }

  async findByIdForUpdate(
    id: string,
    transactionManager: EntityManager,
  ): Promise<NotificationHistory | null> {
    if (!transactionManager) {
      throw new Error(
        'findByIdForUpdate requires an active transaction manager',
      );
    }

    const repo = transactionManager.getRepository(NotificationHistory);
    const result = await repo.findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' }, // Áp dụng khóa bi quan trực tiếp
    });

    if (result) {
      this.logger.debug(`Locked NotificationHistory id=${id} for update`);
    }

    return result ?? null;
  }

  async findOneByTriggerAndMetadata(
    triggerEvent: NotificationTriggerEvent,
    metadataMatch: Record<string, any>,
    transactionManager?: EntityManager,
  ): Promise<NotificationHistory | null> {
    const repo = this.getRepo(transactionManager);

    const found = await repo.findOne({
      where: {
        triggerEvent,
        // Sử dụng Raw để inject một đoạn SQL cho toán tử JSONB @> của Postgres
        metadata: Raw((alias) => `${alias} @> :meta::jsonb`, {
          meta: JSON.stringify(metadataMatch),
        }),
      },
    });

    if (found)
      this.logger.debug(
        `Found NotificationHistory by triggerEvent+metadata, id=${found.id}`,
      );
    return found ?? null;
  }

  async cleanupOld(
    options: { olderThan: Date; statuses?: NotificationStatus[] },
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);

    const where: FindOptionsWhere<NotificationHistory> = {
      createdAt: LessThan(options.olderThan),
    };

    if (options.statuses && options.statuses.length > 0) {
      where.status = In(options.statuses);
    }

    const result = await repo.delete(where);
    const affected = result.affected ?? 0;
    this.logger.log(
      `Cleaned up ${affected} old NotificationHistory records (olderThan=${options.olderThan.toISOString()})`,
    );
    return affected;
  }
}
