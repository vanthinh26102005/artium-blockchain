import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import {
  UpdateVerificationStatusCommand,
  UpdateVerificationStatusResult,
} from '../UpdateVerificationStatus.command';
import { ISellerProfileRepository } from '../../../domain/interfaces/seller-profile.repository.interface';

/**
 * Command handler for updating seller profile verification status
 *
 * Use Cases:
 * - Admin verifies seller after reviewing documents
 * - Admin revokes verification due to policy violations
 * - Automated verification based on sales history
 *
 * Validation:
 * - Profile must exist
 * - Only admins can perform this operation (enforced in controller/resolver)
 *
 * Side Effects:
 * - Updates verification status and timestamp
 * - May emit SellerVerifiedEvent for other services
 */
@CommandHandler(UpdateVerificationStatusCommand)
export class UpdateVerificationStatusHandler implements ICommandHandler<
  UpdateVerificationStatusCommand,
  UpdateVerificationStatusResult
> {
  private readonly logger = new Logger(UpdateVerificationStatusHandler.name);

  constructor(
    @Inject(ISellerProfileRepository)
    private readonly sellerProfileRepository: ISellerProfileRepository,
  ) {}

  async execute(
    command: UpdateVerificationStatusCommand,
  ): Promise<UpdateVerificationStatusResult> {
    try {
      const { profileId, adminUserId, input } = command;

      this.logger.debug(
        `Updating verification status for profile: ${profileId} by admin: ${adminUserId}`,
      );

      // Find the existing profile
      const existingProfile =
        await this.sellerProfileRepository.findById(profileId);
      if (!existingProfile) {
        this.logger.warn(`Seller profile not found: ${profileId}`);
        throw RpcExceptionHelper.notFound('Seller profile not found');
      }

      // Update verification status
      const updatedProfile =
        await this.sellerProfileRepository.updateVerificationStatus(
          profileId,
          input.isVerified,
          adminUserId,
        );

      if (!updatedProfile) {
        throw RpcExceptionHelper.notFound(
          'Failed to update verification status',
        );
      }

      this.logger.log(
        `Verification status updated for profile: ${profileId} - Verified: ${input.isVerified}`,
      );

      // TODO: Emit SellerVerifiedEvent for other services to consume
      // if (input.isVerified) {
      //   this.eventBus.publish(new SellerVerifiedEvent(updatedProfile));
      // } else {
      //   this.eventBus.publish(new SellerUnverifiedEvent(updatedProfile));
      // }

      return { sellerProfile: updatedProfile };
    } catch (error) {
      this.logger.error(
        `Failed to update verification status: ${error.message}`,
        error.stack,
      );

      if (error instanceof RpcException) {
        throw error;
      }

      throw RpcExceptionHelper.badRequest(
        'Failed to update verification status',
      );
    }
  }
}
