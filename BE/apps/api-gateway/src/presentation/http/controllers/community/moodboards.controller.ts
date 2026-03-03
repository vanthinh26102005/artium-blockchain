import {
  Body,
  Controller,
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
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
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
    description: 'Cover image URL',
  })
  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

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
    return sendRpc(this.communityClient, { cmd: 'create_moodboard' }, {
      userId: req.user?.id,
      ...body,
    });
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
