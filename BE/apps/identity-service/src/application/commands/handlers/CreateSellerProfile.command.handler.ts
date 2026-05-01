import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import {
  CreateSellerProfileCommand,
  CreateSellerProfileResult,
} from '../CreateSellerProfile.command';
import { ISellerProfileRepository } from '../../../domain/interfaces/seller-profile.repository.interface';
import { IUserRepository } from '../../../domain';

/**
 * Command handler for creating a new seller profile
 *
 * Validation:
 * - User must exist and not already have a seller profile
 * - Required fields must be provided
 *
 * Side Effects:
 * - Creates new seller profile record
 * - May emit SellerProfileCreatedEvent for other services
 */
@CommandHandler(CreateSellerProfileCommand)
export class CreateSellerProfileHandler implements ICommandHandler<
  CreateSellerProfileCommand,
  CreateSellerProfileResult
> {
  private readonly logger = new Logger(CreateSellerProfileHandler.name);

  constructor(
    @Inject(ISellerProfileRepository)
    private readonly sellerProfileRepository: ISellerProfileRepository,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    command: CreateSellerProfileCommand,
  ): Promise<CreateSellerProfileResult> {
    try {
      const { input } = command;
      const { userId } = input;

      this.logger.debug(`Creating seller profile for userId: ${userId}`);

      // Validate user exists
      const user = await this.userRepository.findById(userId!);
      if (!user) {
        this.logger.warn(`User not found: ${userId}`);
        throw RpcExceptionHelper.notFound('User not found');
      }

      // Check if user already has a seller profile
      const existingProfile = await this.sellerProfileRepository.findByUserId(
        userId!,
      );
      if (existingProfile) {
        this.logger.warn(`User ${userId} already has a seller profile`);
        throw RpcExceptionHelper.conflict('User already has a seller profile');
      }

      // Create the seller profile
      const sellerProfile = await this.sellerProfileRepository.create({
        ...input,
        userId,
        // Set default values for fields not in input
        stripeAccountId: null,
        paypalMerchantId: null,
        stripeOnboardingComplete: false,
        paypalOnboardingComplete: false,
        isActive: true,
        isVerified: false,
        verifiedAt: null,
        isFeatured: false,
      });

      this.logger.log(
        `Seller profile created successfully: ${sellerProfile.id} for user: ${userId}`,
      );

      // TODO: Emit SellerProfileCreatedEvent for other services to consume
      // this.eventBus.publish(new SellerProfileCreatedEvent(sellerProfile));

      return { sellerProfile };
    } catch (error) {
      this.logger.error(
        `Failed to create seller profile: ${error.message}`,
        error.stack,
      );

      // Re-throw known errors
      if (error instanceof RpcException) {
        throw error;
      }

      // Log unexpected errors and throw generic message
      throw RpcExceptionHelper.badRequest('Failed to create seller profile');
    }
  }
}
