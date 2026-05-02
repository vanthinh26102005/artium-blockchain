import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { RpcExceptionHelper, UserRole } from '@app/common';
import {
  CreateSellerProfileCommand,
  DeleteSellerProfileCommand,
  GetFeaturedSellerProfilesQuery,
  GetSellerProfileByIdQuery,
  GetSellerProfileByUserIdQuery,
  ListSellerProfilesQuery,
  UpdatePaymentOnboardingCommand,
  UpdateProfileVisibilityCommand,
  UpdateSellerProfileCommand,
  UpdateVerificationStatusCommand,
} from '../../application';
import {
  CreateSellerProfileInputType,
  CreateSellerProfileResponse,
  DeleteSellerProfileResponse,
  PaginatedSellerProfilesPayload,
  SellerProfilePayload,
  UpdatePaymentOnboardingInput,
  UpdateProfileVisibilityInput,
  UpdateSellerProfileInputType,
  UpdateSellerProfileResponse,
  UpdateVerificationStatusInput,
  UserPayload,
} from '../../domain';

@Controller()
export class SellerProfilesMicroserviceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern({ cmd: 'get_seller_profile_by_id' })
  async getSellerProfileById(
    @Payload() data: { profileId: string },
  ): Promise<SellerProfilePayload> {
    return this.queryBus.execute(new GetSellerProfileByIdQuery(data.profileId));
  }

  @MessagePattern({ cmd: 'get_seller_profile_by_user_id' })
  async getSellerProfileByUserId(
    @Payload() data: { userId: string },
  ): Promise<SellerProfilePayload> {
    return this.queryBus.execute(
      new GetSellerProfileByUserIdQuery(data.userId),
    );
  }

  @MessagePattern({ cmd: 'list_seller_profiles' })
  async listSellerProfiles(
    @Payload() data: any,
  ): Promise<PaginatedSellerProfilesPayload> {
    const {
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
    } = data;

    const skipNum = skip ? parseInt(skip, 10) : 0;
    const takeNum = take ? parseInt(take, 10) : 20;

    const filters = {
      profileType,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      isVerified: isVerified !== undefined ? isVerified === 'true' : undefined,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
      location,
      searchQuery,
    };

    return this.queryBus.execute(
      new ListSellerProfilesQuery(
        filters,
        skipNum,
        takeNum,
        sortBy || 'createdAt',
        sortOrder || 'DESC',
      ),
    );
  }

  @MessagePattern({ cmd: 'get_featured_seller_profiles' })
  async getFeaturedSellerProfiles(
    @Payload() data: { limit?: string },
  ): Promise<SellerProfilePayload[]> {
    const limitNum = data.limit ? parseInt(data.limit, 10) : 10;
    return this.queryBus.execute(new GetFeaturedSellerProfilesQuery(limitNum));
  }

  @MessagePattern({ cmd: 'create_seller_profile' })
  async createSellerProfile(
    @Payload() payload: CreateSellerProfileInputType & { user: UserPayload },
  ): Promise<CreateSellerProfileResponse> {
    const { user, ...input } = payload;
    const userId = user?.id;

    if (!userId) {
      throw RpcExceptionHelper.unauthorized('Authenticated user is required');
    }

    const result = await this.commandBus.execute(
      new CreateSellerProfileCommand({
        ...input,
        userId,
      }),
    );

    return {
      success: true,
      message: 'Seller profile created successfully',
      sellerProfile: result.sellerProfile,
    };
  }

  @MessagePattern({ cmd: 'update_seller_profile' })
  async updateSellerProfile(
    @Payload()
    payload: {
      profileId: string;
      input: UpdateSellerProfileInputType;
      user: UserPayload;
    },
  ): Promise<UpdateSellerProfileResponse> {
    const { profileId, input, user } = payload;
    const userId = user?.id;

    const result = await this.commandBus.execute(
      new UpdateSellerProfileCommand(profileId, userId, input),
    );

    return {
      success: true,
      message: 'Seller profile updated successfully',
      sellerProfile: result.sellerProfile,
    };
  }

  @MessagePattern({ cmd: 'delete_seller_profile' })
  async deleteSellerProfile(
    @Payload()
    payload: {
      profileId: string;
      hardDelete?: boolean | string;
      user: UserPayload;
    },
  ): Promise<DeleteSellerProfileResponse> {
    const { profileId, hardDelete, user } = payload;
    const userId = user?.id;
    const hardDeleteBool = hardDelete === 'true' || hardDelete === true;

    return this.commandBus.execute(
      new DeleteSellerProfileCommand(profileId, userId, hardDeleteBool),
    );
  }

  @MessagePattern({ cmd: 'update_verification_status' })
  async updateVerificationStatus(
    @Payload()
    payload: {
      profileId: string;
      input: UpdateVerificationStatusInput;
      user: UserPayload;
    },
  ): Promise<UpdateSellerProfileResponse> {
    const { profileId, input, user } = payload;
    const adminUserId = user?.id;

    const result = await this.commandBus.execute(
      new UpdateVerificationStatusCommand(profileId, adminUserId, input),
    );

    return {
      success: true,
      message: 'Verification status updated successfully',
      sellerProfile: result.sellerProfile,
    };
  }

  @MessagePattern({ cmd: 'update_profile_visibility' })
  async updateProfileVisibility(
    @Payload()
    payload: {
      profileId: string;
      input: UpdateProfileVisibilityInput;
      user: UserPayload;
    },
  ): Promise<UpdateSellerProfileResponse> {
    const { profileId, input, user } = payload;
    const userId = user?.id;
    const isAdmin = user?.roles?.includes(UserRole.ADMIN);

    const result = await this.commandBus.execute(
      new UpdateProfileVisibilityCommand(profileId, userId, input, isAdmin),
    );

    return {
      success: true,
      message: 'Profile visibility updated successfully',
      sellerProfile: result.sellerProfile,
    };
  }

  @MessagePattern({ cmd: 'update_payment_onboarding' })
  async updatePaymentOnboarding(
    @Payload()
    payload: {
      profileId: string;
      input: UpdatePaymentOnboardingInput;
    },
  ): Promise<UpdateSellerProfileResponse> {
    const { profileId, input } = payload;

    const result = await this.commandBus.execute(
      new UpdatePaymentOnboardingCommand(profileId, input),
    );

    return {
      success: true,
      message: 'Payment onboarding status updated successfully',
      sellerProfile: result.sellerProfile,
    };
  }
}
