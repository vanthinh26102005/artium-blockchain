import { IRepository } from '@app/common';
import { EntityManager } from 'typeorm';
import { CreateUserInput, UpdateUserInput, User } from '../../domain';

export const IUserRepository = Symbol('IUserRepository');
export interface IUserRepository extends IRepository<User, string> {
  updateLastLogin(
    userId: string,
    loginDate: Date,
    transactionManager?: EntityManager,
  ): Promise<void>;

  activate(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<User | null>;

  deactivate(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<User | null>;

  findByEmail(
    email: string,
    transactionManager?: EntityManager,
  ): Promise<User | null>;

  findActiveByEmail(
    email: string,
    transactionManager?: EntityManager,
  ): Promise<User | null>;

  findByStripeCustomerId(
    stripeCustomerId: string,
    transactionManager?: EntityManager,
  ): Promise<User | null>;

  create(
    data: CreateUserInput,
    transactionManager?: EntityManager,
  ): Promise<User>;

  update(
    userId: string,
    data: UpdateUserInput,
    transactionManager?: EntityManager,
  ): Promise<User | null>;
}
