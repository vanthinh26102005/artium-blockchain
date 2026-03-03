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
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';

import {
  ArtworkObject,
  CreateArtworkInput,
  UpdateArtworkInput,
  FindManyArtworkInput,
  BulkMoveArtworksInput,
  BulkDeleteArtworksInput,
  BulkUpdateArtworkStatusInput,
} from '../../../domain';
import {
  CreateArtworkCommand,
  UpdateArtworkCommand,
  DeleteArtworkCommand,
  MarkArtworkAsSoldCommand,
  DuplicateArtworkCommand,
  AddImagesToArtworkCommand,
  RemoveImagesFromArtworkCommand,
  UpdateArtworkImagesCommand,
  BulkMoveArtworksCommand,
  BulkDeleteArtworksCommand,
  BulkUpdateArtworkStatusCommand,
  // Queries
  GetArtworkQuery,
  ListArtworksQuery,
  SearchArtworksQuery,
  FindArtworksByTagsQuery,
  CountArtworksByStatusQuery,
} from '../../../application';

@ApiTags('artworks')
@Controller('artworks')
export class ArtworksController {
  private readonly logger = new Logger(ArtworksController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':id')
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
  async getArtworkById(@Param('id') id: string): Promise<ArtworkObject | null> {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworksController] [ReqID: ${requestId}] - Getting artwork by ID: ${id}`,
    );

    try {
      if (!id || id.trim() === '') {
        throw new BadRequestException('Artwork ID is required');
      }

      if (id.length < 10) {
        throw new BadRequestException('Invalid artwork ID format');
      }

      const result = await this.queryBus.execute(new GetArtworkQuery(id));

      if (!result) {
        this.logger.warn(
          `[ArtworksController] [ReqID: ${requestId}] - Artwork not found: ${id}`,
        );
        return null;
      }

      this.logger.log(
        `[ArtworksController] [ReqID: ${requestId}] - Artwork retrieved successfully: ${id}`,
      );
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworksController] [ReqID: ${requestId}] - Unexpected error: get artwork`,
        {
          id,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to retrieve artwork');
    }
  }

  @Get()
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
  async getArtworks(
    @Query() options?: FindManyArtworkInput,
  ): Promise<ArtworkObject[]> {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworksController] [ReqID: ${requestId}] - Listing artworks`,
      { options },
    );

    try {
      if (options) {
        if (
          options.skip !== undefined &&
          (options.skip < 0 || !Number.isInteger(options.skip))
        ) {
          throw new BadRequestException('Skip must be a non-negative integer');
        }

        if (
          options.take !== undefined &&
          (options.take <= 0 ||
            options.take > 100 ||
            !Number.isInteger(options.take))
        ) {
          throw new BadRequestException(
            'Take must be a positive integer not exceeding 100',
          );
        }

        if (
          options.status &&
          !['available', 'sold', 'reserved', 'draft'].includes(options.status)
        ) {
          throw new BadRequestException(
            'Invalid status. Allowed values: available, sold, reserved, draft',
          );
        }

        if (
          options.minPrice !== undefined &&
          (options.minPrice < 0 || isNaN(Number(options.minPrice)))
        ) {
          throw new BadRequestException(
            'Min price must be a non-negative number',
          );
        }

        if (
          options.maxPrice !== undefined &&
          (options.maxPrice < 0 || isNaN(Number(options.maxPrice)))
        ) {
          throw new BadRequestException(
            'Max price must be a non-negative number',
          );
        }

        if (
          options.minPrice !== undefined &&
          options.maxPrice !== undefined &&
          options.minPrice > options.maxPrice
        ) {
          throw new BadRequestException(
            'Min price cannot be greater than max price',
          );
        }

        if (options.sellerId && options.sellerId.length < 10) {
          throw new BadRequestException('Invalid seller ID format');
        }
      }

      const result = await this.queryBus.execute(
        new ListArtworksQuery(options || {}),
      );

      this.logger.log(
        `[ArtworksController] [ReqID: ${requestId}] - Artworks listed successfully`,
        {
          count: result.length,
        },
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworksController] [ReqID: ${requestId}] - Unexpected error: list artworks`,
        {
          options,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to retrieve artworks');
    }
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search artworks',
    description:
      'Searches artworks by title, description and other text fields',
  })
  @ApiQuery({
    name: 'sellerId',
    required: true,
    description: 'The seller ID to search artworks for',
    type: 'string',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search query string',
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
  @ApiResponse({
    status: 200,
    description: 'Artworks searched successfully',
    type: [ArtworkObject],
  })
  async searchArtworks(
    @Query('sellerId') sellerId: string,
    @Query('q') query: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ): Promise<ArtworkObject[]> {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworksController] [ReqID: ${requestId}] - Searching artworks`,
      { sellerId, query },
    );

    try {
      if (!sellerId || sellerId.trim() === '') {
        throw new BadRequestException('Seller ID is required');
      }

      if (sellerId.length < 10) {
        throw new BadRequestException('Invalid seller ID format');
      }

      if (!query || query.trim().length === 0) {
        throw new BadRequestException('Search query cannot be empty');
      }

      if (query.length < 2) {
        throw new BadRequestException(
          'Search query must be at least 2 characters long',
        );
      }

      if (query.length > 100) {
        throw new BadRequestException(
          'Search query must be less than 100 characters',
        );
      }

      if (skip !== undefined && (skip < 0 || !Number.isInteger(skip))) {
        throw new BadRequestException('Skip must be a non-negative integer');
      }

      if (
        take !== undefined &&
        (take <= 0 || take > 100 || !Number.isInteger(take))
      ) {
        throw new BadRequestException(
          'Take must be a positive integer not exceeding 100',
        );
      }

      const result = await this.queryBus.execute(
        new SearchArtworksQuery(sellerId, query, { skip, take }),
      );

      this.logger.log(
        `[ArtworksController] [ReqID: ${requestId}] - Artwork search completed`,
        {
          sellerId,
          query,
          found: result.length,
        },
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworksController] [ReqID: ${requestId}] - Unexpected error: search artworks`,
        {
          sellerId,
          query,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to search artworks');
    }
  }

  @Get('by-tags')
  @ApiOperation({
    summary: 'Get artworks by tags',
    description: 'Retrieves artworks filtered by specified tags',
  })
  @ApiQuery({
    name: 'sellerId',
    required: true,
    description: 'The seller ID to get artworks for',
    type: 'string',
  })
  @ApiQuery({
    name: 'tagIds',
    required: true,
    description: 'Array of tag IDs to filter by',
    type: 'array',
    isArray: true,
  })
  @ApiQuery({
    name: 'match',
    required: false,
    description: 'Match type: any (OR) or all (AND)',
    type: 'string',
    enum: ['any', 'all'],
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
  @ApiResponse({
    status: 200,
    description: 'Artworks by tags retrieved successfully',
    type: [ArtworkObject],
  })
  async artworksByTags(
    @Query('sellerId') sellerId: string,
    @Query('tagIds') tagIds: string[],
    @Query('match') match: 'any' | 'all' = 'any',
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ): Promise<ArtworkObject[]> {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworksController] [ReqID: ${requestId}] - Getting artworks by tags`,
      {
        sellerId,
        tagCount: tagIds?.length,
        match,
      },
    );

    try {
      if (!sellerId || sellerId.trim() === '') {
        throw new BadRequestException('Seller ID is required');
      }

      if (sellerId.length < 10) {
        throw new BadRequestException('Invalid seller ID format');
      }

      if (!tagIds || !Array.isArray(tagIds) || tagIds.length === 0) {
        return [];
      }

      if (tagIds.length > 50) {
        throw new BadRequestException(
          'Maximum 50 tags can be specified at once',
        );
      }

      for (const tagId of tagIds) {
        if (!tagId || tagId.trim() === '') {
          throw new BadRequestException(
            'All tag IDs must be non-empty strings',
          );
        }
        if (tagId.length < 10) {
          throw new BadRequestException('Invalid tag ID format');
        }
      }

      if (!['any', 'all'].includes(match)) {
        throw new BadRequestException(
          'Match parameter must be either "any" or "all"',
        );
      }

      if (skip !== undefined && (skip < 0 || !Number.isInteger(skip))) {
        throw new BadRequestException('Skip must be a non-negative integer');
      }

      if (
        take !== undefined &&
        (take <= 0 || take > 100 || !Number.isInteger(take))
      ) {
        throw new BadRequestException(
          'Take must be a positive integer not exceeding 100',
        );
      }

      const result = await this.queryBus.execute(
        new FindArtworksByTagsQuery(
          sellerId,
          tagIds,
          { match },
          { skip, take },
        ),
      );

      this.logger.log(
        `[ArtworksController] [ReqID: ${requestId}] - Tag-based artwork retrieval completed`,
        {
          sellerId,
          tagCount: tagIds.length,
          match,
          returned: result.length,
        },
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworksController] [ReqID: ${requestId}] - Unexpected error: get artworks by tags`,
        {
          sellerId,
          tagCount: tagIds?.length,
          match,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to retrieve artworks by tags',
      );
    }
  }

  @Get('counts/by-status')
  @ApiOperation({
    summary: 'Get artwork counts by status',
    description:
      'Returns counts of artworks grouped by their status for a specific seller',
  })
  @ApiQuery({
    name: 'sellerId',
    required: true,
    description: 'The seller ID to get counts for',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Artwork counts by status retrieved successfully',
    schema: {
      type: 'string',
      description: 'JSON string containing counts by status',
    },
  })
  async getCountsByStatus(
    @Query('sellerId') sellerId: string,
  ): Promise<string> {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworksController] [ReqID: ${requestId}] - Getting artwork counts by status`,
      { sellerId },
    );

    try {
      if (!sellerId || sellerId.trim() === '') {
        throw new BadRequestException('Seller ID is required');
      }

      if (sellerId.length < 10) {
        throw new BadRequestException('Invalid seller ID format');
      }

      const result = await this.queryBus.execute(
        new CountArtworksByStatusQuery(sellerId),
      );

      this.logger.log(
        `[ArtworksController] [ReqID: ${requestId}] - Status count retrieval completed`,
        {
          sellerId,
        },
      );

      return JSON.stringify(result);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworksController] [ReqID: ${requestId}] - Unexpected error: get counts by status`,
        {
          sellerId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to retrieve artwork counts by status',
      );
    }
  }

  @Get('seller/:sellerId')
  @ApiOperation({
    summary: 'Get artworks by seller',
    description:
      'Retrieves all artworks for a specific seller with optional filtering',
  })
  @ApiParam({
    name: 'sellerId',
    description: 'The seller ID to get artworks for',
    type: 'string',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by artwork status',
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
  @ApiResponse({
    status: 200,
    description: 'Seller artworks retrieved successfully',
    type: [ArtworkObject],
  })
  async getArtworksBySeller(
    @Param('sellerId') sellerId: string,
    @Query() options?: Pick<FindManyArtworkInput, 'status' | 'skip' | 'take'>,
  ): Promise<ArtworkObject[]> {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworksController] [ReqID: ${requestId}] - Getting artworks by seller`,
      { sellerId },
    );

    try {
      if (!sellerId || sellerId.trim() === '') {
        throw new BadRequestException('Seller ID is required');
      }

      if (sellerId.length < 10) {
        throw new BadRequestException('Invalid seller ID format');
      }

      if (options) {
        if (
          options.status &&
          !['available', 'sold', 'reserved', 'draft'].includes(options.status)
        ) {
          throw new BadRequestException(
            'Invalid status. Allowed values: available, sold, reserved, draft',
          );
        }

        if (
          options.skip !== undefined &&
          (options.skip < 0 || !Number.isInteger(options.skip))
        ) {
          throw new BadRequestException('Skip must be a non-negative integer');
        }

        if (
          options.take !== undefined &&
          (options.take <= 0 ||
            options.take > 100 ||
            !Number.isInteger(options.take))
        ) {
          throw new BadRequestException(
            'Take must be a positive integer not exceeding 100',
          );
        }
      }

      const sellerOptions = { ...options, sellerId };
      const result = await this.queryBus.execute(
        new ListArtworksQuery(sellerOptions),
      );

      this.logger.log(
        `[ArtworksController] [ReqID: ${requestId}] - Seller artworks retrieved successfully`,
        {
          sellerId,
          count: result.length,
        },
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworksController] [ReqID: ${requestId}] - Unexpected error: get seller artworks`,
        {
          sellerId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to retrieve seller artworks',
      );
    }
  }

  @Post()
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
    @Body() input: CreateArtworkInput,
  ): Promise<ArtworkObject> {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworksController] [ReqID: ${requestId}] - Creating artwork`,
      {
        title: input?.title,
        sellerId: input?.sellerId,
      },
    );

    try {
      // Input validation
      if (!input) {
        throw new BadRequestException('Artwork creation input is required');
      }

      if (!input.sellerId || input.sellerId.trim() === '') {
        throw new BadRequestException('Seller ID is required');
      }

      if (!input.title || input.title.trim() === '') {
        throw new BadRequestException('Title is required');
      }

      if (input.sellerId.length < 10) {
        throw new BadRequestException('Invalid seller ID format');
      }

      if (input.title.length > 200) {
        throw new BadRequestException('Title must be less than 200 characters');
      }

      if (input.description && input.description.length > 2000) {
        throw new BadRequestException(
          'Description must be less than 2000 characters',
        );
      }

      if (input.price !== undefined) {
        if (isNaN(Number(input.price)) || Number(input.price) < 0) {
          throw new BadRequestException(
            'Price must be a valid positive number',
          );
        }
        if (Number(input.price) > 999999999.99) {
          throw new BadRequestException('Price cannot exceed 999,999,999.99');
        }
      }

      if (
        input.status &&
        !['available', 'sold', 'reserved', 'draft'].includes(input.status)
      ) {
        throw new BadRequestException(
          'Invalid status. Allowed values: available, sold, reserved, draft',
        );
      }

      const result = await this.commandBus.execute(
        new CreateArtworkCommand(input),
      );

      this.logger.log(
        `[ArtworksController] [ReqID: ${requestId}] - Artwork created successfully`,
        {
          id: result.id,
          title: result.title,
        },
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworksController] [ReqID: ${requestId}] - Unexpected error: create artwork`,
        {
          title: input?.title,
          sellerId: input?.sellerId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to create artwork');
    }
  }

  @Put(':id')
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
    @Body() input: UpdateArtworkInput,
  ): Promise<ArtworkObject> {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworksController] [ReqID: ${requestId}] - Updating artwork`,
      { id },
    );

    try {
      if (!id || id.trim() === '') {
        throw new BadRequestException('Artwork ID is required');
      }

      if (id.length < 10) {
        throw new BadRequestException('Invalid artwork ID format');
      }

      if (!input) {
        throw new BadRequestException('Update input is required');
      }

      if (input.title !== undefined) {
        if (!input.title || input.title.trim() === '') {
          throw new BadRequestException('Title cannot be empty');
        }
        if (input.title.length > 200) {
          throw new BadRequestException(
            'Title must be less than 200 characters',
          );
        }
      }

      if (
        input.description !== undefined &&
        input.description &&
        input.description.length > 2000
      ) {
        throw new BadRequestException(
          'Description must be less than 2000 characters',
        );
      }

      if (input.price !== undefined) {
        if (isNaN(Number(input.price)) || Number(input.price) < 0) {
          throw new BadRequestException(
            'Price must be a valid positive number',
          );
        }
        if (Number(input.price) > 999999999.99) {
          throw new BadRequestException('Price cannot exceed 999,999,999.99');
        }
      }

      if (
        input.status !== undefined &&
        !['available', 'sold', 'reserved', 'draft'].includes(input.status)
      ) {
        throw new BadRequestException(
          'Invalid status. Allowed values: available, sold, reserved, draft',
        );
      }

      const result = await this.commandBus.execute(
        new UpdateArtworkCommand(id, input),
      );

      if (!result) {
        this.logger.warn(
          `[ArtworksController] [ReqID: ${requestId}] - Artwork not found for update: ${id}`,
        );
        throw new NotFoundException(`Artwork with ID ${id} not found`);
      }

      this.logger.log(
        `[ArtworksController] [ReqID: ${requestId}] - Artwork updated successfully: ${id}`,
      );
      return result;
    } catch (error) {
      // Re-throw known exceptions
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworksController] [ReqID: ${requestId}] - Unexpected error: update artwork`,
        {
          id,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to update artwork');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
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
  async deleteArtwork(@Param('id') id: string): Promise<{ success: boolean }> {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworksController] [ReqID: ${requestId}] - Deleting artwork: ${id}`,
    );

    try {
      if (!id || id.trim() === '') {
        throw new BadRequestException('Artwork ID is required');
      }

      if (id.length < 10) {
        throw new BadRequestException('Invalid artwork ID format');
      }

      const result = await this.commandBus.execute(
        new DeleteArtworkCommand(id),
      );

      if (!result) {
        this.logger.warn(
          `[ArtworksController] [ReqID: ${requestId}] - Artwork not found for deletion: ${id}`,
        );
        throw new NotFoundException(`Artwork with ID ${id} not found`);
      }

      this.logger.log(
        `[ArtworksController] [ReqID: ${requestId}] - Artwork deleted successfully: ${id}`,
      );
      return { success: true };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworksController] [ReqID: ${requestId}] - Unexpected error: delete artwork`,
        {
          id,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to delete artwork');
    }
  }

  @Post(':id/mark-sold')
  @ApiOperation({
    summary: 'Mark artwork as sold',
    description: 'Updates artwork status to sold and records the sale quantity',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the artwork to mark as sold',
    type: 'string',
  })
  @ApiBody({
    description: 'Sale quantity information',
    schema: {
      type: 'object',
      properties: {
        quantity: {
          type: 'number',
          description: 'Quantity sold (default: 1)',
          minimum: 1,
          maximum: 1000,
          default: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Artwork marked as sold successfully',
    type: ArtworkObject,
  })
  @ApiNotFoundResponse({
    description: 'Artwork not found',
  })
  async markArtworkAsSold(
    @Param('id') id: string,
    @Body() body: { quantity?: number } = { quantity: 1 },
  ): Promise<ArtworkObject> {
    const requestId = uuidv4();
    const quantity = body.quantity || 1;
    this.logger.log(
      `[ArtworksController] [ReqID: ${requestId}] - Marking artwork as sold`,
      { id, quantity },
    );

    try {
      if (!id || id.trim() === '') {
        throw new BadRequestException('Artwork ID is required');
      }

      if (id.length < 10) {
        throw new BadRequestException('Invalid artwork ID format');
      }

      if (quantity !== undefined) {
        if (!Number.isInteger(quantity) || quantity <= 0) {
          throw new BadRequestException('Quantity must be a positive integer');
        }
        if (quantity > 1000) {
          throw new BadRequestException('Quantity cannot exceed 1000');
        }
      }

      const result = await this.commandBus.execute(
        new MarkArtworkAsSoldCommand(id, quantity),
      );

      if (!result) {
        this.logger.warn(
          `[ArtworksController] [ReqID: ${requestId}] - Artwork not found for marking as sold: ${id}`,
        );
        throw new NotFoundException(`Artwork with ID ${id} not found`);
      }

      this.logger.log(
        `[ArtworksController] [ReqID: ${requestId}] - Artwork marked as sold successfully: ${id}`,
        { quantity },
      );
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworksController] [ReqID: ${requestId}] - Unexpected error: mark artwork as sold`,
        {
          id,
          quantity,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to mark artwork as sold');
    }
  }

  @Post(':id/duplicate')
  @ApiOperation({
    summary: 'Duplicate artwork',
    description: 'Creates a copy of an existing artwork with a new title',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the artwork to duplicate',
    type: 'string',
  })
  @ApiBody({
    description: 'Duplicate artwork request',
    schema: {
      type: 'object',
      required: ['sellerId'],
      properties: {
        sellerId: {
          type: 'string',
          description: 'The seller ID who owns the artwork',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        title: {
          type: 'string',
          description:
            'Optional custom title for the duplicate (defaults to "[Original Title] (Copy)")',
          example: 'My Artwork - Copy',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Artwork duplicated successfully',
    schema: {
      type: 'object',
      properties: {
        original: { $ref: '#/components/schemas/ArtworkObject' },
        duplicate: { $ref: '#/components/schemas/ArtworkObject' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Original artwork not found',
  })
  async duplicateArtwork(
    @Param('id') id: string,
    @Body() body: { sellerId: string; title?: string },
  ): Promise<{ original: ArtworkObject; duplicate: ArtworkObject }> {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworksController] [ReqID: ${requestId}] - Duplicating artwork`,
      { id, sellerId: body.sellerId },
    );

    try {
      if (!id || id.trim() === '') {
        throw new BadRequestException('Artwork ID is required');
      }

      if (id.length < 10) {
        throw new BadRequestException('Invalid artwork ID format');
      }

      if (!body.sellerId || body.sellerId.trim() === '') {
        throw new BadRequestException('Seller ID is required');
      }

      if (body.sellerId.length < 10) {
        throw new BadRequestException('Invalid seller ID format');
      }

      const result = await this.commandBus.execute(
        new DuplicateArtworkCommand(id, body.sellerId, body.title),
      );

      this.logger.log(
        `[ArtworksController] [ReqID: ${requestId}] - Artwork duplicated successfully`,
        {
          originalId: result.original.id,
          duplicateId: result.duplicate.id,
        },
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworksController] [ReqID: ${requestId}] - Unexpected error: duplicate artwork`,
        {
          id,
          sellerId: body.sellerId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to duplicate artwork');
    }
  }

  @Post(':id/images')
  @ApiOperation({
    summary: 'Add images to artwork',
    description:
      'Add new images to an existing artwork with Cloudinary integration',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the artwork',
    type: 'string',
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
    @Body() body: { images: any[] },
  ): Promise<ArtworkObject> {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworksController] [ReqID: ${requestId}] - Adding images to artwork`,
      { id, imageCount: body.images?.length },
    );

    try {
      if (!id || id.trim() === '') {
        throw new BadRequestException('Artwork ID is required');
      }

      if (
        !body.images ||
        !Array.isArray(body.images) ||
        body.images.length === 0
      ) {
        throw new BadRequestException(
          'Images array is required and cannot be empty',
        );
      }

      for (const image of body.images) {
        if (!image.publicId || !image.secureUrl) {
          throw new BadRequestException(
            'Each image must have publicId and secureUrl',
          );
        }
      }

      const result = await this.commandBus.execute(
        new AddImagesToArtworkCommand(id, body.images),
      );

      if (!result) {
        this.logger.warn(
          `[ArtworksController] [ReqID: ${requestId}] - Artwork not found: ${id}`,
        );
        throw new NotFoundException(`Artwork with ID ${id} not found`);
      }

      this.logger.log(
        `[ArtworksController] [ReqID: ${requestId}] - Images added successfully to artwork: ${id}`,
        {
          imageCount: body.images.length,
          totalImages: result.images?.length,
        },
      );
      return result;
    } catch (error) {
      this.logger.error(
        `[ArtworksController] [ReqID: ${requestId}] - Unexpected error: add images to artwork`,
        error.stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add images to artwork');
    }
  }

  @Delete(':id/images')
  @ApiOperation({
    summary: 'Remove images from artwork',
    description:
      'Remove specific images from an artwork and delete from Cloudinary',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the artwork',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Images removed successfully',
    type: ArtworkObject,
  })
  @ApiNotFoundResponse({
    description: 'Artwork not found',
  })
  async removeImagesFromArtwork(
    @Param('id') id: string,
    @Body() body: { imageIds: string[] },
  ): Promise<ArtworkObject> {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworksController] [ReqID: ${requestId}] - Removing images from artwork`,
      { id, imageCount: body.imageIds?.length },
    );

    try {
      if (!id || id.trim() === '') {
        throw new BadRequestException('Artwork ID is required');
      }

      if (
        !body.imageIds ||
        !Array.isArray(body.imageIds) ||
        body.imageIds.length === 0
      ) {
        throw new BadRequestException(
          'Image IDs array is required and cannot be empty',
        );
      }

      const result = await this.commandBus.execute(
        new RemoveImagesFromArtworkCommand(id, body.imageIds),
      );

      if (!result) {
        this.logger.warn(
          `[ArtworksController] [ReqID: ${requestId}] - Artwork not found: ${id}`,
        );
        throw new NotFoundException(`Artwork with ID ${id} not found`);
      }

      this.logger.log(
        `[ArtworksController] [ReqID: ${requestId}] - Images removed successfully from artwork: ${id}`,
        {
          removedCount: body.imageIds.length,
          remainingImages: result.images?.length,
        },
      );
      return result;
    } catch (error) {
      this.logger.error(
        `[ArtworksController] [ReqID: ${requestId}] - Unexpected error: remove images from artwork`,
        error.stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to remove images from artwork',
      );
    }
  }

  @Put(':id/images')
  @ApiOperation({
    summary: 'Update artwork images',
    description:
      'Replace all artwork images with new set and cleanup old ones from Cloudinary',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the artwork',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Images updated successfully',
    type: ArtworkObject,
  })
  @ApiNotFoundResponse({
    description: 'Artwork not found',
  })
  async updateArtworkImages(
    @Param('id') id: string,
    @Body() body: { images: any[] },
  ): Promise<ArtworkObject> {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworksController] [ReqID: ${requestId}] - Updating artwork images`,
      { id, imageCount: body.images?.length },
    );

    try {
      if (!id || id.trim() === '') {
        throw new BadRequestException('Artwork ID is required');
      }

      if (!body.images || !Array.isArray(body.images)) {
        throw new BadRequestException('Images array is required');
      }

      for (const image of body.images) {
        if (!image.publicId || !image.secureUrl) {
          throw new BadRequestException(
            'Each image must have publicId and secureUrl',
          );
        }
      }

      const result = await this.commandBus.execute(
        new UpdateArtworkImagesCommand(id, body.images),
      );

      if (!result) {
        this.logger.warn(
          `[ArtworksController] [ReqID: ${requestId}] - Artwork not found: ${id}`,
        );
        throw new NotFoundException(`Artwork with ID ${id} not found`);
      }

      this.logger.log(
        `[ArtworksController] [ReqID: ${requestId}] - Artwork images updated successfully: ${id}`,
        {
          newImageCount: body.images.length,
          totalImages: result.images?.length,
        },
      );
      return result;
    } catch (error) {
      this.logger.error(
        `[ArtworksController] [ReqID: ${requestId}] - Unexpected error: update artwork images`,
        error.stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update artwork images');
    }
  }

  @Post('bulk/move')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk move artworks to folder',
    description:
      'Move multiple artworks to a specified folder or root (null for root)',
  })
  @ApiBody({
    description: 'Bulk move data',
    schema: {
      type: 'object',
      required: ['artworkIds', 'sellerId'],
      properties: {
        artworkIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of artwork IDs to move',
          minItems: 1,
          maxItems: 100,
        },
        folderId: {
          type: 'string',
          nullable: true,
          description: 'Target folder ID (null or undefined for root)',
        },
        sellerId: {
          type: 'string',
          description: 'Seller ID for authorization',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Artworks moved successfully',
    schema: {
      type: 'object',
      properties: {
        movedCount: { type: 'number' },
        artworks: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  async bulkMoveArtworks(
    @Body()
    body: BulkMoveArtworksInput,
  ) {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworksController] [ReqID: ${requestId}] - Bulk moving artworks`,
      {
        count: body.artworkIds?.length,
        folderId: body.folderId || 'root',
      },
    );

    try {
      // Input validation is now handled by DTO + ValidationPipe
      // Additional checks if needed:
      if (body.artworkIds.length > 100) {
        throw new BadRequestException(
          'Maximum 100 artworks can be moved at once',
        );
      }

      for (const id of body.artworkIds) {
        if (!id || id.trim() === '' || id.length < 10) {
          throw new BadRequestException('All artwork IDs must be valid');
        }
      }

      if (
        !body.sellerId ||
        body.sellerId.trim() === '' ||
        body.sellerId.length < 10
      ) {
        throw new BadRequestException('Valid seller ID is required');
      }

      if (body.folderId !== null && body.folderId !== undefined) {
        if (body.folderId.length < 10) {
          throw new BadRequestException('Invalid folder ID format');
        }
      }

      const result = await this.commandBus.execute(
        new BulkMoveArtworksCommand(
          body.artworkIds,
          body.folderId ?? null,
          body.sellerId,
        ),
      );

      this.logger.log(
        `[ArtworksController] [ReqID: ${requestId}] - Bulk move completed`,
        {
          movedCount: result.movedCount,
        },
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworksController] [ReqID: ${requestId}] - Unexpected error: bulk move artworks`,
        {
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to bulk move artworks');
    }
  }

  @Delete('bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk delete artworks',
    description: 'Delete multiple artworks at once',
  })
  @ApiBody({
    description: 'Bulk delete data',
    schema: {
      type: 'object',
      required: ['artworkIds', 'sellerId'],
      properties: {
        artworkIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of artwork IDs to delete',
          minItems: 1,
          maxItems: 100,
        },
        sellerId: {
          type: 'string',
          description: 'Seller ID for authorization',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Artworks deleted successfully',
    schema: {
      type: 'object',
      properties: {
        deletedCount: { type: 'number' },
        success: { type: 'boolean' },
      },
    },
  })
  async bulkDeleteArtworks(
    @Body() body: BulkDeleteArtworksInput,
  ) {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworksController] [ReqID: ${requestId}] - Bulk deleting artworks`,
      {
        count: body.artworkIds?.length,
      },
    );

    try {
      // Input validation handled by DTO
      if (body.artworkIds.length > 100) {
        throw new BadRequestException(
          'Maximum 100 artworks can be deleted at once',
        );
      }

      for (const id of body.artworkIds) {
        if (!id || id.trim() === '' || id.length < 10) {
          throw new BadRequestException('All artwork IDs must be valid');
        }
      }

      if (
        !body.sellerId ||
        body.sellerId.trim() === '' ||
        body.sellerId.length < 10
      ) {
        throw new BadRequestException('Valid seller ID is required');
      }

      const result = await this.commandBus.execute(
        new BulkDeleteArtworksCommand(body.artworkIds, body.sellerId),
      );

      this.logger.log(
        `[ArtworksController] [ReqID: ${requestId}] - Bulk delete completed`,
        {
          deletedCount: result.deletedCount,
        },
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworksController] [ReqID: ${requestId}] - Unexpected error: bulk delete artworks`,
        {
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to bulk delete artworks');
    }
  }

  @Post('bulk/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk update artwork status',
    description: 'Update status for multiple artworks at once',
  })
  @ApiBody({
    description: 'Bulk status update data',
    schema: {
      type: 'object',
      required: ['artworkIds', 'status', 'sellerId'],
      properties: {
        artworkIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of artwork IDs to update',
          minItems: 1,
          maxItems: 100,
        },
        status: {
          type: 'string',
          enum: [
            'DRAFT',
            'ACTIVE',
            'SOLD',
            'RESERVED',
            'INACTIVE',
            'DELETED',
            'PENDING_REVIEW',
          ],
          description: 'New status for all artworks',
        },
        sellerId: {
          type: 'string',
          description: 'Seller ID for authorization',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Artwork statuses updated successfully',
    schema: {
      type: 'object',
      properties: {
        updatedCount: { type: 'number' },
        artworks: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  async bulkUpdateArtworkStatus(
    @Body() body: BulkUpdateArtworkStatusInput,
  ) {
    const requestId = uuidv4();
    this.logger.log(
      `[ArtworksController] [ReqID: ${requestId}] - Bulk updating artwork status`,
      {
        count: body.artworkIds?.length,
        status: body.status,
      },
    );

    try {
      // Input validation handled by DTO
      if (body.artworkIds.length > 100) {
        throw new BadRequestException(
          'Maximum 100 artworks can be updated at once',
        );
      }

      for (const id of body.artworkIds) {
        if (!id || id.trim() === '' || id.length < 10) {
          throw new BadRequestException('All artwork IDs must be valid');
        }
      }

      if (
        !body.sellerId ||
        body.sellerId.trim() === '' ||
        body.sellerId.length < 10
      ) {
        throw new BadRequestException('Valid seller ID is required');
      }

      const validStatuses = [
        'DRAFT',
        'ACTIVE',
        'SOLD',
        'RESERVED',
        'INACTIVE',
        'DELETED',
        'PENDING_REVIEW',
      ];
      if (!body.status || !validStatuses.includes(body.status)) {
        throw new BadRequestException(
          `Status must be one of: ${validStatuses.join(', ')}`,
        );
      }

      const result = await this.commandBus.execute(
        new BulkUpdateArtworkStatusCommand(
          body.artworkIds,
          body.status as any,
          body.sellerId,
        ),
      );

      this.logger.log(
        `[ArtworksController] [ReqID: ${requestId}] - Bulk status update completed`,
        {
          updatedCount: result.updatedCount,
        },
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[ArtworksController] [ReqID: ${requestId}] - Unexpected error: bulk update status`,
        {
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to bulk update artwork status',
      );
    }
  }
}
