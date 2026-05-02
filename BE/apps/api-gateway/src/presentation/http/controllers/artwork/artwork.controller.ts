import { JwtAuthGuard } from '@app/auth';
import {
  ArtworkObject,
  ArtworkUploadDraftObject,
  CreateArtworkInput,
  CreateArtworkDraftInput,
  GetArtworksQueryDto,
  SaveArtworkDraftInput,
  SubmitArtworkDraftInput,
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
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
import { MICROSERVICES } from '../../../../config';
import { sendRpc } from '../../utils';

class SetArtworkLikeStatusBody {
  @ApiProperty({
    description: 'Whether the current user likes this artwork',
    example: true,
  })
  @IsBoolean()
  liked!: boolean;
}

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

  @Get(':id/likes/me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if current user likes an artwork' })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the artwork',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Artwork like status retrieved successfully',
  })
  async getArtworkLikeStatus(
    @Param('id') id: string,
    @Request() req: { user: UserPayload },
  ) {
    const liked = await sendRpc<boolean>(
      this.artworkClient,
      { cmd: 'is_artwork_liked' },
      { userId: req.user?.id, artworkId: id },
    );

    return { liked };
  }

  @Put(':id/likes')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set like status for an artwork' })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the artwork',
    type: 'string',
  })
  @ApiBody({ type: SetArtworkLikeStatusBody })
  @ApiResponse({
    status: 200,
    description: 'Artwork like status updated successfully',
  })
  async setArtworkLikeStatus(
    @Param('id') id: string,
    @Body() body: SetArtworkLikeStatusBody,
    @Request() req: { user: UserPayload },
  ) {
    return sendRpc(
      this.artworkClient,
      { cmd: 'set_artwork_like_status' },
      {
        userId: req.user?.id,
        artworkId: id,
        liked: body.liked,
      },
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

  @Post('drafts/:draftArtworkId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create artwork upload draft',
    description:
      'Creates or returns an authenticated seller-owned draft for the upload flow.',
  })
  @ApiParam({
    name: 'draftArtworkId',
    description: 'Client route draft artwork identifier',
    type: 'string',
  })
  @ApiBody({ type: CreateArtworkDraftInput })
  @ApiResponse({
    status: 200,
    description: 'Draft created or returned successfully',
    type: ArtworkUploadDraftObject,
  })
  async createArtworkUploadDraft(
    @Param('draftArtworkId') draftArtworkId: string,
    @Request() req: { user: UserPayload },
    @Body() data: CreateArtworkDraftInput,
  ) {
    return sendRpc<ArtworkUploadDraftObject>(
      this.artworkClient,
      { cmd: 'create_artwork_upload_draft' },
      { draftArtworkId, data, user: req.user },
    );
  }

  @Get('drafts/:draftArtworkId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get artwork upload draft',
    description: 'Loads an authenticated seller-owned upload draft.',
  })
  @ApiParam({
    name: 'draftArtworkId',
    description: 'Draft artwork identifier',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Draft retrieved successfully',
    type: ArtworkUploadDraftObject,
  })
  @ApiNotFoundResponse({ description: 'Draft not found' })
  async getArtworkUploadDraft(
    @Param('draftArtworkId') draftArtworkId: string,
    @Request() req: { user: UserPayload },
  ) {
    return sendRpc<ArtworkUploadDraftObject>(
      this.artworkClient,
      { cmd: 'get_artwork_upload_draft' },
      { draftArtworkId, user: req.user },
    );
  }

  @Put('drafts/:draftArtworkId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Save artwork upload draft',
    description: 'Updates authenticated seller-owned upload draft fields.',
  })
  @ApiParam({
    name: 'draftArtworkId',
    description: 'Draft artwork identifier',
    type: 'string',
  })
  @ApiBody({ type: SaveArtworkDraftInput })
  @ApiResponse({
    status: 200,
    description: 'Draft saved successfully',
    type: ArtworkUploadDraftObject,
  })
  @ApiNotFoundResponse({ description: 'Draft not found' })
  async saveArtworkUploadDraft(
    @Param('draftArtworkId') draftArtworkId: string,
    @Request() req: { user: UserPayload },
    @Body() data: SaveArtworkDraftInput,
  ) {
    return sendRpc<ArtworkUploadDraftObject>(
      this.artworkClient,
      { cmd: 'save_artwork_upload_draft' },
      { draftArtworkId, data, user: req.user },
    );
  }

  @Post('drafts/:draftArtworkId/submit')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Submit artwork upload draft',
    description:
      'Validates and transitions an authenticated seller-owned draft into its final lifecycle state.',
  })
  @ApiParam({
    name: 'draftArtworkId',
    description: 'Draft artwork identifier',
    type: 'string',
  })
  @ApiBody({ type: SubmitArtworkDraftInput })
  @ApiResponse({
    status: 200,
    description: 'Draft submitted successfully',
    type: ArtworkUploadDraftObject,
  })
  @ApiNotFoundResponse({ description: 'Draft not found' })
  async submitArtworkUploadDraft(
    @Param('draftArtworkId') draftArtworkId: string,
    @Request() req: { user: UserPayload },
    @Body() data: SubmitArtworkDraftInput,
  ) {
    return sendRpc<ArtworkUploadDraftObject>(
      this.artworkClient,
      { cmd: 'submit_artwork_upload_draft' },
      { draftArtworkId, data, user: req.user },
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
    description:
      'Moves multiple artworks to a folder (or root when folderId is null).',
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
