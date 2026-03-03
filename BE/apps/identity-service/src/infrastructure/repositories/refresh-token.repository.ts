import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.repository.interface';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly ormRepository: Repository<RefreshToken>,
  ) {}

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.ormRepository.findOne({
      where: { token },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    return this.ormRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async save(
    refreshToken: RefreshToken,
    manager?: EntityManager,
  ): Promise<RefreshToken> {
    const repo = manager
      ? manager.getRepository(RefreshToken)
      : this.ormRepository;
    return repo.save(refreshToken);
  }

  create(data: Partial<RefreshToken>, manager?: EntityManager): RefreshToken {
    const repo = manager
      ? manager.getRepository(RefreshToken)
      : this.ormRepository;
    return repo.create(data);
  }

  async update(
    criteria: Partial<RefreshToken>,
    data: Partial<RefreshToken>,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager
      ? manager.getRepository(RefreshToken)
      : this.ormRepository;
    await repo.update(criteria, data);
  }

  async revokeByToken(token: string, manager?: EntityManager): Promise<void> {
    const repo = manager
      ? manager.getRepository(RefreshToken)
      : this.ormRepository;
    await repo.update({ token }, { revoked: true });
  }

  async revokeByUser(userId: string, manager?: EntityManager): Promise<void> {
    const repo = manager
      ? manager.getRepository(RefreshToken)
      : this.ormRepository;
    await repo.update({ user: { id: userId } }, { revoked: true });
  }

  async deleteByToken(token: string, manager?: EntityManager): Promise<void> {
    const repo = manager
      ? manager.getRepository(RefreshToken)
      : this.ormRepository;
    await repo.delete({ token });
  }

  async deleteByUser(userId: string, manager?: EntityManager): Promise<void> {
    const repo = manager
      ? manager.getRepository(RefreshToken)
      : this.ormRepository;
    await repo.delete({ user: { id: userId } });
  }
}
