import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
  Inject,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiBody,
  ApiUnauthorizedResponse,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { JwtAuthGuard } from '@app/auth';
import { MICROSERVICES } from '../../../../config';
import { sendRpc } from '../../utils';

class FollowerObject {
  id: string;
  followedUserId: string;
  isMutual: boolean;
  notifyOnPosts: boolean;
  notifyOnEvents: boolean;
  followSource?: string | null;
  isAutoFollow: boolean;
  engagementScore: number;
  lastViewedAt?: Date | null;
  createdAt: Date;
}

class FollowUserBody {
  @ApiProperty({
    description: 'User ID to follow',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsString()
  @IsNotEmpty()
  followedUserId!: string;

  @ApiPropertyOptional({
    description: 'Whether to receive notifications for posts',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  notifyOnPosts?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to receive notifications for events',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  notifyOnEvents?: boolean;

  @ApiPropertyOptional({
    description: 'Source of the follow action',
    maxLength: 50,
    example: 'profile',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  followSource?: string;
}

class CheckFollowStatusResponse {
  isFollowing: boolean;
  followedAt?: Date | null;
}

@ApiTags('Followers')
@Controller('community/followers')
export class FollowersController {
  constructor(
    @Inject(MICROSERVICES.COMMUNITY_SERVICE)
    private readonly communityClient: ClientProxy,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Follow a user',
    description: 'Create a follow relationship between the authenticated user and another user',
  })
  @ApiBody({ type: FollowUserBody })
  @ApiResponse({
    status: 201,
    description: 'User followed successfully',
    type: FollowerObject,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or user is already being followed',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async followUser(
    @Request() req: any,
    @Body() body: FollowUserBody,
  ): Promise<FollowerObject> {
    const followingUserId = req.user.id;

    return sendRpc<FollowerObject>(
      this.communityClient,
      { cmd: 'follow_user' },
      {
        followingUserId,
        followedUserId: body.followedUserId,
        notifyOnPosts: body.notifyOnPosts ?? true,
        notifyOnEvents: body.notifyOnEvents ?? true,
        followSource: body.followSource || 'profile',
      },
    );
  }

  @Delete(':userId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unfollow a user',
    description: 'Remove a follow relationship',
  })
  @ApiParam({
    name: 'userId',
    description: 'The user ID to unfollow',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'User unfollowed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Follow relationship not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async unfollowUser(
    @Request() req: any,
    @Param('userId') followedUserId: string,
  ): Promise<{ success: boolean }> {
    const followingUserId = req.user.id;

    const result = await sendRpc<boolean>(
      this.communityClient,
      { cmd: 'unfollow_user' },
      {
        followingUserId,
        followedUserId,
      },
    );

    return { success: result };
  }

  @Get('followers/:userId')
  @ApiOperation({
    summary: 'Get followers of a user',
    description: 'Retrieve a list of users who follow the specified user',
  })
  @ApiParam({
    name: 'userId',
    description: 'The user ID to get followers for',
    type: 'string',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Number of records to skip',
    type: Number,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    description: 'Number of records to take',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Followers retrieved successfully',
    type: [FollowerObject],
  })
  async getFollowers(
    @Param('userId') userId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ): Promise<FollowerObject[]> {
    return sendRpc<FollowerObject[]>(
      this.communityClient,
      { cmd: 'get_followers' },
      {
        userId,
        options: {
          skip: skip ? parseInt(skip, 10) : 0,
          take: take ? parseInt(take, 10) : 20,
        },
      },
    );
  }

  @Get('following/:userId')
  @ApiOperation({
    summary: 'Get users that a user is following',
    description: 'Retrieve a list of users that the specified user follows',
  })
  @ApiParam({
    name: 'userId',
    description: 'The user ID to get following list for',
    type: 'string',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Number of records to skip',
    type: Number,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    description: 'Number of records to take',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Following list retrieved successfully',
    type: [FollowerObject],
  })
  async getFollowing(
    @Param('userId') userId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ): Promise<FollowerObject[]> {
    return sendRpc<FollowerObject[]>(
      this.communityClient,
      { cmd: 'get_following' },
      {
        userId,
        options: {
          skip: skip ? parseInt(skip, 10) : 0,
          take: take ? parseInt(take, 10) : 20,
        },
      },
    );
  }

  @Get('status/:userId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Check if current user is following another user',
    description: 'Returns whether the authenticated user is following the specified user',
  })
  @ApiParam({
    name: 'userId',
    description: 'The user ID to check follow status for',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Follow status retrieved successfully',
    type: CheckFollowStatusResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async checkFollowStatus(
    @Request() req: any,
    @Param('userId') targetUserId: string,
  ): Promise<CheckFollowStatusResponse> {
    const followingUserId = req.user.id;

    const followingList = await sendRpc<FollowerObject[]>(
      this.communityClient,
      { cmd: 'get_following' },
      {
        userId: followingUserId,
        options: { skip: 0, take: 1000 },
      },
    );

    const followRelationship = followingList.find(
      (f) => f.followedUserId === targetUserId,
    );

    return {
      isFollowing: !!followRelationship,
      followedAt: followRelationship?.createdAt || null,
    };
  }
}
