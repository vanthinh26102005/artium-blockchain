import { FindManyOptions, IRepository } from '@app/common';
import { EntityManager } from 'typeorm';
import { Moodboard } from '../entities/moodboards.entity';
import { MoodboardArtwork } from '../entities/moodboard_artworks.entity';
import { CreateMoodboardInput, UpdateMoodboardInput } from '../dtos';

export const IMoodboardRepository = Symbol('IMoodboardRepository');

export interface IMoodboardRepository extends IRepository<Moodboard, string> {
  create(
    data: CreateMoodboardInput | Omit<Moodboard, 'id' | 'createdAt'>,
    transactionManager?: EntityManager,
  ): Promise<Moodboard>;

  update(
    id: string,
    data: UpdateMoodboardInput | Partial<Moodboard>,
    transactionManager?: EntityManager,
  ): Promise<Moodboard | null>;

  findByUserId(
    userId: string,
    options?: FindManyOptions<Moodboard>,
    transactionManager?: EntityManager,
  ): Promise<Moodboard[]>;

  findPublicByUserId(
    userId: string,
    options?: FindManyOptions<Moodboard>,
    transactionManager?: EntityManager,
  ): Promise<Moodboard[]>;

  findCollaborative(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<Moodboard[]>;

  incrementArtworkCount(
    id: string,
    increment: number,
    transactionManager?: EntityManager,
  ): Promise<void>;

  incrementLikeCount(
    id: string,
    increment: number,
    transactionManager?: EntityManager,
  ): Promise<void>;

  incrementViewCount(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<void>;

  incrementShareCount(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<void>;

  reorder(
    userId: string,
    moodboardIds: string[],
    transactionManager?: EntityManager,
  ): Promise<void>;
}

export const IMoodboardArtworkRepository = Symbol(
  'IMoodboardArtworkRepository',
);

export interface IMoodboardArtworkRepository extends IRepository<
  MoodboardArtwork,
  any
> {
  addArtwork(
    moodboardId: string,
    artworkId: string,
    data: Partial<MoodboardArtwork>,
    transactionManager?: EntityManager,
  ): Promise<MoodboardArtwork>;

  removeArtwork(
    moodboardId: string,
    artworkId: string,
    transactionManager?: EntityManager,
  ): Promise<boolean>;

  findByMoodboardId(
    moodboardId: string,
    transactionManager?: EntityManager,
  ): Promise<MoodboardArtwork[]>;

  findByArtworkId(
    artworkId: string,
    transactionManager?: EntityManager,
  ): Promise<MoodboardArtwork[]>;

  updateArtwork(
    moodboardId: string,
    artworkId: string,
    data: Partial<MoodboardArtwork>,
    transactionManager?: EntityManager,
  ): Promise<MoodboardArtwork | null>;

  reorderArtworks(
    moodboardId: string,
    artworkIds: string[],
    transactionManager?: EntityManager,
  ): Promise<void>;

  isArtworkInMoodboard(
    moodboardId: string,
    artworkId: string,
    transactionManager?: EntityManager,
  ): Promise<boolean>;
}
