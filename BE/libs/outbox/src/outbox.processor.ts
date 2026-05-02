import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { OutboxEntity, OutboxStatus } from './entities/outbox.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);

  constructor(
    @InjectRepository(OutboxEntity)
    private readonly outboxRepository: Repository<OutboxEntity>,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron() {
    const isEnabled = (process.env.OUTBOX_PROCESSOR_ENABLED ?? 'true')
      .trim()
      .toLowerCase();
    if (isEnabled === 'false') {
      this.logger.debug(
        'OutboxProcessor disabled by OUTBOX_PROCESSOR_ENABLED=false',
      );
      return;
    }

    const now = new Date();

    let messages: OutboxEntity[];
    try {
      messages = await this.outboxRepository
        .createQueryBuilder('outbox')
        .where('outbox.status = :status', { status: OutboxStatus.PENDING })
        .andWhere('outbox.attempts < outbox.maxAttempts')
        .andWhere('outbox.availableAt <= :now', { now })
        .orderBy('outbox.createdAt', 'ASC')
        .limit(50)
        .getMany();
    } catch (error: any) {
      // Handle case where table doesn't exist yet (42P01 = undefined_table)
      if (error?.code === '42P01') {
        this.logger.warn(
          'Outbox table not found. Waiting for database synchronization...',
        );
        return;
      }
      throw error;
    }

    if (!messages.length) return;

    for (const message of messages) {
      try {
        if (!message.exchange || !message.routingKey) {
          throw new Error(
            'Exchange or routingKey is missing in Outbox message',
          );
        }

        this.logger.debug(
          `Publishing event=${message.eventType} aggregate=${message.aggregateType} id=${message.aggregateId} ` +
            `(exchange=${message.exchange}, routingKey=${message.routingKey})`,
        );

        await this.amqpConnection.publish(
          message.exchange,
          message.routingKey,
          message.payload,
        );

        message.status = OutboxStatus.PUBLISHED;
        message.attempts += 1;
        message.lastError = null;
        await this.outboxRepository.save(message);

        this.logger.log(
          `Published event=${message.eventType} id=${message.id}`,
        );
      } catch (error: any) {
        message.attempts += 1;
        message.lastError = error?.message ?? 'Unknown error';

        if (message.attempts >= message.maxAttempts) {
          message.status = OutboxStatus.FAILED;
          this.logger.error(
            `Failed permanently event=${message.eventType} id=${message.id}: ${message.lastError}`,
          );
        } else {
          const delayMs = Math.pow(2, message.attempts) * 1000;
          message.availableAt = new Date(Date.now() + delayMs);

          this.logger.warn(
            `Retry scheduled (attempt ${message.attempts}/${message.maxAttempts}) event=${message.eventType} id=${message.id}, next try at ${message.availableAt.toISOString()}: ${message.lastError}`,
          );
        }

        await this.outboxRepository.save(message);
      }
    }
  }
}
