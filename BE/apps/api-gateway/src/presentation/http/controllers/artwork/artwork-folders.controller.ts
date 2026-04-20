import { JwtAuthGuard } from '@app/auth';
import {
  ArtworkObject,
  CreateArtworkFolderInput,
  MoveFolderInput,
  UpdateArtworkFolderInput,
  ReorderFoldersInput,
} from '@app/common';
import { ArtworkFolderObject } from '@app/common';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MICROSERVICES } from 'apps/api-gateway/src/config';
import { sendRpc } from '../../utils';

@ApiTags('Artwork Folders')
@Controller('artwork/artwork-folders')
export class ArtworkFoldersController {
  constructor(
    @Inject(MICROSERVICES.ARTWORK_SERVICE)
    private readonly artworkClient: ClientProxy,
  ) {}

  @Put('reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reorder folders',
    description:
      'Reorder folders by providing an array of folder IDs in the desired order',
  })
  @ApiBody({
    type: ReorderFoldersInput,
    description: 'Reorder folders request',
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
    return sendRpc<{ success: boolean; folders: ArtworkFolderObject[] }>(
      this.artworkClient,
      { cmd: 'reorder_folders' },
      body,
    );
  }

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
    return sendRpc<ArtworkFolderObject | null>(
      this.artworkClient,
      { cmd: 'get_artwork_folder' },
      { id },
    );
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
  async getArtworkFolders(
    @Query('sellerId') sellerId?: string,
    @Query('parentId') parentId?: string,
    @Query('includeCounts') includeCounts?: string,
  ): Promise<ArtworkFolderObject[]> {
    return sendRpc<ArtworkFolderObject[]>(
      this.artworkClient,
      { cmd: 'get_artwork_folders' },
      { sellerId, parentId, includeCounts },
    );
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
    return sendRpc<ArtworkFolderObject[]>(
      this.artworkClient,
      { cmd: 'get_folder_tree' },
      { sellerId },
    );
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
    return sendRpc<ArtworkObject[]>(
      this.artworkClient,
      { cmd: 'find_artworks_in_folder' },
      { folderId },
    );
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
    return sendRpc<number>(
      this.artworkClient,
      { cmd: 'count_artworks_in_folder' },
      { folderId },
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
    return sendRpc<ArtworkFolderObject>(
      this.artworkClient,
      { cmd: 'create_artwork_folder' },
      input,
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
    return sendRpc<ArtworkFolderObject>(
      this.artworkClient,
      { cmd: 'update_artwork_folder' },
      { id, input },
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
    return sendRpc<{ success: boolean }>(
      this.artworkClient,
      { cmd: 'delete_artwork_folder' },
      { id },
    );
  }

  @Put(':id/move')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
    return sendRpc<ArtworkFolderObject>(
      this.artworkClient,
      { cmd: 'move_artwork_folder' },
      input,
    );
  }

  @Post('default-root/:sellerId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
    return sendRpc<ArtworkFolderObject>(
      this.artworkClient,
      { cmd: 'create_default_root_folder' },
      { sellerId },
    );
  }

  @Patch(':id/visibility')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
    return sendRpc<{ folder: ArtworkFolderObject }>(
      this.artworkClient,
      { cmd: 'toggle_folder_visibility' },
      { id, ...body },
    );
  }
}
