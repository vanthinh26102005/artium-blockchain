import { IRepository } from '@app/common';
import { ArtworkFolder } from '../entities/artwork-folder.entity';
import { Artwork } from '../entities/artworks.entity';
import { EntityManager } from 'typeorm';

export const IArtworkFolderRepository = Symbol('IArtworkFolderRepository');

export interface IArtworkFolderRepository extends IRepository<
  ArtworkFolder,
  string
> {
  findRootFolders(
    sellerId: string,
    transactionManager?: EntityManager,
  ): Promise<ArtworkFolder[]>;

  findFolderTree(
    sellerId: string,
    transactionManager?: EntityManager,
  ): Promise<ArtworkFolder[]>;

  findChildren(
    parentId: string,
    transactionManager?: EntityManager,
  ): Promise<ArtworkFolder[]>;

  moveFolder(
    folderId: string,
    newParentId: string | null,
    transactionManager?: EntityManager,
  ): Promise<boolean>;

  deleteFolderTree(
    folderId: string,
    transactionManager?: EntityManager,
  ): Promise<void>;

  findArtworksInFolder(
    folderId: string,
    transactionManager?: EntityManager,
  ): Promise<Artwork[] | null>;

  countArtworksRecursive(
    folderId: string,
    transactionManager?: EntityManager,
  ): Promise<number>;

  createDefaultRootFolder(
    sellerId: string,
    transactionManager?: EntityManager,
  ): Promise<ArtworkFolder>;

  findDefaultRootFolder(
    sellerId: string,
    transactionManager?: EntityManager,
  ): Promise<ArtworkFolder | null>;
}
