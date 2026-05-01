import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
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
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { MICROSERVICES } from '../../../../config';
import { sendRpc } from '../../utils';

type ListMomentsQuery = {
  skip?: number;
  take?: number;
  includeArchived?: boolean;
};

type ListCommentsQuery = {
  skip?: number;
  take?: number;
  includeDeleted?: boolean;
};

type CommentResponse = {
  id: string;
  userId: string;
  commentableType: string;
  commentableId: string;
  parentCommentId?: string | null;
  content: string;
  mediaUrl?: string | null;
  mentionedUserIds?: string[] | null;
  likeCount: number;
  replyCount: number;
  isEdited: boolean;
  editedAt?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  isFlagged: boolean;
  contentOwnerId?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  author?: {
    id: string;
    username?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
};

class CreateMomentCommentBody {
  @ApiProperty({
    description: 'Comment content',
    maxLength: 2000,
    example: 'Beautiful work!',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content!: string;

  @ApiPropertyOptional({ description: 'Parent comment ID for replies' })
  @IsOptional()
  @IsString()
  parentCommentId?: string;

  @ApiPropertyOptional({
    description: 'Mentioned user IDs',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentionedUserIds?: string[];

  @ApiPropertyOptional({
    description: 'User ID of the content owner (for notifications)',
  })
  @IsOptional()
  @IsString()
  contentOwnerId?: string;
}

class SetLikeStatusBody {
  @ApiProperty({
    description: 'Whether the current user likes this moment',
    example: true,
  })
  @IsBoolean()
  liked!: boolean;

  @ApiPropertyOptional({
    description: 'User ID of the content owner (for notifications)',
  })
  @IsOptional()
  @IsString()
  contentOwnerId?: string;
}

class CreateMomentBody {
  @ApiProperty({
    description: 'Backend-issued uploaded community media ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  mediaId!: string;

  @ApiPropertyOptional({
    description: 'Caption for the moment',
    maxLength: 2200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2200)
  caption?: string;

  @ApiPropertyOptional({
    description: 'Whether to pin this moment to profile',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiPropertyOptional({
    description: 'Location where the moment was captured',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({
    description: 'Hashtags associated with the moment',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @ApiPropertyOptional({
    description: 'Duration of video in seconds',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  durationSeconds?: number;

  @ApiPropertyOptional({
    description: 'Artwork IDs to tag in this moment',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  taggedArtworkIds?: string[];
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

@ApiTags('Community - Moments')
@Controller('community/moments')
export class CommunityMomentsController {
  constructor(
    @Inject(MICROSERVICES.COMMUNITY_SERVICE)
    private readonly communityClient: ClientProxy,
    @Inject(MICROSERVICES.IDENTITY_SERVICE)
    private readonly identityClient: ClientProxy,
  ) {}

  @Get('user/:userId')
  @ApiOperation({ summary: 'List moments by user' })
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
    name: 'includeArchived',
    required: false,
    type: Boolean,
    description: 'Include archived moments',
  })
  @ApiResponse({
    status: 200,
    description: 'User moments retrieved successfully',
  })
  async listUserMoments(
    @Param('userId') userId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('includeArchived') includeArchived?: string,
  ) {
    const options: ListMomentsQuery = {
      skip: parseOptionalNumber(skip),
      take: parseOptionalNumber(take),
      includeArchived: parseOptionalBoolean(includeArchived),
    };

    return sendRpc(
      this.communityClient,
      { cmd: 'list_user_moments' },
      { userId, options },
    );
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new moment' })
  @ApiBody({ type: CreateMomentBody })
  @ApiResponse({
    status: 201,
    description: 'Moment created successfully',
  })
  async createMoment(
    @Body() body: CreateMomentBody,
    @Request() req: Express.Request & { user: UserPayload },
  ) {
    return sendRpc(this.communityClient, { cmd: 'create_moment' }, {
      userId: req.user?.id,
      ...body,
    });
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'List comments for a moment' })
  @ApiParam({ name: 'id', type: 'string', description: 'Moment ID' })
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
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'Include deleted comments',
  })
  @ApiResponse({
    status: 200,
    description: 'Moment comments retrieved successfully',
  })
  async listMomentComments(
    @Param('id') id: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    const options: ListCommentsQuery = {
      skip: parseOptionalNumber(skip),
      take: parseOptionalNumber(take),
      includeDeleted: parseOptionalBoolean(includeDeleted),
    };

    const comments = await sendRpc<CommentResponse[]>(
      this.communityClient,
      { cmd: 'list_comments' },
      {
        commentableType: 'moment',
        commentableId: id,
        options,
      },
    );

    if (!comments.length) {
      return comments;
    }

    const uniqueUserIds = Array.from(
      new Set(comments.map((comment) => comment.userId).filter(Boolean)),
    );

    const users = await Promise.all(
      uniqueUserIds.map((userId) =>
        sendRpc<UserPayload>(
          this.identityClient,
          { cmd: 'get_user_by_id' },
          { userId },
        ).catch(() => null),
      ),
    );

    const userMap = new Map<string, UserPayload | null>();
    uniqueUserIds.forEach((userId, index) => {
      userMap.set(userId, users[index] ?? null);
    });

    return comments.map((comment) => ({
      ...comment,
      author: this.buildCommentAuthor(comment.userId, userMap.get(comment.userId)),
    }));
  }

  @Post(':id/comments')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a comment on a moment' })
  @ApiParam({ name: 'id', type: 'string', description: 'Moment ID' })
  @ApiBody({ type: CreateMomentCommentBody })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
  })
  async createMomentComment(
    @Param('id') id: string,
    @Body() body: CreateMomentCommentBody,
    @Request() req: Express.Request & { user: UserPayload },
  ) {
    const comment = await sendRpc<CommentResponse>(
      this.communityClient,
      { cmd: 'create_comment' },
      {
        userId: req.user?.id,
        commentableType: 'moment',
        commentableId: id,
        content: body.content,
        parentCommentId: body.parentCommentId,
        mentionedUserIds: body.mentionedUserIds,
        contentOwnerId: body.contentOwnerId,
      },
    );

    const author = await sendRpc<UserPayload>(
      this.identityClient,
      { cmd: 'get_user_by_id' },
      { userId: comment.userId },
    ).catch(() => null);

    return {
      ...comment,
      author: this.buildCommentAuthor(comment.userId, author),
    };
  }

  @Get(':id/likes/me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check if current user likes a moment' })
  @ApiParam({ name: 'id', type: 'string', description: 'Moment ID' })
  @ApiResponse({
    status: 200,
    description: 'Like status retrieved successfully',
  })
  async getMomentLikeStatus(
    @Param('id') id: string,
    @Request() req: Express.Request & { user: UserPayload },
  ) {
    const liked = await sendRpc<boolean>(
      this.communityClient,
      { cmd: 'is_liked' },
      {
        userId: req.user?.id,
        likeableType: 'moment',
        likeableId: id,
      },
    );

    return { liked };
  }

  @Put(':id/likes')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Set like status for a moment' })
  @ApiParam({ name: 'id', type: 'string', description: 'Moment ID' })
  @ApiBody({ type: SetLikeStatusBody })
  @ApiResponse({
    status: 200,
    description: 'Like status updated successfully',
  })
  async setMomentLikeStatus(
    @Param('id') id: string,
    @Body() body: SetLikeStatusBody,
    @Request() req: Express.Request & { user: UserPayload },
  ) {
    return sendRpc(
      this.communityClient,
      { cmd: 'set_like_status' },
      {
        userId: req.user?.id,
        likeableType: 'moment',
        likeableId: id,
        liked: body.liked,
        contentOwnerId: body.contentOwnerId,
      },
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get moment by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Moment ID' })
  @ApiResponse({
    status: 200,
    description: 'Moment retrieved successfully',
  })
  async getMomentById(@Param('id') id: string) {
    return sendRpc(this.communityClient, { cmd: 'get_moment' }, { id });
  }

  private buildCommentAuthor(
    userId: string,
    user?: UserPayload | null,
  ): CommentResponse['author'] {
    const displayName = user?.fullName || 'Unknown';
    return {
      id: user?.id ?? userId,
      username: user?.fullName ?? null,
      displayName,
      avatarUrl: user?.avatarUrl ?? null,
    };
  }
}
