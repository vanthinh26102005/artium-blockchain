import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import {
  UpdateSellerProfileCommand,
  UpdateSellerProfileResult,
} from '../UpdateSellerProfile.command';
import { ISellerProfileRepository } from '../../../domain/interfaces/seller-profile.repository.interface';

/**
 * Command handler for updating an existing seller profile
 *
 * Validation:
 * - Profile must exist
 * - User must own the profile (unless admin)
 * - If slug is being changed, new slug must be unique
 *
 * Side Effects:
 * - Updates seller profile record
 * - May emit SellerProfileUpdatedEvent for other services
 */
@CommandHandler(UpdateSellerProfileCommand)
export class UpdateSellerProfileHandler implements ICommandHandler<
  UpdateSellerProfileCommand,
  UpdateSellerProfileResult
> {
  private readonly logger = new Logger(UpdateSellerProfileHandler.name);

  constructor(
    @Inject(ISellerProfileRepository)
    private readonly sellerProfileRepository: ISellerProfileRepository,
  ) {}

  async execute(
    command: UpdateSellerProfileCommand,
  ): Promise<UpdateSellerProfileResult> {
    try {
      const { profileId, userId, input } = command;

      this.logger.debug(
        `Updating seller profile: ${profileId} by user: ${userId}`,
      );

      // Find the existing profile
      const existingProfile =
        await this.sellerProfileRepository.findById(profileId);
      if (!existingProfile) {
        this.logger.warn(`Seller profile not found: ${profileId}`);
        throw RpcExceptionHelper.notFound('Seller profile not found');
      }

      // Verify ownership (user must own the profile)
      if (existingProfile.userId !== userId) {
        this.logger.warn(
          `User ${userId} attempted to update profile ${profileId} owned by ${existingProfile.userId}`,
        );
        throw RpcExceptionHelper.forbidden(
          'You do not have permission to update this profile',
        );
      }

      // If slug is being changed, check uniqueness
      if (input.slug && input.slug !== existingProfile.slug) {
        const slugTaken = await this.sellerProfileRepository.isSlugTaken(
          input.slug,
          profileId,
        );
        if (slugTaken) {
          this.logger.warn(`Slug already taken: ${input.slug}`);
          throw RpcExceptionHelper.conflict(
            'Slug is already taken. Please choose a different one.',
          );
        }
      }

      // Update the profile
      const updatedProfile = await this.sellerProfileRepository.update(
        profileId,
        input,
      );

      if (!updatedProfile) {
        throw RpcExceptionHelper.notFound('Failed to update seller profile');
      }

      this.logger.log(`Seller profile updated successfully: ${profileId}`);

      // TODO: Emit SellerProfileUpdatedEvent for other services to consume
      // this.eventBus.publish(new SellerProfileUpdatedEvent(updatedProfile));

      return { sellerProfile: updatedProfile };
    } catch (error) {
      this.logger.error(
        `Failed to update seller profile: ${error.message}`,
        error.stack,
      );

      // Re-throw known errors
      if (error instanceof RpcException) {
        throw error;
      }

      // Log unexpected errors and throw generic message
      throw RpcExceptionHelper.badRequest('Failed to update seller profile');
    }
  }
}
