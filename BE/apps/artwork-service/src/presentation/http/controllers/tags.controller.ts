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
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';

import {
  CreateTagInput,
  TagObject,
  UpdateTagInput,
  FindTagsArgs,
} from '../../../domain';

import {
  CreateTagCommand,
  DeleteTagCommand,
  GetTagQuery,
  ListTagsQuery,
  SearchTagsQuery,
  UpdateTagCommand,
} from '../../../application';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  private readonly logger = new Logger(TagsController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get tag by ID',
    description: 'Retrieves a specific tag by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the tag',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Tag retrieved successfully',
    type: TagObject,
  })
  @ApiResponse({
    status: 404,
    description: 'Tag not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid tag ID',
  })
  async getTag(@Param('id') id: string): Promise<TagObject | null> {
    const requestId = uuidv4();
    this.logger.log(
      `[TagsController] [ReqID: ${requestId}] - Getting tag by ID: ${id}`,
    );

    try {
      if (!id || id.trim() === '') {
        throw new BadRequestException('Tag ID is required');
      }

      if (id.length < 10) {
        throw new BadRequestException('Invalid tag ID format');
      }

      const tag = await this.queryBus.execute(new GetTagQuery(id));

      if (!tag) {
        this.logger.warn(
          `[TagsController] [ReqID: ${requestId}] - Tag not found: ${id}`,
        );
        return null;
      }

      this.logger.log(
        `[TagsController] [ReqID: ${requestId}] - Tag retrieved successfully: ${id}`,
      );
      return tag;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[TagsController] [ReqID: ${requestId}] - Unexpected error: get tag`,
        {
          id,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to retrieve tag');
    }
  }

  @Get()
  @ApiOperation({
    summary: 'List tags',
    description:
      'Retrieves a list of tags with optional filtering and pagination',
  })
  @ApiQuery({
    name: 'sellerId',
    required: false,
    description: 'Filter tags by seller ID',
    type: 'string',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter tags by status (ACTIVE, INACTIVE)',
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
    description: 'Number of records to return',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Tags listed successfully',
    type: [TagObject],
  })
  async listTags(@Query() filters?: FindTagsArgs): Promise<TagObject[]> {
    const requestId = uuidv4();
    this.logger.log(`[TagsController] [ReqID: ${requestId}] - Listing tags`, {
      filters,
    });

    try {
      if (filters) {
        if (
          filters.skip !== undefined &&
          (filters.skip < 0 || !Number.isInteger(filters.skip))
        ) {
          throw new BadRequestException('Skip must be a non-negative integer');
        }

        if (
          filters.take !== undefined &&
          (filters.take <= 0 ||
            filters.take > 100 ||
            !Number.isInteger(filters.take))
        ) {
          throw new BadRequestException(
            'Take must be a positive integer not exceeding 100',
          );
        }

        if (filters.sellerId && filters.sellerId.length < 10) {
          throw new BadRequestException('Invalid seller ID format');
        }

        if (
          filters.status &&
          !['ACTIVE', 'INACTIVE'].includes(filters.status)
        ) {
          throw new BadRequestException(
            'Status must be either ACTIVE or INACTIVE',
          );
        }
      }

      const tags = await this.queryBus.execute(
        new ListTagsQuery(filters || {}),
      );

      this.logger.log(
        `[TagsController] [ReqID: ${requestId}] - Tags listed successfully`,
        {
          count: tags.length,
        },
      );

      return tags;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[TagsController] [ReqID: ${requestId}] - Unexpected error: list tags`,
        {
          filters,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to retrieve tags');
    }
  }

  @Get('search/:query')
  @ApiOperation({
    summary: 'Search tags',
    description: 'Searches tags by name with optional filters',
  })
  @ApiParam({
    name: 'query',
    description: 'Search query string',
    type: 'string',
  })
  @ApiQuery({
    name: 'sellerId',
    required: false,
    description: 'Filter search by seller ID',
    type: 'string',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of results to return',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Tags searched successfully',
    type: [TagObject],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid search query',
  })
  async searchTags(
    @Param('query') query: string,
    @Query('sellerId') sellerId?: string,
    @Query('limit') limit?: number,
  ): Promise<TagObject[]> {
    const requestId = uuidv4();
    this.logger.log(`[TagsController] [ReqID: ${requestId}] - Searching tags`, {
      query,
      sellerId,
      limit,
    });

    try {
      if (!query || query.trim().length === 0) {
        throw new BadRequestException('Search query must not be empty');
      }

      if (query.length > 100) {
        throw new BadRequestException(
          'Search query must be less than 100 characters',
        );
      }

      if (sellerId && sellerId.length < 10) {
        throw new BadRequestException('Invalid seller ID format');
      }

      const limitNum = limit ? parseInt(String(limit), 10) : 10;
      if (isNaN(limitNum) || limitNum <= 0 || limitNum > 100) {
        throw new BadRequestException(
          'Limit must be a positive integer not exceeding 100',
        );
      }

      const tags = await this.queryBus.execute(
        new SearchTagsQuery(sellerId || null, query.trim(), limitNum),
      );

      this.logger.log(
        `[TagsController] [ReqID: ${requestId}] - Tag search completed`,
        {
          query,
          found: tags.length,
        },
      );

      return tags;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[TagsController] [ReqID: ${requestId}] - Unexpected error: search tags`,
        {
          query,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to search tags');
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Create tag',
    description: 'Creates a new tag with the provided details',
  })
  @ApiBody({
    type: CreateTagInput,
    description: 'Tag creation data',
  })
  @ApiResponse({
    status: 201,
    description: 'Tag created successfully',
    type: TagObject,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async createTag(@Body() input: CreateTagInput): Promise<TagObject> {
    const requestId = uuidv4();
    this.logger.log(`[TagsController] [ReqID: ${requestId}] - Creating tag`, {
      name: input?.name,
    });

    try {
      if (!input) {
        throw new BadRequestException('Tag creation input is required');
      }

      if (!input.name || input.name.trim().length === 0) {
        throw new BadRequestException('Tag name is required');
      }

      if (input.name.length > 100) {
        throw new BadRequestException(
          'Tag name must be less than 100 characters',
        );
      }

      const validNamePattern = /^[a-zA-Z0-9\s\-_]+$/;
      if (!validNamePattern.test(input.name.trim())) {
        throw new BadRequestException(
          'Tag name can only contain letters, numbers, spaces, hyphens, and underscores',
        );
      }

      if (input.sellerId && input.sellerId.length < 10) {
        throw new BadRequestException('Invalid seller ID format');
      }

      if (input.status && !['ACTIVE', 'INACTIVE'].includes(input.status)) {
        throw new BadRequestException(
          'Status must be either ACTIVE or INACTIVE',
        );
      }

      const result = await this.commandBus.execute(new CreateTagCommand(input));

      this.logger.log(
        `[TagsController] [ReqID: ${requestId}] - Tag created successfully`,
        {
          id: result.id,
          name: result.name,
        },
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[TagsController] [ReqID: ${requestId}] - Unexpected error: create tag`,
        {
          name: input?.name,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to create tag');
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update tag',
    description: 'Updates an existing tag with new information',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the tag to update',
    type: 'string',
  })
  @ApiBody({
    type: UpdateTagInput,
    description: 'Tag update data',
  })
  @ApiResponse({
    status: 200,
    description: 'Tag updated successfully',
    type: TagObject,
  })
  @ApiResponse({
    status: 404,
    description: 'Tag not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async updateTag(
    @Param('id') id: string,
    @Body() input: UpdateTagInput,
  ): Promise<TagObject> {
    const requestId = uuidv4();
    this.logger.log(
      `[TagsController] [ReqID: ${requestId}] - Updating tag: ${id}`,
    );

    try {
      if (!id || id.trim() === '') {
        throw new BadRequestException('Tag ID is required');
      }

      if (id.length < 10) {
        throw new BadRequestException('Invalid tag ID format');
      }

      if (!input || Object.keys(input).length === 0) {
        throw new BadRequestException(
          'At least one field must be provided for update',
        );
      }

      if (input.name !== undefined) {
        if (!input.name || input.name.trim().length === 0) {
          throw new BadRequestException('Tag name cannot be empty');
        }

        if (input.name.length > 100) {
          throw new BadRequestException(
            'Tag name must be less than 100 characters',
          );
        }

        const validNamePattern = /^[a-zA-Z0-9\s\-_]+$/;
        if (!validNamePattern.test(input.name.trim())) {
          throw new BadRequestException(
            'Tag name can only contain letters, numbers, spaces, hyphens, and underscores',
          );
        }
      }

      if (input.status && !['ACTIVE', 'INACTIVE'].includes(input.status)) {
        throw new BadRequestException(
          'Status must be either ACTIVE or INACTIVE',
        );
      }

      const updated = await this.commandBus.execute(
        new UpdateTagCommand(id, input),
      );

      if (!updated) {
        this.logger.warn(
          `[TagsController] [ReqID: ${requestId}] - Tag not found for update: ${id}`,
        );
        throw new NotFoundException(`Tag with ID ${id} not found`);
      }

      this.logger.log(
        `[TagsController] [ReqID: ${requestId}] - Tag updated successfully: ${id}`,
      );
      return updated;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[TagsController] [ReqID: ${requestId}] - Unexpected error: update tag`,
        {
          id,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to update tag');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete tag',
    description: 'Permanently removes a tag from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the tag to delete',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Tag deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Tag not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid tag ID',
  })
  async deleteTag(@Param('id') id: string): Promise<{ success: boolean }> {
    const requestId = uuidv4();
    this.logger.log(
      `[TagsController] [ReqID: ${requestId}] - Deleting tag: ${id}`,
    );

    try {
      if (!id || id.trim() === '') {
        throw new BadRequestException('Tag ID is required');
      }

      if (id.length < 10) {
        throw new BadRequestException('Invalid tag ID format');
      }

      const deleted = await this.commandBus.execute(new DeleteTagCommand(id));

      if (!deleted) {
        this.logger.warn(
          `[TagsController] [ReqID: ${requestId}] - Tag not found for deletion: ${id}`,
        );
        throw new NotFoundException(`Tag with ID ${id} not found`);
      }

      this.logger.log(
        `[TagsController] [ReqID: ${requestId}] - Tag deleted successfully: ${id}`,
      );
      return { success: true };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[TagsController] [ReqID: ${requestId}] - Unexpected error: delete tag`,
        {
          id,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to delete tag');
    }
  }
}
