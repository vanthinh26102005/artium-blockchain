import { JwtAuthGuard } from '@app/auth';
import {
  CreateTagInput,
  FindTagsArgs,
  TagObject,
  UpdateTagInput,
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

@ApiTags('Tags')
@Controller('artwork/tags')
export class TagsController {
  constructor(
    @Inject(MICROSERVICES.ARTWORK_SERVICE)
    private readonly artworkClient: ClientProxy,
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
    return sendRpc<TagObject | null>(
      this.artworkClient,
      { cmd: 'get_tag' },
      { id },
    );
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
  async getTags(@Query() filters?: FindTagsArgs): Promise<TagObject[]> {
    return sendRpc<TagObject[]>(
      this.artworkClient,
      { cmd: 'get_tags' },
      filters,
    );
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
    return sendRpc<TagObject[]>(
      this.artworkClient,
      { cmd: 'search_tags' },
      { query, sellerId, limit },
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
    return sendRpc<TagObject>(this.artworkClient, { cmd: 'create_tag' }, input);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
    return sendRpc<TagObject>(
      this.artworkClient,
      { cmd: 'update_tag' },
      { id, input },
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
    return sendRpc<{ success: boolean }>(
      this.artworkClient,
      { cmd: 'delete_tag' },
      { id },
    );
  }
}
