import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import {
  UpdateProfileVisibilityCommand,
  UpdateProfileVisibilityResult,
} from '../UpdateProfileVisibility.command';
import { ISellerProfileRepository } from '../../../domain/interfaces/seller-profile.repository.interface';

/**
 * Command handler for updating profile visibility settings
 *
 * Use Cases:
 * - Seller temporarily pauses selling (isActive = false)
 * - Admin features top sellers on homepage (isFeatured = true)
 * - Seller reactivates profile after vacation
 *
 * Validation:
 * - Profile must exist
 * - Sellers can change isActive on their own profiles
 * - Only admins can change isFeatured flag
 *
 * Side Effects:
 * - Updates visibility settings
 * - If deactivated, hides all artworks from search
 * - May emit ProfileVisibilityChangedEvent
 */
@CommandHandler(UpdateProfileVisibilityCommand)
export class UpdateProfileVisibilityHandler implements ICommandHandler<
  UpdateProfileVisibilityCommand,
  UpdateProfileVisibilityResult
> {
  private readonly logger = new Logger(UpdateProfileVisibilityHandler.name);

  constructor(
    @Inject(ISellerProfileRepository)
    private readonly sellerProfileRepository: ISellerProfileRepository,
  ) {}

  async execute(
    command: UpdateProfileVisibilityCommand,
  ): Promise<UpdateProfileVisibilityResult> {
    try {
      const { profileId, userId, input, isAdmin } = command;

      this.logger.debug(
        `Updating profile visibility: ${profileId} by user: ${userId}, admin: ${isAdmin}`,
      );

      // Find the existing profile
      const existingProfile =
        await this.sellerProfileRepository.findById(profileId);
      if (!existingProfile) {
        this.logger.warn(`Seller profile not found: ${profileId}`);
        throw RpcExceptionHelper.notFound('Seller profile not found');
      }

      // Verify ownership for non-admin users
      if (!isAdmin && existingProfile.userId !== userId) {
        this.logger.warn(
          `User ${userId} attempted to update visibility for profile ${profileId} owned by ${existingProfile.userId}`,
        );
        throw RpcExceptionHelper.forbidden(
          'You do not have permission to update this profile',
        );
      }

      // Check if user is trying to change isFeatured without admin privileges
      if (input.isFeatured !== undefined && !isAdmin) {
        this.logger.warn(
          `Non-admin user ${userId} attempted to change featured status for profile ${profileId}`,
        );
        throw RpcExceptionHelper.forbidden(
          'Only administrators can change featured status',
        );
      }

      // Update visibility
      const updatedProfile =
        await this.sellerProfileRepository.updateVisibility(
          profileId,
          input.isActive,
          input.isFeatured,
        );

      if (!updatedProfile) {
        throw RpcExceptionHelper.notFound(
          'Failed to update profile visibility',
        );
      }

      this.logger.log(
        `Profile visibility updated for: ${profileId} - Active: ${input.isActive}, Featured: ${input.isFeatured ?? 'unchanged'}`,
      );

      // TODO: Emit ProfileVisibilityChangedEvent for other services
      // this.eventBus.publish(new ProfileVisibilityChangedEvent(updatedProfile));

      return { sellerProfile: updatedProfile };
    } catch (error) {
      this.logger.error(
        `Failed to update profile visibility: ${error.message}`,
        error.stack,
      );

      // Re-throw known errors
      if (error instanceof RpcException) {
        throw error;
      }

      // Log unexpected errors and throw generic message
      throw RpcExceptionHelper.badRequest(
        'Failed to update profile visibility',
      );
    }
  }
}
