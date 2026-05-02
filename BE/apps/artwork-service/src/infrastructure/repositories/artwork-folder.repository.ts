import {
  FindManyOptions,
  FindOneOptions,
  WhereOperator,
  RpcExceptionHelper,
} from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { mapToTypeOrmWhere, SortDirection } from '@app/common';
import {
  EntityManager,
  Equal,
  FindOptionsOrder,
  In,
  IsNull,
  Repository,
  FindManyOptions as TypeOrmFindManyOptions,
  FindOneOptions as TypeOrmFindOneOptions,
} from 'typeorm';
import { Artwork, ArtworkFolder, IArtworkFolderRepository } from '../../domain';

@Injectable()
export class ArtworkFolderRepository implements IArtworkFolderRepository {
  constructor(
    @InjectRepository(ArtworkFolder)
    private readonly ormRepository: Repository<ArtworkFolder>,
  ) {}

  private getRepo(
    transactionManager?: EntityManager,
  ): Repository<ArtworkFolder> {
    return transactionManager
      ? transactionManager.getRepository(ArtworkFolder)
      : this.ormRepository;
  }

  async create(
    data: Omit<ArtworkFolder, 'id' | 'createdAt'>,
    transactionManager?: EntityManager,
  ): Promise<ArtworkFolder> {
    const repo = this.getRepo(transactionManager);
    const folder = repo.create(data);
    return repo.save(folder);
  }

  async update(
    id: string,
    data: Partial<ArtworkFolder>,
    transactionManager?: EntityManager,
  ): Promise<ArtworkFolder | null> {
    const repo = this.getRepo(transactionManager);
    const folder = await repo.findOneBy({ id });
    if (!folder) return null;

    repo.merge(folder, data);
    return repo.save(folder);
  }

  async delete(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const repo = this.getRepo(transactionManager);

    const result = await repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findById(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<ArtworkFolder | null> {
    return this.getRepo(transactionManager).findOneBy({ id });
  }

  async findOne(
    options: FindOneOptions<ArtworkFolder>,
    transactionManager?: EntityManager,
  ): Promise<ArtworkFolder | null> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindOneOptions<ArtworkFolder> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<ArtworkFolder>,
    };
    return this.getRepo(transactionManager).findOne(typeOrmOptions);
  }

  async find(
    options?: FindManyOptions<ArtworkFolder>,
    transactionManager?: EntityManager,
  ): Promise<ArtworkFolder[]> {
    const { where, orderBy, ...rest } = options ?? {};
    const typeOrmOptions: TypeOrmFindManyOptions<ArtworkFolder> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<ArtworkFolder>,
    };
    return this.getRepo(transactionManager).find(typeOrmOptions);
  }

  async count(
    where?: WhereOperator<ArtworkFolder>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    return this.getRepo(transactionManager).count({ where: typeOrmWhere });
  }

  async exists(
    where: WhereOperator<ArtworkFolder>,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    return this.getRepo(transactionManager).exists({ where: typeOrmWhere });
  }

  async createMany(
    data: Omit<ArtworkFolder, 'id'>[],
    transactionManager?: EntityManager,
  ): Promise<ArtworkFolder[]> {
    const repo = this.getRepo(transactionManager);
    const folders = repo.create(data);
    return repo.save(folders);
  }

  async updateMany(
    where: WhereOperator<ArtworkFolder>,
    data: Partial<ArtworkFolder>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    const result = await this.getRepo(transactionManager).update(
      typeOrmWhere,
      data,
    );
    return result.affected ?? 0;
  }

  async deleteMany(
    where: WhereOperator<ArtworkFolder>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    const result = await this.getRepo(transactionManager).delete(typeOrmWhere);
    return result.affected ?? 0;
  }

  async findRootFolders(
    sellerId: string,
    transactionManager?: EntityManager,
  ): Promise<ArtworkFolder[]> {
    const repo = this.getRepo(transactionManager);
    return repo.find({
      where: {
        sellerId: Equal(sellerId),
        parent: IsNull(),
      },
      order: { position: SortDirection.ASC },
    });
  }

  async findFolderTree(
    sellerId: string,
    transactionManager?: EntityManager,
  ): Promise<ArtworkFolder[]> {
    const repo = this.getRepo(transactionManager);

    // Fetch all folders for this seller
    const allFolders = await repo.find({
      where: { sellerId: Equal(sellerId) },
      order: { position: SortDirection.ASC },
    });

    // Build tree structure manually
    const folderMap = new Map<
      string,
      ArtworkFolder & { children: ArtworkFolder[] }
    >();
    const roots: (ArtworkFolder & { children: ArtworkFolder[] })[] = [];

    // First pass: create map with empty children arrays
    allFolders.forEach((folder) => {
      folderMap.set(folder.id, { ...folder, children: [] });
    });

    // Second pass: build parent-child relationships
    allFolders.forEach((folder) => {
      const folderWithChildren = folderMap.get(folder.id)!;
      if (folder.parentId && folderMap.has(folder.parentId)) {
        folderMap.get(folder.parentId)!.children.push(folderWithChildren);
      } else {
        roots.push(folderWithChildren);
      }
    });

    return roots;
  }

  async findChildren(
    parentId: string,
    transactionManager?: EntityManager,
  ): Promise<ArtworkFolder[]> {
    const repo = this.getRepo(transactionManager);
    return repo.find({
      where: {
        parent: { id: parentId },
      },
      order: { position: SortDirection.ASC },
    });
  }

  async moveFolder(
    folderId: string,
    newParentId: string | null,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const repo = this.getRepo(transactionManager);

    const folderToMove = await repo.findOne({
      where: { id: folderId },
      relations: ['parent'],
    });

    if (!folderToMove) {
      throw RpcExceptionHelper.notFound(
        `Folder with ID ${folderId} not found.`,
      );
    }

    let newParent: ArtworkFolder | null = null;

    if (newParentId) {
      newParent = await repo.findOne({ where: { id: newParentId } });

      if (!newParent) {
        throw RpcExceptionHelper.notFound(
          `New parent folder with ID ${newParentId} not found.`,
        );
      }

      if (newParent.id === folderId) {
        throw RpcExceptionHelper.badRequest(
          `Cannot move a folder into itself.`,
        );
      }
    }

    folderToMove.parent = newParent;
    await repo.save(folderToMove);

    return true;
  }

  async deleteFolderTree(
    folderId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(transactionManager);
    const folder = await this.findById(folderId, transactionManager);

    if (!folder) return;

    // Get all descendant folder IDs recursively
    const descendantIds = await this.getDescendantIds(
      folderId,
      transactionManager,
    );
    const allFolderIds = [folderId, ...descendantIds];

    // Delete all folders (cascade will handle artworks if configured)
    await repo.delete({ id: In(allFolderIds) });
  }

  private async getDescendantIds(
    folderId: string,
    transactionManager?: EntityManager,
  ): Promise<string[]> {
    const children = await this.findChildren(folderId, transactionManager);
    const descendantIds: string[] = [];

    for (const child of children) {
      descendantIds.push(child.id);
      const childDescendants = await this.getDescendantIds(
        child.id,
        transactionManager,
      );
      descendantIds.push(...childDescendants);
    }

    return descendantIds;
  }

  async findArtworksInFolder(
    folderId: string,
    transactionManager?: EntityManager,
  ): Promise<Artwork[] | null> {
    const repo = this.getRepo(transactionManager);
    const folder = await repo.findOne({
      where: { id: folderId },
      relations: ['artworks'],
    });

    return folder ? folder.artworks : [];
  }

  async countArtworksRecursive(
    folderId: string,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const folder = await this.findById(folderId, transactionManager);
    if (!folder) return 0;

    // Get all descendant folder IDs
    const descendantIds = await this.getDescendantIds(
      folderId,
      transactionManager,
    );
    const folderIds = [folderId, ...descendantIds];

    // Count artworks in all folders including the parent
    return this.getRepo(transactionManager)
      .manager.getRepository(Artwork)
      .count({
        where: {
          folder: {
            id: In(folderIds),
          },
        },
      });
  }

  async createDefaultRootFolder(
    sellerId: string,
    transactionManager?: EntityManager,
  ): Promise<ArtworkFolder> {
    const repo = this.getRepo(transactionManager);
    const defaultFolder = repo.create({
      name: 'Root Folder',
      sellerId: sellerId,
      position: 0,
      isHidden: false,
      parent: null,
    });
    return repo.save(defaultFolder);
  }

  async findDefaultRootFolder(
    sellerId: string,
    transactionManager?: EntityManager,
  ): Promise<ArtworkFolder | null> {
    return this.findOne(
      {
        where: {
          sellerId: { $eq: sellerId },
          parentId: { $eq: null },
        },
        orderBy: { createdAt: SortDirection.ASC },
      },
      transactionManager,
    );
  }
}
