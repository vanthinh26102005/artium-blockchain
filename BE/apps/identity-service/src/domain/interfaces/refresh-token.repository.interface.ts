import { EntityManager } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';

export const IRefreshTokenRepository = Symbol('IRefreshTokenRepository');

export interface IRefreshTokenRepository {
  findByToken(token: string): Promise<RefreshToken | null>;
  findByUserId(userId: string): Promise<RefreshToken[]>;
  save(refreshToken: RefreshToken): Promise<RefreshToken>;

  create(data: Partial<RefreshToken>, manager?: EntityManager): RefreshToken;

  update(
    criteria: Partial<RefreshToken>,
    data: Partial<RefreshToken>,
    manager?: EntityManager,
  ): Promise<void>;

  revokeByToken(token: string, manager?: EntityManager): Promise<void>;
  revokeByUser(userId: string, manager?: EntityManager): Promise<void>;

  deleteByToken(token: string, manager?: EntityManager): Promise<void>;
  deleteByUser(userId: string, manager?: EntityManager): Promise<void>;
}
