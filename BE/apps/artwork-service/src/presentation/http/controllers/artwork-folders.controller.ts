import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  HttpException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';

import {
  ArtworkFolderObject,
  ArtworkObject,
  CreateArtworkFolderInput,
  UpdateArtworkFolderInput,
  MoveFolderInput,
  ReorderFoldersInput,
  FindManyArtworkFolderInput,
} from '../../../domain';

import {
  CreateArtworkFolderCommand,
  UpdateArtworkFolderCommand,
  DeleteArtworkFolderCommand,
  MoveArtworkFolderCommand,
  ReorderFoldersCommand,
  ToggleFolderVisibilityCommand,
  CreateDefaultRootFolderCommand,
  GetArtworkFolderQuery,
  ListArtworkFoldersQuery,
  GetFolderTreeQuery,
  FindArtworksInFolderQuery,
  CountArtworksInFolderQuery,
} from '../../../application';

@ApiTags('artwork-folders')
@Controller('artwork-folders')
export class ArtworkFoldersController {
  private readonly logger = new Logger(ArtworkFoldersController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get artwork folder by ID',
    description: 'Retrieves a specific artwork folder by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the artwork folder',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Artwork folder retrieved successfully',
    type: ArtworkFolderObject,
  })
  @ApiResponse({
    status: 404,
    description: 'Artwork folder not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid folder ID format',
  })
  async getArtworkFolder(
    @Param('id') id: string,
  ): Promise<ArtworkFolderObject | null> {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworkFoldersController] [ReqID: ${requestId}] - Getting artwork folder by ID: ${id}`,
    );

    try {
      if (!id || id.trim() === '') {
        throw new BadRequestException('Folder ID is required');
      }

      if (id.length < 10) {
        throw new BadRequestException('Invalid folder ID format');
      }

      const folder = await this.queryBus.execute(new GetArtworkFolderQuery(id));

      if (!folder) {
        this.logger.warn(
          `[ArtworkFoldersController] [ReqID: ${requestId}] - Artwork folder not found: ${id}`,
        );
        return null;
      }

      this.logger.log(
        `[ArtworkFoldersController] [ReqID: ${requestId}] - Artwork folder retrieved successfully: ${id}`,
      );
      return folder;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworkFoldersController] [ReqID: ${requestId}] - Unexpected error: get artwork folder`,
        {
          id,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to retrieve artwork folder',
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: 'List artwork folders',
    description:
      'Retrieves a list of artwork folders with optional filtering and item counts',
  })
  @ApiQuery({
    name: 'sellerId',
    required: false,
    description: 'Filter by seller ID',
    type: 'string',
  })
  @ApiQuery({
    name: 'parentId',
    required: false,
    description: 'Filter by parent folder ID',
    type: 'string',
  })
  @ApiQuery({
    name: 'includeCounts',
    required: false,
    description: 'Include artwork counts for each folder',
    type: 'boolean',
  })
  @ApiResponse({
    status: 200,
    description:
      'Artwork folders listed successfully (with itemCount if includeCounts=true)',
    type: [ArtworkFolderObject],
  })
  async listArtworkFolders(
    @Query('sellerId') sellerId?: string,
    @Query('parentId') parentId?: string,
    @Query('includeCounts') includeCounts?: string,
  ): Promise<ArtworkFolderObject[]> {
    const requestId = uuidv4();
    const includeCountsBool = includeCounts === 'true' || includeCounts === '1';
    const options = { sellerId, parentId };

    this.logger.log(
      `[ArtworkFoldersController] [ReqID: ${requestId}] - Listing artwork folders`,
      {
        options,
        includeCounts: includeCountsBool,
      },
    );

    try {
      if (sellerId && sellerId.length < 10) {
        throw new BadRequestException('Invalid seller ID format');
      }

      const folders = await this.queryBus.execute(
        new ListArtworkFoldersQuery(options, includeCountsBool),
      );

      this.logger.log(
        `[ArtworkFoldersController] [ReqID: ${requestId}] - Artwork folders listed successfully`,
        {
          count: folders.length,
          withCounts: includeCountsBool,
        },
      );

      return folders;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworkFoldersController] [ReqID: ${requestId}] - Unexpected error: list artwork folders`,
        {
          options,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to retrieve artwork folders',
      );
    }
  }

  @Get('tree/:sellerId')
  @ApiOperation({
    summary: 'Get folder tree for seller',
    description:
      'Retrieves the hierarchical folder structure for a specific seller',
  })
  @ApiParam({
    name: 'sellerId',
    description: 'The seller ID to get folder tree for',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Folder tree retrieved successfully',
    type: [ArtworkFolderObject],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid seller ID',
  })
  async getFolderTree(
    @Param('sellerId') sellerId: string,
  ): Promise<ArtworkFolderObject[]> {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworkFoldersController] [ReqID: ${requestId}] - Getting folder tree for seller: ${sellerId}`,
    );

    try {
      if (!sellerId || sellerId.trim() === '') {
        throw new BadRequestException('Seller ID is required');
      }

      if (sellerId.length < 10) {
        throw new BadRequestException('Invalid seller ID format');
      }

      const tree = await this.queryBus.execute(
        new GetFolderTreeQuery(sellerId),
      );

      this.logger.log(
        `[ArtworkFoldersController] [ReqID: ${requestId}] - Folder tree retrieved successfully`,
        {
          sellerId,
          rootCount: tree.length,
        },
      );

      return tree;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworkFoldersController] [ReqID: ${requestId}] - Unexpected error: get folder tree`,
        {
          sellerId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to retrieve folder tree');
    }
  }

  @Get(':folderId/artworks')
  @ApiOperation({
    summary: 'Get artworks in folder',
    description: 'Retrieves all artworks within a specific folder',
  })
  @ApiParam({
    name: 'folderId',
    description: 'The folder ID to get artworks from',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Artworks in folder retrieved successfully',
    type: [ArtworkObject],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid folder ID',
  })
  async findArtworksInFolder(
    @Param('folderId') folderId: string,
  ): Promise<ArtworkObject[]> {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworkFoldersController] [ReqID: ${requestId}] - Getting artworks in folder: ${folderId}`,
    );

    try {
      if (!folderId || folderId.trim() === '') {
        throw new BadRequestException('Folder ID is required');
      }

      if (folderId.length < 10) {
        throw new BadRequestException('Invalid folder ID format');
      }

      const artworks = await this.queryBus.execute(
        new FindArtworksInFolderQuery(folderId),
      );

      this.logger.log(
        `[ArtworkFoldersController] [ReqID: ${requestId}] - Artworks in folder retrieved successfully`,
        {
          folderId,
          count: artworks.length,
        },
      );

      return artworks;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworkFoldersController] [ReqID: ${requestId}] - Unexpected error: get artworks in folder`,
        {
          folderId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to retrieve artworks in folder',
      );
    }
  }

  @Get(':folderId/artworks/count')
  @ApiOperation({
    summary: 'Count artworks in folder',
    description: 'Returns the number of artworks within a specific folder',
  })
  @ApiParam({
    name: 'folderId',
    description: 'The folder ID to count artworks in',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Artwork count retrieved successfully',
    schema: {
      type: 'number',
      example: 42,
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid folder ID',
  })
  async countArtworksInFolder(
    @Param('folderId') folderId: string,
  ): Promise<number> {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworkFoldersController] [ReqID: ${requestId}] - Counting artworks in folder: ${folderId}`,
    );

    try {
      if (!folderId || folderId.trim() === '') {
        throw new BadRequestException('Folder ID is required');
      }

      if (folderId.length < 10) {
        throw new BadRequestException('Invalid folder ID format');
      }

      const count = await this.queryBus.execute(
        new CountArtworksInFolderQuery(folderId),
      );

      this.logger.log(
        `[ArtworkFoldersController] [ReqID: ${requestId}] - Artwork count retrieved successfully`,
        {
          folderId,
          count,
        },
      );

      return count;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworkFoldersController] [ReqID: ${requestId}] - Unexpected error: count artworks in folder`,
        {
          folderId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to count artworks in folder',
      );
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Create artwork folder',
    description: 'Creates a new artwork folder with the provided details',
  })
  @ApiBody({
    type: CreateArtworkFolderInput,
    description: 'Artwork folder creation data',
  })
  @ApiResponse({
    status: 201,
    description: 'Artwork folder created successfully',
    type: ArtworkFolderObject,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async createArtworkFolder(
    @Body() input: CreateArtworkFolderInput,
  ): Promise<ArtworkFolderObject> {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworkFoldersController] [ReqID: ${requestId}] - Creating artwork folder`,
      {
        sellerId: input?.sellerId,
        name: input?.name,
      },
    );

    try {
      if (!input) {
        throw new BadRequestException('Folder creation input is required');
      }

      if (!input.sellerId || input.sellerId.trim() === '') {
        throw new BadRequestException('Seller ID is required');
      }

      if (!input.name || input.name.trim() === '') {
        throw new BadRequestException('Folder name is required');
      }

      if (input.sellerId.length < 10) {
        throw new BadRequestException('Invalid seller ID format');
      }

      if (input.name.length > 100) {
        throw new BadRequestException(
          'Folder name must be less than 100 characters',
        );
      }

      if (input.parentId && input.parentId.length < 10) {
        throw new BadRequestException('Invalid parent folder ID format');
      }

      const created = await this.commandBus.execute(
        new CreateArtworkFolderCommand(input),
      );

      this.logger.log(
        `[ArtworkFoldersController] [ReqID: ${requestId}] - Artwork folder created successfully`,
        {
          id: created.id,
          name: created.name,
        },
      );

      return created;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworkFoldersController] [ReqID: ${requestId}] - Unexpected error: create artwork folder`,
        {
          sellerId: input?.sellerId,
          name: input?.name,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to create artwork folder');
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update artwork folder',
    description: 'Updates an existing artwork folder with new information',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the artwork folder to update',
    type: 'string',
  })
  @ApiBody({
    type: UpdateArtworkFolderInput,
    description: 'Artwork folder update data',
  })
  @ApiResponse({
    status: 200,
    description: 'Artwork folder updated successfully',
    type: ArtworkFolderObject,
  })
  @ApiResponse({
    status: 404,
    description: 'Artwork folder not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async updateArtworkFolder(
    @Param('id') id: string,
    @Body() input: UpdateArtworkFolderInput,
  ): Promise<ArtworkFolderObject> {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworkFoldersController] [ReqID: ${requestId}] - Updating artwork folder: ${id}`,
    );

    try {
      if (!id || id.trim() === '') {
        throw new BadRequestException('Folder ID is required');
      }

      if (id.length < 10) {
        throw new BadRequestException('Invalid folder ID format');
      }

      if (!input) {
        throw new BadRequestException('Update input is required');
      }

      if (input.name !== undefined) {
        if (!input.name || input.name.trim() === '') {
          throw new BadRequestException('Folder name cannot be empty');
        }
        if (input.name.length > 100) {
          throw new BadRequestException(
            'Folder name must be less than 100 characters',
          );
        }
      }

      if (
        input.parentId !== undefined &&
        input.parentId &&
        input.parentId.length < 10
      ) {
        throw new BadRequestException('Invalid parent folder ID format');
      }

      const updated = await this.commandBus.execute(
        new UpdateArtworkFolderCommand(id, input),
      );

      if (!updated) {
        this.logger.warn(
          `[ArtworkFoldersController] [ReqID: ${requestId}] - Artwork folder not found for update: ${id}`,
        );
        throw new NotFoundException(`Artwork folder with ID ${id} not found`);
      }

      this.logger.log(
        `[ArtworkFoldersController] [ReqID: ${requestId}] - Artwork folder updated successfully: ${id}`,
      );
      return updated;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworkFoldersController] [ReqID: ${requestId}] - Unexpected error: update artwork folder`,
        {
          id,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to update artwork folder');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete artwork folder',
    description: 'Permanently removes an artwork folder from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the artwork folder to delete',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Artwork folder deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Artwork folder not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid folder ID',
  })
  async deleteArtworkFolder(
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworkFoldersController] [ReqID: ${requestId}] - Deleting artwork folder: ${id}`,
    );

    try {
      if (!id || id.trim() === '') {
        throw new BadRequestException('Folder ID is required');
      }

      if (id.length < 10) {
        throw new BadRequestException('Invalid folder ID format');
      }

      const result = await this.commandBus.execute(
        new DeleteArtworkFolderCommand(id),
      );

      if (!result) {
        this.logger.warn(
          `[ArtworkFoldersController] [ReqID: ${requestId}] - Artwork folder not found for deletion: ${id}`,
        );
        throw new NotFoundException(`Artwork folder with ID ${id} not found`);
      }

      this.logger.log(
        `[ArtworkFoldersController] [ReqID: ${requestId}] - Artwork folder deleted successfully: ${id}`,
      );
      return { success: true };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworkFoldersController] [ReqID: ${requestId}] - Unexpected error: delete artwork folder`,
        {
          id,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to delete artwork folder');
    }
  }

  @Put(':id/move')
  @ApiOperation({
    summary: 'Move artwork folder',
    description:
      'Moves an artwork folder to a new parent folder or to root level',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the artwork folder to move',
    type: 'string',
  })
  @ApiBody({
    type: MoveFolderInput,
    description: 'Folder move operation data',
  })
  @ApiResponse({
    status: 200,
    description: 'Artwork folder moved successfully',
    type: ArtworkFolderObject,
  })
  @ApiResponse({
    status: 404,
    description: 'Artwork folder not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async moveArtworkFolder(
    @Body() input: MoveFolderInput,
  ): Promise<ArtworkFolderObject> {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworkFoldersController] [ReqID: ${requestId}] - Moving artwork folder`,
      {
        folderId: input?.folderId,
        newParentId: input?.newParentId,
      },
    );

    try {
      if (!input) {
        throw new BadRequestException('Move folder input is required');
      }

      if (!input.folderId || input.folderId.trim() === '') {
        throw new BadRequestException('Folder ID is required');
      }

      if (input.folderId.length < 10) {
        throw new BadRequestException('Invalid folder ID format');
      }

      if (input.newParentId && input.newParentId.length < 10) {
        throw new BadRequestException('Invalid new parent folder ID format');
      }

      if (input.folderId === input.newParentId) {
        throw new BadRequestException('Cannot move folder to itself');
      }

      const moved = await this.commandBus.execute(
        new MoveArtworkFolderCommand(input.folderId, input.newParentId || null),
      );

      if (!moved) {
        this.logger.warn(
          `[ArtworkFoldersController] [ReqID: ${requestId}] - Artwork folder not found for move: ${input.folderId}`,
        );
        throw new NotFoundException(
          `Artwork folder with ID ${input.folderId} not found`,
        );
      }

      this.logger.log(
        `[ArtworkFoldersController] [ReqID: ${requestId}] - Artwork folder moved successfully`,
        {
          folderId: input.folderId,
          newParentId: input.newParentId,
        },
      );

      return moved;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworkFoldersController] [ReqID: ${requestId}] - Unexpected error: move artwork folder`,
        {
          folderId: input?.folderId,
          newParentId: input?.newParentId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to move artwork folder');
    }
  }

  @Post('default-root/:sellerId')
  @ApiOperation({
    summary: 'Create default root folder',
    description: 'Creates a default root folder for a new seller',
  })
  @ApiParam({
    name: 'sellerId',
    description: 'The seller ID to create default root folder for',
    type: 'string',
  })
  @ApiResponse({
    status: 201,
    description: 'Default root folder created successfully',
    type: ArtworkFolderObject,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid seller ID',
  })
  async createDefaultRootFolder(
    @Param('sellerId') sellerId: string,
  ): Promise<ArtworkFolderObject> {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworkFoldersController] [ReqID: ${requestId}] - Creating default root folder for seller: ${sellerId}`,
    );

    try {
      if (!sellerId || sellerId.trim() === '') {
        throw new BadRequestException('Seller ID is required');
      }

      if (sellerId.length < 10) {
        throw new BadRequestException('Invalid seller ID format');
      }

      const folder = await this.commandBus.execute(
        new CreateDefaultRootFolderCommand(sellerId),
      );

      this.logger.log(
        `[ArtworkFoldersController] [ReqID: ${requestId}] - Default root folder created successfully`,
        {
          sellerId,
          folderId: folder.id,
        },
      );

      return folder;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworkFoldersController] [ReqID: ${requestId}] - Unexpected error: create default root folder`,
        {
          sellerId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to create default root folder',
      );
    }
  }

  @Put('reorder')
  @ApiOperation({
    summary: 'Reorder folders',
    description:
      'Reorder folders by providing an array of folder IDs in the desired order',
  })
  @ApiBody({
    description: 'Reorder folders request',
    schema: {
      type: 'object',
      required: ['sellerId', 'folderIds'],
      properties: {
        sellerId: {
          type: 'string',
          description: 'The seller ID who owns the folders',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        folderIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of folder IDs in desired order',
          example: ['folder-3', 'folder-1', 'folder-2'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Folders reordered successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        folders: {
          type: 'array',
          items: { $ref: '#/components/schemas/ArtworkFolderObject' },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or folders not found',
  })
  async reorderFolders(
    @Body() body: ReorderFoldersInput,
  ): Promise<{ success: boolean; folders: ArtworkFolderObject[] }> {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworkFoldersController] [ReqID: ${requestId}] - Reordering folders`,
      {
        sellerId: body.sellerId,
        count: body.folderIds?.length,
      },
    );

    try {
      if (!body.sellerId || body.sellerId.trim() === '') {
        throw new BadRequestException('Seller ID is required');
      }

      if (
        !body.folderIds ||
        !Array.isArray(body.folderIds) ||
        body.folderIds.length === 0
      ) {
        throw new BadRequestException(
          'Folder IDs array is required and must not be empty',
        );
      }

      const result = await this.commandBus.execute(
        new ReorderFoldersCommand(body.sellerId, body.folderIds),
      );

      this.logger.log(
        `[ArtworkFoldersController] [ReqID: ${requestId}] - Folders reordered successfully`,
        {
          sellerId: body.sellerId,
          reorderedCount: result.folders.length,
        },
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworkFoldersController] [ReqID: ${requestId}] - Unexpected error: reorder folders`,
        {
          sellerId: body.sellerId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to reorder folders');
    }
  }

  @Patch(':id/visibility')
  @ApiOperation({
    summary: 'Toggle folder visibility',
    description: 'Show or hide a folder from display',
  })
  @ApiParam({
    name: 'id',
    description: 'The folder ID to toggle visibility for',
    type: 'string',
  })
  @ApiBody({
    description: 'Toggle visibility request',
    schema: {
      type: 'object',
      required: ['sellerId', 'isHidden'],
      properties: {
        sellerId: {
          type: 'string',
          description: 'The seller ID who owns the folder',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        isHidden: {
          type: 'boolean',
          description: 'Whether the folder should be hidden',
          example: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Folder visibility toggled successfully',
    type: ArtworkFolderObject,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid folder ID or seller ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Folder not found',
  })
  async toggleFolderVisibility(
    @Param('id') id: string,
    @Body() body: { sellerId: string; isHidden: boolean },
  ): Promise<{ folder: ArtworkFolderObject }> {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworkFoldersController] [ReqID: ${requestId}] - Toggling folder visibility`,
      {
        folderId: id,
        sellerId: body.sellerId,
        isHidden: body.isHidden,
      },
    );

    try {
      if (!id || id.trim() === '') {
        throw new BadRequestException('Folder ID is required');
      }

      if (!body.sellerId || body.sellerId.trim() === '') {
        throw new BadRequestException('Seller ID is required');
      }

      if (typeof body.isHidden !== 'boolean') {
        throw new BadRequestException('isHidden must be a boolean value');
      }

      const result = await this.commandBus.execute(
        new ToggleFolderVisibilityCommand(id, body.isHidden, body.sellerId),
      );

      this.logger.log(
        `[ArtworkFoldersController] [ReqID: ${requestId}] - Folder visibility toggled successfully`,
        {
          folderId: id,
          isHidden: body.isHidden,
        },
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworkFoldersController] [ReqID: ${requestId}] - Unexpected error: toggle folder visibility`,
        {
          folderId: id,
          sellerId: body.sellerId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to toggle folder visibility',
      );
    }
  }
}
