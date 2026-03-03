import { EntityManager } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';

export interface TransactionOptions {
  isolationLevel?: IsolationLevel;
}

export const ITransactionService = Symbol('ITransactionService');

export interface ITransactionService {
  execute<T>(
    work: (manager: EntityManager) => Promise<T>,
    options?: TransactionOptions,
  ): Promise<T>;
}
