import { EntityManager } from 'typeorm';
import { CommunityMediaStatus, CommunityMediaUploadContext } from '@app/common';
import { CommunityMedia } from '../entities/community-media.entity';

export const ICommunityMediaRepository = Symbol('ICommunityMediaRepository');

export interface ICommunityMediaRepository {
  create(
    data: Partial<CommunityMedia>,
    transactionManager?: EntityManager,
  ): Promise<CommunityMedia>;

  findById(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<CommunityMedia | null>;

  findByIds(
    ids: string[],
    transactionManager?: EntityManager,
  ): Promise<CommunityMedia[]>;

  findPendingByOwner(
    ownerId: string,
    uploadContext?: CommunityMediaUploadContext,
    transactionManager?: EntityManager,
  ): Promise<CommunityMedia[]>;

  markConsumed(
    id: string,
    consumedByType: string,
    consumedById: string,
    transactionManager?: EntityManager,
  ): Promise<CommunityMedia | null>;

  markRejected(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<CommunityMedia | null>;

  update(
    id: string,
    data: Partial<CommunityMedia>,
    transactionManager?: EntityManager,
  ): Promise<CommunityMedia | null>;
}
