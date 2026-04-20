import { JwtAuthGuard } from '@app/auth';
import {
  ArtworkObject,
  CreateArtworkInput,
  GetArtworksQueryDto,
  UpdateArtworkInput,
  UserPayload,
  ArtworkImageInput,
  BulkMoveArtworksInput,
  BulkDeleteArtworksInput,
  BulkUpdateArtworkStatusInput,
} from '@app/common';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MICROSERVICES } from '../../../../config';
import { sendRpc } from '../../utils';

@ApiTags('Artwork')
@Controller('artwork')
export class ArtworkController {
  constructor(
    @Inject(MICROSERVICES.ARTWORK_SERVICE)
    private readonly artworkClient: ClientProxy,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List artworks',
    description:
      'Retrieves a list of artworks with optional filtering and pagination',
  })
  @ApiQuery({
    name: 'sellerId',
    required: false,
    description: 'Filter by seller ID',
    type: 'string',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by artwork status (available, sold, reserved)',
    type: 'string',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Number of records to skip for pagination',
    type: 'number',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    description: 'Maximum number of records to return',
    type: 'number',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'Filter by minimum price',
    type: 'number',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Filter by maximum price',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Artworks listed successfully',
    type: [ArtworkObject],
  })
  async getArtworks(@Query() query: GetArtworksQueryDto) {
    return sendRpc<ArtworkObject[]>(
      this.artworkClient,
      { cmd: 'get_artworks' },
      query,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get artwork by ID',
    description: 'Retrieves detailed information about a specific artwork',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the artwork',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Artwork retrieved successfully',
    type: ArtworkObject,
  })
  @ApiNotFoundResponse({
    description: 'Artwork not found',
  })
  async getArtworkById(@Param('id') id: string) {
    return sendRpc<ArtworkObject>(
      this.artworkClient,
      { cmd: 'get_artwork_by_id' },
      { id },
    );
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create artwork',
    description: 'Creates a new artwork record with the provided details',
  })
  @ApiBody({
    type: CreateArtworkInput,
    description: 'Artwork creation data',
  })
  @ApiResponse({
    status: 201,
    description: 'Artwork created successfully',
    type: ArtworkObject,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async createArtwork(
    @Request() req: { user: UserPayload },
    @Body() data: CreateArtworkInput,
  ) {
    return sendRpc<ArtworkObject>(
      this.artworkClient,
      { cmd: 'create_artwork' },
      { ...data, user: req.user },
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update artwork',
    description: 'Updates an existing artwork with new information',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the artwork to update',
    type: 'string',
  })
  @ApiBody({
    type: UpdateArtworkInput,
    description: 'Artwork update data',
  })
  @ApiResponse({
    status: 200,
    description: 'Artwork updated successfully',
    type: ArtworkObject,
  })
  @ApiNotFoundResponse({
    description: 'Artwork not found',
  })
  async updateArtwork(
    @Param('id') id: string,
    @Request() req: { user: UserPayload },
    @Body() data: UpdateArtworkInput,
  ) {
    return sendRpc<ArtworkObject>(
      this.artworkClient,
      { cmd: 'update_artwork' },
      { id, ...data, user: req.user },
    );
  }

  @Post(':id/images')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add images to artwork',
    description: 'Adds new images to an existing artwork',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the artwork',
    type: 'string',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['images'],
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'object',
            required: ['publicId', 'url', 'secureUrl'],
            properties: {
              publicId: { type: 'string' },
              url: { type: 'string' },
              secureUrl: { type: 'string' },
              format: { type: 'string' },
              width: { type: 'number' },
              height: { type: 'number' },
              size: { type: 'number' },
              bucket: { type: 'string' },
              altText: { type: 'string' },
              order: { type: 'number' },
              isPrimary: { type: 'boolean' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Images added successfully',
    type: ArtworkObject,
  })
  @ApiNotFoundResponse({
    description: 'Artwork not found',
  })
  async addImagesToArtwork(
    @Param('id') id: string,
    @Request() req: { user: UserPayload },
    @Body() body: { images: ArtworkImageInput[] },
  ) {
    return sendRpc<ArtworkObject>(
      this.artworkClient,
      { cmd: 'add_images_to_artwork' },
      { id, images: body.images, user: req.user },
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete artwork',
    description: 'Permanently removes an artwork from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the artwork to delete',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Artwork deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Artwork not found',
  })
  async deleteArtwork(
    @Param('id') id: string,
    @Request() req: { user: UserPayload },
  ) {
    return sendRpc<{ success: boolean }>(
      this.artworkClient,
      { cmd: 'delete_artwork' },
      { id, user: req.user },
    );
  }

  @Post('bulk/move')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Bulk move artworks to folder',
    description: 'Moves multiple artworks to a folder (or root when folderId is null).',
  })
  @ApiBody({ type: BulkMoveArtworksInput })
  @ApiResponse({
    status: 200,
    description: 'Artworks moved successfully',
  })
  async bulkMoveArtworks(
    @Request() req: { user: UserPayload },
    @Body() body: BulkMoveArtworksInput,
  ) {
    return sendRpc<{ movedCount: number }>(
      this.artworkClient,
      { cmd: 'bulk_move_artworks' },
      { ...body, user: req.user },
    );
  }

  @Delete('bulk')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Bulk delete artworks',
    description: 'Delete multiple artworks at once',
  })
  @ApiBody({ type: BulkDeleteArtworksInput })
  @ApiResponse({
    status: 200,
    description: 'Artworks deleted successfully',
  })
  async bulkDeleteArtworks(
    @Request() req: { user: UserPayload },
    @Body() body: BulkDeleteArtworksInput,
  ) {
    return sendRpc<{ deletedCount: number; success: boolean }>(
      this.artworkClient,
      { cmd: 'bulk_delete_artworks' },
      { ...body, user: req.user },
    );
  }

  @Post('bulk/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Bulk update artwork status',
    description: 'Update status for multiple artworks at once',
  })
  @ApiBody({ type: BulkUpdateArtworkStatusInput })
  @ApiResponse({
    status: 200,
    description: 'Artwork statuses updated successfully',
  })
  async bulkUpdateArtworkStatus(
    @Request() req: { user: UserPayload },
    @Body() body: BulkUpdateArtworkStatusInput,
  ) {
    return sendRpc<{ updatedCount: number }>(
      this.artworkClient,
      { cmd: 'bulk_update_artwork_status' },
      { ...body, user: req.user },
    );
  }
}
