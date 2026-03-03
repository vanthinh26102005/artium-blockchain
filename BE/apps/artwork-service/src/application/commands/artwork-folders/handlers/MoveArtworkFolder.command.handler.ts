import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import { MoveArtworkFolderCommand } from '../MoveArtworkFolder.command';
import {
  ArtworkFolder,
  IArtworkFolderRepository,
} from 'apps/artwork-service/src/domain';

@CommandHandler(MoveArtworkFolderCommand)
export class MoveArtworkFolderHandler implements ICommandHandler<MoveArtworkFolderCommand> {
  private readonly logger = new Logger(MoveArtworkFolderHandler.name);

  constructor(
    @Inject(IArtworkFolderRepository)
    private readonly repo: IArtworkFolderRepository,
  ) {}

  /**
   * Helper: kiểm tra xem newParent có phải là descendant của folder không
   */
  private async isDescendant(
    folderId: string,
    newParentId: string,
  ): Promise<boolean> {
    const sellerId = (await this.repo.findById(folderId))?.sellerId;
    if (!sellerId) return false;

    const folderTree = await this.repo.findFolderTree(sellerId);
    const findNode = (id: string, nodes: any[]): any | null => {
      for (const n of nodes) {
        if (String(n.id) === String(id)) return n;
        const child = n.children && findNode(id, n.children);
        if (child) return child;
      }
      return null;
    };

    const currentNode = findNode(folderId, folderTree);
    if (!currentNode) return false;

    const search = (node: any): boolean => {
      if (String(node.id) === String(newParentId)) return true;
      return (node.children || []).some((child: any) => search(child));
    };

    return search(currentNode);
  }

  async execute(command: MoveArtworkFolderCommand): Promise<ArtworkFolder> {
    const reqId = `moveFolder:${Date.now()}`;
    const { folderId, newParentId } = command;

    this.logger.log(
      `[${reqId}] Moving folder ${folderId} → parent ${newParentId}`,
    );

    if (!folderId)
      throw RpcExceptionHelper.badRequest('Folder ID is required.');

    try {
      const folder = await this.repo.findById(folderId);
      if (!folder) {
        this.logger.warn(`[${reqId}] Folder not found id=${folderId}`);
        throw RpcExceptionHelper.notFound(
          `Folder with id=${folderId} not found`,
        );
      }

      // Self-parent validation
      if (newParentId && String(folderId) === String(newParentId)) {
        throw RpcExceptionHelper.badRequest(
          'A folder cannot be its own parent.',
        );
      }

      // Seller consistency check
      if (newParentId) {
        const newParent = await this.repo.findById(newParentId);
        if (!newParent) {
          throw RpcExceptionHelper.notFound(
            `Target parent folder id=${newParentId} not found.`,
          );
        }
        if (String(newParent.sellerId) !== String(folder.sellerId)) {
          throw RpcExceptionHelper.badRequest(
            'Cannot move folder to another seller’s folder.',
          );
        }

        // Cycle detection (prevent moving into descendant)
        const isCycle = await this.isDescendant(folderId, newParentId);
        if (isCycle) {
          throw RpcExceptionHelper.badRequest(
            'Cannot move a folder into its own descendant.',
          );
        }
      }

      const moved = await this.repo.moveFolder(folderId, newParentId ?? null);
      if (!moved) {
        this.logger.error(
          `[${reqId}] Move operation failed for folder=${folderId}`,
        );
        throw RpcExceptionHelper.internalError(
          'Failed to move artwork folder.',
        );
      }

      const updated = await this.repo.findById(folderId);
      this.logger.log(
        `[${reqId}] Successfully moved folder=${folderId} → parent=${newParentId}`,
      );
      return updated!;
    } catch (err) {
      this.logger.error(
        `[${reqId}] Move failed folder=${folderId}`,
        err.stack || err,
      );

      // Re-throw known exceptions, wrap unknown ones
      if (err instanceof RpcException) throw err;
      throw RpcExceptionHelper.internalError(
        'Unexpected error while moving artwork folder.',
      );
    }
  }
}
