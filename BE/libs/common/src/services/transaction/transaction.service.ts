import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { randomUUID } from 'crypto';
import {
  ITransactionService,
  TransactionOptions,
} from './itransaction.service';

@Injectable()
export class TransactionService implements ITransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(private readonly dataSource: DataSource) {}

  async execute<T>(
    work: (manager: EntityManager) => Promise<T>,
    options?: TransactionOptions,
  ): Promise<T> {
    const transactionId = randomUUID();
    const isolationLevel = options?.isolationLevel || 'DEFAULT';

    this.logger.log(
      `Bắt đầu Transaction [ID: ${transactionId}] với Isolation Level: ${isolationLevel}`,
    );

    try {
      let result: T;

      if (options?.isolationLevel) {
        result = await this.dataSource.transaction(
          options.isolationLevel,
          work,
        );
      } else {
        result = await this.dataSource.transaction(work);
      }

      this.logger.log(
        `Transaction [ID: ${transactionId}] đã được COMMIT thành công.`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Transaction [ID: ${transactionId}] thất bại và đã được ROLLBACK. Lỗi: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }
}
