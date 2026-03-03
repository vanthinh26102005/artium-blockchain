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
  Request,
  UseGuards,
} from '@nestjs/common';
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

import {
  CreateSellerProfileInputType,
  CreateSellerProfileResponse,
  DeleteSellerProfileResponse,
  PaginatedSellerProfilesPayload,
  ProfileType,
  SellerProfilePayload,
  UpdatePaymentOnboardingInput,
  UpdateProfileVisibilityInput,
  UpdateSellerProfileInputType,
  UpdateSellerProfileResponse,
  UpdateVerificationStatusInput,
  UserRole,
} from '@app/common';
import { JwtAuthGuard, Roles, RolesGuard } from '@app/auth';
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICES } from 'apps/api-gateway/src/config';
import { sendRpc } from '../../utils';

@ApiTags('Seller-profiles')
@Controller('identity/seller-profiles')
export class SellerProfilesController {
  constructor(
    @Inject(MICROSERVICES.IDENTITY_SERVICE)
    private readonly identityClient: ClientProxy,
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
    return sendRpc<SellerProfilePayload>(
      this.identityClient,
      { cmd: 'get_seller_profile_by_id' },
      { profileId },
    );
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
    return sendRpc<SellerProfilePayload>(
      this.identityClient,
      { cmd: 'get_seller_profile_by_user_id' },
      { userId },
    );
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
    return sendRpc<SellerProfilePayload>(
      this.identityClient,
      { cmd: 'get_seller_profile_by_slug' },
      { slug },
    );
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
    return sendRpc<PaginatedSellerProfilesPayload>(
      this.identityClient,
      { cmd: 'list_seller_profiles' },
      {
        profileType,
        isActive,
        isVerified,
        isFeatured,
        location,
        searchQuery,
        skip,
        take,
        sortBy,
        sortOrder,
      },
    );
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
    return sendRpc<SellerProfilePayload[]>(
      this.identityClient,
      { cmd: 'get_featured_seller_profiles' },
      { limit },
    );
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
    return sendRpc<CreateSellerProfileResponse>(
      this.identityClient,
      { cmd: 'create_seller_profile' },
      { ...input, user: req.user },
    );
  }

  @Put(':profileId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
    return sendRpc<UpdateSellerProfileResponse>(
      this.identityClient,
      { cmd: 'update_seller_profile' },
      { profileId, input, user: req.user },
    );
  }

  @Delete(':profileId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
    return sendRpc<DeleteSellerProfileResponse>(
      this.identityClient,
      { cmd: 'delete_seller_profile' },
      { profileId, hardDelete, user: req.user },
    );
  }

  @Put(':profileId/verification')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
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
    return sendRpc<UpdateSellerProfileResponse>(
      this.identityClient,
      { cmd: 'update_verification_status' },
      { profileId, input, user: req.user },
    );
  }

  @Put(':profileId/visibility')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
    return sendRpc<UpdateSellerProfileResponse>(
      this.identityClient,
      { cmd: 'update_profile_visibility' },
      { profileId, input, user: req.user },
    );
  }

  @Put(':profileId/payment-onboarding')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
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
    @Request() req: any,
    @Body() input: UpdatePaymentOnboardingInput,
  ): Promise<UpdateSellerProfileResponse> {
    return sendRpc<UpdateSellerProfileResponse>(
      this.identityClient,
      { cmd: 'update_payment_onboarding' },
      { profileId, input, user: req.user },
    );
  }
}
