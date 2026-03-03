import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  ArtworkFolderObject,
  ArtworkObject,
  CreateArtworkFolderInput,
  MoveFolderInput,
  UpdateArtworkFolderInput,
  ReorderFoldersInput,
} from '../../domain';

import {
  CountArtworksInFolderQuery,
  CreateArtworkFolderCommand,
  CreateDefaultRootFolderCommand,
  DeleteArtworkFolderCommand,
  FindArtworksInFolderQuery,
  GetArtworkFolderQuery,
  GetFolderTreeQuery,
  ListArtworkFoldersQuery,
  MoveArtworkFolderCommand,
  ReorderFoldersCommand,
  ToggleFolderVisibilityCommand,
  UpdateArtworkFolderCommand,
} from '../../application';

@Controller()
export class ArtworkFoldersMicroserviceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern({ cmd: 'get_artwork_folder' })
  async getArtworkFolder(
    @Payload() data: { id: string },
  ): Promise<ArtworkFolderObject | null> {
    return this.queryBus.execute(new GetArtworkFolderQuery(data.id));
  }

  @MessagePattern({ cmd: 'get_artwork_folders' })
  async getArtworkFolders(
    @Payload()
    data: {
      sellerId?: string;
      parentId?: string;
      includeCounts?: string;
    },
  ): Promise<ArtworkFolderObject[]> {
    const includeCountsBool =
      data.includeCounts === 'true' || data.includeCounts === '1';
    const options = { sellerId: data.sellerId, parentId: data.parentId };

    return this.queryBus.execute(
      new ListArtworkFoldersQuery(options, includeCountsBool),
    );
  }

  @MessagePattern({ cmd: 'get_folder_tree' })
  async getFolderTree(
    @Payload() data: { sellerId: string },
  ): Promise<ArtworkFolderObject[]> {
    return this.queryBus.execute(new GetFolderTreeQuery(data.sellerId));
  }

  @MessagePattern({ cmd: 'find_artworks_in_folder' })
  async findArtworksInFolder(
    @Payload() data: { folderId: string },
  ): Promise<ArtworkObject[]> {
    return this.queryBus.execute(new FindArtworksInFolderQuery(data.folderId));
  }

  @MessagePattern({ cmd: 'count_artworks_in_folder' })
  async countArtworksInFolder(
    @Payload() data: { folderId: string },
  ): Promise<number> {
    return this.queryBus.execute(new CountArtworksInFolderQuery(data.folderId));
  }

  @MessagePattern({ cmd: 'create_artwork_folder' })
  async createArtworkFolder(
    @Payload() input: CreateArtworkFolderInput,
  ): Promise<ArtworkFolderObject> {
    return this.commandBus.execute(new CreateArtworkFolderCommand(input));
  }

  @MessagePattern({ cmd: 'update_artwork_folder' })
  async updateArtworkFolder(
    @Payload() data: { id: string; input: UpdateArtworkFolderInput },
  ): Promise<ArtworkFolderObject> {
    return this.commandBus.execute(
      new UpdateArtworkFolderCommand(data.id, data.input),
    );
  }

  @MessagePattern({ cmd: 'delete_artwork_folder' })
  async deleteArtworkFolder(
    @Payload() data: { id: string },
  ): Promise<{ success: boolean }> {
    await this.commandBus.execute(new DeleteArtworkFolderCommand(data.id));
    return { success: true };
  }

  @MessagePattern({ cmd: 'move_artwork_folder' })
  async moveArtworkFolder(
    @Payload() input: MoveFolderInput,
  ): Promise<ArtworkFolderObject> {
    return this.commandBus.execute(
      new MoveArtworkFolderCommand(input.folderId, input.newParentId || null),
    );
  }

  @MessagePattern({ cmd: 'create_default_root_folder' })
  async createDefaultRootFolder(
    @Payload() data: { sellerId: string },
  ): Promise<ArtworkFolderObject> {
    return this.commandBus.execute(
      new CreateDefaultRootFolderCommand(data.sellerId),
    );
  }

  @MessagePattern({ cmd: 'reorder_folders' })
  async reorderFolders(
    @Payload() body: ReorderFoldersInput,
  ): Promise<{ success: boolean; folders: ArtworkFolderObject[] }> {
    return this.commandBus.execute(
      new ReorderFoldersCommand(body.sellerId, body.folderIds),
    );
  }

  @MessagePattern({ cmd: 'toggle_folder_visibility' })
  async toggleFolderVisibility(
    @Payload() data: { id: string; sellerId: string; isHidden: boolean },
  ): Promise<{ folder: ArtworkFolderObject }> {
    return this.commandBus.execute(
      new ToggleFolderVisibilityCommand(data.id, data.isHidden, data.sellerId),
    );
  }
}
