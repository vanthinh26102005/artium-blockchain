import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import {
  UpdatePaymentOnboardingCommand,
  UpdatePaymentOnboardingResult,
} from '../UpdatePaymentOnboarding.command';
import { ISellerProfileRepository } from '../../../domain/interfaces/seller-profile.repository.interface';

/**
 * Command handler for updating payment provider onboarding status
 *
 * Use Cases:
 * - Stripe Connect onboarding webhook updates status
 * - PayPal onboarding completion callback
 * - Admin manually verifying payment setup
 *
 * Validation:
 * - Profile must exist
 * - This is typically called by system/admin, not regular users
 *
 * Side Effects:
 * - Updates payment provider account IDs and onboarding status
 * - May emit PaymentOnboardingCompletedEvent for other services
 */
@CommandHandler(UpdatePaymentOnboardingCommand)
export class UpdatePaymentOnboardingHandler implements ICommandHandler<
  UpdatePaymentOnboardingCommand,
  UpdatePaymentOnboardingResult
> {
  private readonly logger = new Logger(UpdatePaymentOnboardingHandler.name);

  constructor(
    @Inject(ISellerProfileRepository)
    private readonly sellerProfileRepository: ISellerProfileRepository,
  ) {}

  async execute(
    command: UpdatePaymentOnboardingCommand,
  ): Promise<UpdatePaymentOnboardingResult> {
    try {
      const { profileId, input } = command;

      this.logger.debug(
        `Updating payment onboarding for profile: ${profileId}`,
      );

      const existingProfile =
        await this.sellerProfileRepository.findById(profileId);
      if (!existingProfile) {
        this.logger.warn(`Seller profile not found: ${profileId}`);
        throw RpcExceptionHelper.notFound('Seller profile not found');
      }

      // Update Stripe onboarding if provided
      if (
        input.stripeAccountId !== undefined ||
        input.stripeOnboardingComplete !== undefined
      ) {
        await this.sellerProfileRepository.updatePaymentOnboarding(
          profileId,
          'stripe',
          input.stripeAccountId,
          input.stripeOnboardingComplete,
        );
        this.logger.log(`Stripe onboarding updated for profile: ${profileId}`);
      }

      // Update PayPal onboarding if provided
      if (
        input.paypalMerchantId !== undefined ||
        input.paypalOnboardingComplete !== undefined
      ) {
        await this.sellerProfileRepository.updatePaymentOnboarding(
          profileId,
          'paypal',
          input.paypalMerchantId,
          input.paypalOnboardingComplete,
        );
        this.logger.log(`PayPal onboarding updated for profile: ${profileId}`);
      }

      const updatedProfile =
        await this.sellerProfileRepository.findById(profileId);

      if (!updatedProfile) {
        throw RpcExceptionHelper.notFound(
          'Failed to retrieve updated seller profile',
        );
      }

      // TODO: Emit PaymentOnboardingCompletedEvent if onboarding is now complete
      // if (updatedProfile.stripeOnboardingComplete || updatedProfile.paypalOnboardingComplete) {
      //   this.eventBus.publish(new PaymentOnboardingCompletedEvent(updatedProfile));
      // }

      return { sellerProfile: updatedProfile };
    } catch (error) {
      this.logger.error(
        `Failed to update payment onboarding: ${error.message}`,
        error.stack,
      );

      if (error instanceof RpcException) {
        throw error;
      }

      throw RpcExceptionHelper.badRequest(
        'Failed to update payment onboarding',
      );
    }
  }
}
