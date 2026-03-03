import { Injectable, Logger } from '@nestjs/common';
import { Repository, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OutboxEntity, OutboxStatus } from './entities/outbox.entity';

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(
    @InjectRepository(OutboxEntity)
    private readonly outboxRepository: Repository<OutboxEntity>,
  ) {}

  async createOutboxMessage(
    payload: {
      aggregateType: string;
      aggregateId: string;
      eventType: string;
      payload: Record<string, any>;
      exchange: string;
      routingKey: string;
    },
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager
      ? manager.getRepository(OutboxEntity)
      : this.outboxRepository;

    try {
      this.logger.debug({
        message: 'Preparing to create Outbox message',
        aggregateType: payload.aggregateType,
        aggregateId: payload.aggregateId,
        eventType: payload.eventType,
        exchange: payload.exchange,
        routingKey: payload.routingKey,
        usingTransaction: !!manager,
      });

      const message = repo.create({
        ...payload,
        status: OutboxStatus.PENDING,
        attempts: 0,
        maxAttempts: 5,
        availableAt: new Date(),
      });

      await repo.save(message);

      this.logger.log({
        message: 'Outbox message persisted successfully',
        id: message.id,
        aggregateType: payload.aggregateType,
        aggregateId: payload.aggregateId,
        eventType: payload.eventType,
        status: OutboxStatus.PENDING,
      });
    } catch (error) {
      this.logger.error(
        `Failed to create Outbox message for eventType=${payload.eventType}, aggregate=${payload.aggregateType}:${payload.aggregateId}`,
        error.stack,
      );
      throw error; // để upstream xử lý tiếp
    }
  }
}
