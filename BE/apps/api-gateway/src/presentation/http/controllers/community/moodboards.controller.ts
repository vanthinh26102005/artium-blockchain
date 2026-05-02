import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@app/auth';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserPayload } from '@app/common';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { MICROSERVICES } from '../../../../config';
import { sendRpc } from '../../utils';

type ListMoodboardsQuery = {
  skip?: number;
  take?: number;
  includePrivate?: boolean;
};

class CreateMoodboardBody {
  @ApiProperty({
    description: 'Title of the moodboard',
    maxLength: 255,
    example: 'Summer palettes',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({
    description: 'Description of the moodboard',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Ordered backend-issued uploaded community media IDs',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaIds?: string[];

  @ApiPropertyOptional({
    description: 'Uploaded community media ID to use as the cover',
  })
  @IsOptional()
  @IsString()
  coverMediaId?: string;

  @ApiPropertyOptional({
    description: 'Whether the moodboard is private',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @ApiPropertyOptional({
    description: 'Whether others can collaborate on this moodboard',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isCollaborative?: boolean;

  @ApiPropertyOptional({
    description: 'Tags for categorization',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

class AddArtworkToMoodboardBody {
  @ApiProperty({
    description: 'Artwork ID to add',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsString()
  @IsNotEmpty()
  artworkId!: string;

  @ApiPropertyOptional({
    description: 'Display order in the moodboard',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Notes about this artwork in the context of the moodboard',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Tags specific to this artwork-moodboard relationship',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Whether this artwork is a favorite in the moodboard',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @ApiPropertyOptional({ description: 'Cached artwork title' })
  @IsOptional()
  @IsString()
  artworkTitle?: string;

  @ApiPropertyOptional({ description: 'Cached artwork image URL' })
  @IsOptional()
  @IsString()
  artworkImageUrl?: string;

  @ApiPropertyOptional({ description: 'Cached artwork price' })
  @IsOptional()
  @IsNumber()
  artworkPrice?: number;

  @ApiPropertyOptional({ description: 'Cached artwork seller ID' })
  @IsOptional()
  @IsString()
  artworkSellerId?: string;
}

const parseOptionalNumber = (value?: string) => {
  if (!value) {
    return undefined;
  }
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseOptionalBoolean = (value?: string) => {
  if (value === undefined) {
    return undefined;
  }
  if (value === 'true' || value === '1') {
    return true;
  }
  if (value === 'false' || value === '0') {
    return false;
  }
  return undefined;
};

@ApiTags('Community - Moodboards')
@Controller('community/moodboards')
export class CommunityMoodboardsController {
  constructor(
    @Inject(MICROSERVICES.COMMUNITY_SERVICE)
    private readonly communityClient: ClientProxy,
  ) {}

  @Get('user/:userId')
  @ApiOperation({ summary: 'List moodboards by user' })
  @ApiParam({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of records to skip',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of records to take',
  })
  @ApiQuery({
    name: 'includePrivate',
    required: false,
    type: Boolean,
    description: 'Include private moodboards',
  })
  @ApiResponse({
    status: 200,
    description: 'User moodboards retrieved successfully',
  })
  async listUserMoodboards(
    @Param('userId') userId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('includePrivate') includePrivate?: string,
  ) {
    const options: ListMoodboardsQuery = {
      skip: parseOptionalNumber(skip),
      take: parseOptionalNumber(take),
      includePrivate: parseOptionalBoolean(includePrivate),
    };

    return sendRpc(
      this.communityClient,
      { cmd: 'list_user_moodboards' },
      { userId, options },
    );
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new moodboard' })
  @ApiBody({ type: CreateMoodboardBody })
  @ApiResponse({
    status: 201,
    description: 'Moodboard created successfully',
  })
  async createMoodboard(
    @Body() body: CreateMoodboardBody,
    @Request() req: Express.Request & { user: UserPayload },
  ) {
    return sendRpc(
      this.communityClient,
      { cmd: 'create_moodboard' },
      {
        userId: req.user?.id,
        ...body,
      },
    );
  }

  @Get('artwork/:artworkId/me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'List current user moodboard IDs containing an artwork',
  })
  @ApiParam({ name: 'artworkId', type: 'string', description: 'Artwork ID' })
  @ApiResponse({
    status: 200,
    description: 'Moodboard IDs retrieved successfully',
  })
  async listCurrentUserMoodboardIdsForArtwork(
    @Param('artworkId') artworkId: string,
    @Request() req: Express.Request & { user: UserPayload },
  ) {
    return sendRpc<string[]>(
      this.communityClient,
      { cmd: 'list_artwork_moodboard_ids_for_user' },
      { userId: req.user?.id, artworkId },
    );
  }

  @Post(':id/artworks')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add an artwork to a moodboard' })
  @ApiParam({ name: 'id', type: 'string', description: 'Moodboard ID' })
  @ApiBody({ type: AddArtworkToMoodboardBody })
  @ApiResponse({
    status: 201,
    description: 'Artwork added to moodboard successfully',
  })
  async addArtworkToMoodboard(
    @Param('id') id: string,
    @Body() body: AddArtworkToMoodboardBody,
    @Request() req: Express.Request & { user: UserPayload },
  ) {
    return sendRpc(
      this.communityClient,
      { cmd: 'add_artwork_to_moodboard' },
      {
        userId: req.user?.id,
        input: {
          ...body,
          moodboardId: id,
        },
      },
    );
  }

  @Delete(':id/artworks/:artworkId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove an artwork from a moodboard' })
  @ApiParam({ name: 'id', type: 'string', description: 'Moodboard ID' })
  @ApiParam({ name: 'artworkId', type: 'string', description: 'Artwork ID' })
  @ApiResponse({
    status: 200,
    description: 'Artwork removed from moodboard successfully',
  })
  async removeArtworkFromMoodboard(
    @Param('id') id: string,
    @Param('artworkId') artworkId: string,
    @Request() req: Express.Request & { user: UserPayload },
  ) {
    return sendRpc<boolean>(
      this.communityClient,
      { cmd: 'remove_artwork_from_moodboard' },
      { userId: req.user?.id, moodboardId: id, artworkId },
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get moodboard by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Moodboard ID' })
  @ApiResponse({
    status: 200,
    description: 'Moodboard retrieved successfully',
  })
  async getMoodboardById(@Param('id') id: string) {
    return sendRpc(this.communityClient, { cmd: 'get_moodboard' }, { id });
  }
}
