import { ICommand } from '@nestjs/cqrs';
import { UpdatePaymentOnboardingInput } from '../../domain';
import { SellerProfile } from '../../domain/entities/seller_profiles.entity';

/**
 * Result returned after updating payment onboarding status
 */
export interface UpdatePaymentOnboardingResult {
  sellerProfile: SellerProfile;
}

/**
 * Command to update payment provider onboarding status
 * Used by payment integration webhooks or admin tools
 *
 * Business Rules:
 * - Only system/admin can update Stripe account IDs
 * - Triggered by Stripe/PayPal onboarding webhooks
 * - Sellers can start selling only after onboarding complete
 *
 * Use Cases:
 * - Stripe Connect onboarding webhook updates status
 * - PayPal onboarding completion callback
 * - Admin manually verifying payment setup
 */
export class UpdatePaymentOnboardingCommand implements ICommand {
  constructor(
    public readonly profileId: string,
    public readonly input: UpdatePaymentOnboardingInput,
  ) {}
}
