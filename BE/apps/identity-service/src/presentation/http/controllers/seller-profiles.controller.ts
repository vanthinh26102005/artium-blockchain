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
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';

import {
  CreateSellerProfileInputType,
  UpdateSellerProfileInputType,
  UpdateVerificationStatusInput,
  UpdateProfileVisibilityInput,
  UpdatePaymentOnboardingInput,
  SellerProfilePayload,
  PaginatedSellerProfilesPayload,
  CreateSellerProfileResponse,
  UpdateSellerProfileResponse,
  DeleteSellerProfileResponse,
  ListSellerProfilesInput,
} from '../../../domain';
import {
  CreateSellerProfileCommand,
  UpdateSellerProfileCommand,
  DeleteSellerProfileCommand,
  UpdateVerificationStatusCommand,
  UpdateProfileVisibilityCommand,
  UpdatePaymentOnboardingCommand,
  GetSellerProfileByIdQuery,
  GetSellerProfileByUserIdQuery,
  GetSellerProfileBySlugQuery,
  ListSellerProfilesQuery,
  GetFeaturedSellerProfilesQuery,
} from '../../../application';
import { JwtAuthGuard } from '@app/auth';
import { ProfileType } from '@app/common';

@ApiTags('seller-profiles')
@Controller('seller-profiles')
export class SellerProfilesController {
  private readonly logger = new Logger(SellerProfilesController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':profileId')
  @ApiOperation({
    summary: 'Get seller profile by ID',
    description: 'Retrieves a seller profile by its unique profile ID',
  })
  @ApiParam({
    name: 'profileId',
    description: 'The unique identifier of the seller profile',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Seller profile retrieved successfully',
    type: SellerProfilePayload,
  })
  @ApiResponse({
    status: 404,
    description: 'Seller profile not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid profile ID format',
  })
  async getSellerProfileById(
    @Param('profileId') profileId: string,
  ): Promise<SellerProfilePayload> {
    const requestId = uuidv4();
    this.logger.log(
      `[SellerProfilesController] [ReqID: ${requestId}] - Getting seller profile by ID: ${profileId}`,
    );

    try {
      if (!profileId || profileId.trim() === '') {
        throw new BadRequestException('Profile ID is required');
      }

      if (profileId.length < 1) {
        throw new BadRequestException('Invalid profile ID format');
      }

      const profile = await this.queryBus.execute(
        new GetSellerProfileByIdQuery(profileId),
      );

      if (!profile) {
        this.logger.warn(
          `[SellerProfilesController] [ReqID: ${requestId}] - Seller profile not found: ${profileId}`,
        );
        throw new NotFoundException(
          `Seller profile with ID ${profileId} not found`,
        );
      }

      this.logger.log(
        `[SellerProfilesController] [ReqID: ${requestId}] - Seller profile retrieved successfully: ${profileId}`,
      );
      return profile;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[SellerProfilesController] [ReqID: ${requestId}] - Unexpected error: get seller profile by ID`,
        {
          profileId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to retrieve seller profile',
      );
    }
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get seller profile by user ID',
    description: 'Retrieves a seller profile by its associated user ID',
  })
  @ApiParam({
    name: 'userId',
    description: 'The user ID associated with the seller profile',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Seller profile retrieved successfully',
    type: SellerProfilePayload,
  })
  @ApiResponse({
    status: 404,
    description: 'Seller profile not found for this user',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid user ID format',
  })
  async getSellerProfileByUserId(
    @Param('userId') userId: string,
  ): Promise<SellerProfilePayload> {
    const requestId = uuidv4();
    this.logger.log(
      `[SellerProfilesController] [ReqID: ${requestId}] - Getting seller profile by user ID: ${userId}`,
    );

    try {
      if (!userId || userId.trim() === '') {
        throw new BadRequestException('User ID is required');
      }

      const profile = await this.queryBus.execute(
        new GetSellerProfileByUserIdQuery(userId),
      );

      if (!profile) {
        this.logger.warn(
          `[SellerProfilesController] [ReqID: ${requestId}] - Seller profile not found for user: ${userId}`,
        );
        throw new NotFoundException(
          `Seller profile not found for user ID ${userId}`,
        );
      }

      this.logger.log(
        `[SellerProfilesController] [ReqID: ${requestId}] - Seller profile retrieved successfully for user: ${userId}`,
      );
      return profile;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[SellerProfilesController] [ReqID: ${requestId}] - Unexpected error: get seller profile by user ID`,
        {
          userId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to retrieve seller profile',
      );
    }
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Get seller profile by slug',
    description:
      'Retrieves a seller profile by its unique slug for public profile pages',
  })
  @ApiParam({
    name: 'slug',
    description: 'The unique slug of the seller profile',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Seller profile retrieved successfully',
    type: SellerProfilePayload,
  })
  @ApiResponse({
    status: 404,
    description: 'Seller profile not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid slug format',
  })
  async getSellerProfileBySlug(
    @Param('slug') slug: string,
  ): Promise<SellerProfilePayload> {
    const requestId = uuidv4();
    this.logger.log(
      `[SellerProfilesController] [ReqID: ${requestId}] - Getting seller profile by slug: ${slug}`,
    );

    try {
      if (!slug || slug.trim() === '') {
        throw new BadRequestException('Slug is required');
      }

      if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug)) {
        throw new BadRequestException('Invalid slug format');
      }

      const profile = await this.queryBus.execute(
        new GetSellerProfileBySlugQuery(slug),
      );

      if (!profile) {
        this.logger.warn(
          `[SellerProfilesController] [ReqID: ${requestId}] - Seller profile not found for slug: ${slug}`,
        );
        throw new NotFoundException(
          `Seller profile with slug ${slug} not found`,
        );
      }

      this.logger.log(
        `[SellerProfilesController] [ReqID: ${requestId}] - Seller profile retrieved successfully for slug: ${slug}`,
      );
      return profile;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[SellerProfilesController] [ReqID: ${requestId}] - Unexpected error: get seller profile by slug`,
        {
          slug,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to retrieve seller profile',
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: 'List seller profiles',
    description:
      'Retrieves a paginated list of seller profiles with optional filters',
  })
  @ApiQuery({
    name: 'profileType',
    required: false,
    description: 'Filter by profile type',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'isVerified',
    required: false,
    description: 'Filter by verified status',
  })
  @ApiQuery({
    name: 'isFeatured',
    required: false,
    description: 'Filter by featured status',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location',
  })
  @ApiQuery({
    name: 'searchQuery',
    required: false,
    description: 'Search query for display name and bio',
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
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Field to sort by',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order (ASC or DESC)',
  })
  @ApiResponse({
    status: 200,
    description: 'Seller profiles retrieved successfully',
    type: PaginatedSellerProfilesPayload,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
  })
  async listSellerProfiles(
    @Query('profileType') profileType?: ProfileType,
    @Query('isActive') isActive?: string,
    @Query('isVerified') isVerified?: string,
    @Query('isFeatured') isFeatured?: string,
    @Query('location') location?: string,
    @Query('searchQuery') searchQuery?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ): Promise<PaginatedSellerProfilesPayload> {
    const requestId = uuidv4();
    this.logger.log(
      `[SellerProfilesController] [ReqID: ${requestId}] - Listing seller profiles`,
    );

    try {
      const skipNum = skip ? parseInt(skip, 10) : 0;
      const takeNum = take ? parseInt(take, 10) : 20;

      if (isNaN(skipNum) || skipNum < 0) {
        throw new BadRequestException('Skip must be a non-negative number');
      }

      if (isNaN(takeNum) || takeNum < 1 || takeNum > 100) {
        throw new BadRequestException('Take must be between 1 and 100');
      }

      const filters = {
        profileType,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        isVerified:
          isVerified !== undefined ? isVerified === 'true' : undefined,
        isFeatured:
          isFeatured !== undefined ? isFeatured === 'true' : undefined,
        location,
        searchQuery,
      };

      const result = await this.queryBus.execute(
        new ListSellerProfilesQuery(
          filters,
          skipNum,
          takeNum,
          sortBy || 'createdAt',
          sortOrder || 'DESC',
        ),
      );

      this.logger.log(
        `[SellerProfilesController] [ReqID: ${requestId}] - Seller profiles listed successfully`,
      );
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[SellerProfilesController] [ReqID: ${requestId}] - Unexpected error: list seller profiles`,
        {
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to retrieve seller profiles',
      );
    }
  }

  @Get('featured/list')
  @ApiOperation({
    summary: 'Get featured seller profiles',
    description: 'Retrieves a list of featured seller profiles for homepage',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of profiles to return',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Featured seller profiles retrieved successfully',
    type: [SellerProfilePayload],
  })
  async getFeaturedSellerProfiles(
    @Query('limit') limit?: string,
  ): Promise<SellerProfilePayload[]> {
    const requestId = uuidv4();
    this.logger.log(
      `[SellerProfilesController] [ReqID: ${requestId}] - Getting featured seller profiles`,
    );

    try {
      const limitNum = limit ? parseInt(limit, 10) : 10;

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
        throw new BadRequestException('Limit must be between 1 and 50');
      }

      const profiles = await this.queryBus.execute(
        new GetFeaturedSellerProfilesQuery(limitNum),
      );

      this.logger.log(
        `[SellerProfilesController] [ReqID: ${requestId}] - Featured seller profiles retrieved successfully`,
      );
      return profiles;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[SellerProfilesController] [ReqID: ${requestId}] - Unexpected error: get featured seller profiles`,
        {
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to retrieve featured seller profiles',
      );
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create seller profile',
    description: 'Creates a new seller profile for the authenticated user',
  })
  @ApiBody({
    type: CreateSellerProfileInputType,
    description: 'Seller profile creation data',
  })
  @ApiResponse({
    status: 201,
    description: 'Seller profile created successfully',
    type: CreateSellerProfileResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or user already has a seller profile',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async createSellerProfile(
    @Request() req: any,
    @Body() input: CreateSellerProfileInputType,
  ): Promise<CreateSellerProfileResponse> {
    const requestId = uuidv4();
    const userId = req.user.id;
    this.logger.log(
      `[SellerProfilesController] [ReqID: ${requestId}] - Creating seller profile for user: ${userId}`,
    );

    try {
      if (!input) {
        throw new BadRequestException('Seller profile input is required');
      }

      if (!input.displayName || input.displayName.trim() === '') {
        throw new BadRequestException('Display name is required');
      }

      if (!input.slug || input.slug.trim() === '') {
        throw new BadRequestException('Slug is required');
      }

      if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(input.slug)) {
        throw new BadRequestException(
          'Slug must contain only lowercase letters, numbers, and hyphens, and must start/end with a letter or number',
        );
      }

      const defaultInput = {
        ...input,
        userId,
        stripeAccountId: null,
        paypalMerchantId: null,
        stripeOnboardingComplete: false,
        paypalOnboardingComplete: false,
        isActive: true,
        isVerified: false,
        verifiedAt: null,
        isFeatured: false,
      };

      const result = await this.commandBus.execute(
        new CreateSellerProfileCommand(defaultInput),
      );

      this.logger.log(
        `[SellerProfilesController] [ReqID: ${requestId}] - Seller profile created successfully for user: ${userId}`,
      );

      return {
        success: true,
        message: 'Seller profile created successfully',
        sellerProfile: result.sellerProfile,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[SellerProfilesController] [ReqID: ${requestId}] - Unexpected error: create seller profile`,
        {
          userId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to create seller profile. Please try again later.',
      );
    }
  }

  @Put(':profileId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update seller profile',
    description:
      'Updates an existing seller profile (user must own the profile)',
  })
  @ApiParam({
    name: 'profileId',
    description: 'The unique identifier of the seller profile',
    type: 'string',
  })
  @ApiBody({
    type: UpdateSellerProfileInputType,
    description: 'Seller profile update data',
  })
  @ApiResponse({
    status: 200,
    description: 'Seller profile updated successfully',
    type: UpdateSellerProfileResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user does not own this profile',
  })
  @ApiResponse({
    status: 404,
    description: 'Seller profile not found',
  })
  async updateSellerProfile(
    @Param('profileId') profileId: string,
    @Request() req: any,
    @Body() input: UpdateSellerProfileInputType,
  ): Promise<UpdateSellerProfileResponse> {
    const requestId = uuidv4();
    const userId = req.user.id;
    this.logger.log(
      `[SellerProfilesController] [ReqID: ${requestId}] - Updating seller profile: ${profileId}`,
    );

    try {
      if (!profileId || profileId.trim() === '') {
        throw new BadRequestException('Profile ID is required');
      }

      if (!input) {
        throw new BadRequestException('Update input is required');
      }

      if (input.slug && !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(input.slug)) {
        throw new BadRequestException(
          'Slug must contain only lowercase letters, numbers, and hyphens, and must start/end with a letter or number',
        );
      }

      const result = await this.commandBus.execute(
        new UpdateSellerProfileCommand(profileId, userId, input),
      );

      this.logger.log(
        `[SellerProfilesController] [ReqID: ${requestId}] - Seller profile updated successfully: ${profileId}`,
      );

      return {
        success: true,
        message: 'Seller profile updated successfully',
        sellerProfile: result.sellerProfile,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[SellerProfilesController] [ReqID: ${requestId}] - Unexpected error: update seller profile`,
        {
          profileId,
          userId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to update seller profile. Please try again later.',
      );
    }
  }

  @Delete(':profileId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete seller profile',
    description: 'Deletes an existing seller profile (soft delete by default)',
  })
  @ApiParam({
    name: 'profileId',
    description: 'The unique identifier of the seller profile',
    type: 'string',
  })
  @ApiQuery({
    name: 'hardDelete',
    required: false,
    description: 'Whether to permanently delete the profile',
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Seller profile deleted successfully',
    type: DeleteSellerProfileResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid profile ID',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user does not own this profile',
  })
  @ApiResponse({
    status: 404,
    description: 'Seller profile not found',
  })
  async deleteSellerProfile(
    @Param('profileId') profileId: string,
    @Request() req: any,
    @Query('hardDelete') hardDelete?: string,
  ): Promise<DeleteSellerProfileResponse> {
    const requestId = uuidv4();
    const userId = req.user.id;
    this.logger.log(
      `[SellerProfilesController] [ReqID: ${requestId}] - Deleting seller profile: ${profileId}`,
    );

    try {
      if (!profileId || profileId.trim() === '') {
        throw new BadRequestException('Profile ID is required');
      }

      const hardDeleteBool = hardDelete === 'true';

      const result = await this.commandBus.execute(
        new DeleteSellerProfileCommand(profileId, userId, hardDeleteBool),
      );

      this.logger.log(
        `[SellerProfilesController] [ReqID: ${requestId}] - Seller profile deleted successfully: ${profileId}`,
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[SellerProfilesController] [ReqID: ${requestId}] - Unexpected error: delete seller profile`,
        {
          profileId,
          userId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to delete seller profile. Please try again later.',
      );
    }
  }

  @Put(':profileId/verification')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update verification status (admin only)',
    description:
      'Updates the verification status of a seller profile. Restricted to admin users only.',
  })
  @ApiParam({
    name: 'profileId',
    description: 'The unique identifier of the seller profile',
    type: 'string',
  })
  @ApiBody({
    type: UpdateVerificationStatusInput,
    description: 'Verification status update data',
  })
  @ApiResponse({
    status: 200,
    description: 'Verification status updated successfully',
    type: UpdateSellerProfileResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Seller profile not found',
  })
  async updateVerificationStatus(
    @Param('profileId') profileId: string,
    @Request() req: any,
    @Body() input: UpdateVerificationStatusInput,
  ): Promise<UpdateSellerProfileResponse> {
    const requestId = uuidv4();
    const adminUserId = req.user.id;
    this.logger.log(
      `[SellerProfilesController] [ReqID: ${requestId}] - Updating verification status for profile: ${profileId}`,
    );

    try {
      if (!profileId || profileId.trim() === '') {
        throw new BadRequestException('Profile ID is required');
      }

      if (!input) {
        throw new BadRequestException('Verification status input is required');
      }

      if (input.isVerified === undefined || input.isVerified === null) {
        throw new BadRequestException('isVerified field is required');
      }

      const result = await this.commandBus.execute(
        new UpdateVerificationStatusCommand(profileId, adminUserId, input),
      );

      this.logger.log(
        `[SellerProfilesController] [ReqID: ${requestId}] - Verification status updated successfully: ${profileId}`,
      );

      return {
        success: true,
        message: 'Verification status updated successfully',
        sellerProfile: result.sellerProfile,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[SellerProfilesController] [ReqID: ${requestId}] - Unexpected error: update verification status`,
        {
          profileId,
          adminUserId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to update verification status. Please try again later.',
      );
    }
  }

  @Put(':profileId/visibility')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update profile visibility',
    description:
      'Updates the visibility settings (active/featured status) of a seller profile',
  })
  @ApiParam({
    name: 'profileId',
    description: 'The unique identifier of the seller profile',
    type: 'string',
  })
  @ApiBody({
    type: UpdateProfileVisibilityInput,
    description: 'Profile visibility update data',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile visibility updated successfully',
    type: UpdateSellerProfileResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user does not own this profile or is not admin',
  })
  @ApiResponse({
    status: 404,
    description: 'Seller profile not found',
  })
  async updateProfileVisibility(
    @Param('profileId') profileId: string,
    @Request() req: any,
    @Body() input: UpdateProfileVisibilityInput,
  ): Promise<UpdateSellerProfileResponse> {
    const requestId = uuidv4();
    const userId = req.user.id;
    const isAdmin = req.user.roles?.includes('ADMIN');
    this.logger.log(
      `[SellerProfilesController] [ReqID: ${requestId}] - Updating profile visibility for: ${profileId}`,
    );

    try {
      if (!profileId || profileId.trim() === '') {
        throw new BadRequestException('Profile ID is required');
      }

      if (!input) {
        throw new BadRequestException('Visibility input is required');
      }

      if (input.isActive === undefined || input.isActive === null) {
        throw new BadRequestException('isActive field is required');
      }

      const result = await this.commandBus.execute(
        new UpdateProfileVisibilityCommand(profileId, userId, input, isAdmin),
      );

      this.logger.log(
        `[SellerProfilesController] [ReqID: ${requestId}] - Profile visibility updated successfully: ${profileId}`,
      );

      return {
        success: true,
        message: 'Profile visibility updated successfully',
        sellerProfile: result.sellerProfile,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[SellerProfilesController] [ReqID: ${requestId}] - Unexpected error: update profile visibility`,
        {
          profileId,
          userId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to update profile visibility. Please try again later.',
      );
    }
  }

  @Put(':profileId/payment-onboarding')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update payment onboarding status (system/admin only)',
    description:
      'Updates the payment provider onboarding status. Used by payment webhooks or admin tools.',
  })
  @ApiParam({
    name: 'profileId',
    description: 'The unique identifier of the seller profile',
    type: 'string',
  })
  @ApiBody({
    type: UpdatePaymentOnboardingInput,
    description: 'Payment onboarding update data',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment onboarding status updated successfully',
    type: UpdateSellerProfileResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - system/admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Seller profile not found',
  })
  async updatePaymentOnboarding(
    @Param('profileId') profileId: string,
    @Body() input: UpdatePaymentOnboardingInput,
  ): Promise<UpdateSellerProfileResponse> {
    const requestId = uuidv4();
    this.logger.log(
      `[SellerProfilesController] [ReqID: ${requestId}] - Updating payment onboarding for profile: ${profileId}`,
    );

    try {
      if (!profileId || profileId.trim() === '') {
        throw new BadRequestException('Profile ID is required');
      }

      if (!input) {
        throw new BadRequestException('Payment onboarding input is required');
      }

      const result = await this.commandBus.execute(
        new UpdatePaymentOnboardingCommand(profileId, input),
      );

      this.logger.log(
        `[SellerProfilesController] [ReqID: ${requestId}] - Payment onboarding updated successfully: ${profileId}`,
      );

      return {
        success: true,
        message: 'Payment onboarding status updated successfully',
        sellerProfile: result.sellerProfile,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[SellerProfilesController] [ReqID: ${requestId}] - Unexpected error: update payment onboarding`,
        {
          profileId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to update payment onboarding status. Please try again later.',
      );
    }
  }
}
