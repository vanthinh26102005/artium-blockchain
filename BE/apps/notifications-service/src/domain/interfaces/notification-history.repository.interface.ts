import { FindManyOptions, IRepository } from '@app/common';
import { EntityManager } from 'typeorm';
import {
  CreateNotificationHistoryInput,
  NotificationHistory,
  NotificationStatus,
  NotificationTriggerEvent,
  UpdateNotificationHistoryInput,
} from '../../domain';

export const INotificationHistoryRepository = Symbol(
  'INotificationHistoryRepository',
);

export interface INotificationHistoryRepository extends IRepository<
  NotificationHistory,
  string
> {
  create(
    data: CreateNotificationHistoryInput,
    transactionManager?: EntityManager,
  ): Promise<NotificationHistory>;

  update(
    id: string,
    data: UpdateNotificationHistoryInput,
    transactionManager?: EntityManager,
  ): Promise<NotificationHistory | null>;

  markAsSent(
    historyId: string,
    options?: { providerId?: string; providerResponse?: Record<string, any> },
    transactionManager?: EntityManager,
  ): Promise<void>;

  markAsFailed(
    historyId: string,
    failureReason: string,
    options?: { retryable?: boolean; meta?: Record<string, any> },
    transactionManager?: EntityManager,
  ): Promise<void>;

  incrementRetryCount(
    historyId: string,
    transactionManager?: EntityManager,
  ): Promise<number>;

  findByUserId(
    userId: string,
    options?: FindManyOptions<NotificationHistory>,
    transactionManager?: EntityManager,
  ): Promise<NotificationHistory[]>;

  findPendingByTriggerEvent(
    triggerEvent: NotificationTriggerEvent | string,
    options?: { limit?: number; olderThan?: Date },
    transactionManager?: EntityManager,
  ): Promise<NotificationHistory[]>;

  findByIdForUpdate(
    id: string,
    transactionManager: EntityManager,
  ): Promise<NotificationHistory | null>;

  findOneByTriggerAndMetadata(
    triggerEvent: NotificationTriggerEvent | string,
    metadataMatch: Record<string, any>,
    transactionManager?: EntityManager,
  ): Promise<NotificationHistory | null>;

  cleanupOld(
    options: { olderThan: Date; statuses?: NotificationStatus[] },
    transactionManager?: EntityManager,
  ): Promise<number>;
}
