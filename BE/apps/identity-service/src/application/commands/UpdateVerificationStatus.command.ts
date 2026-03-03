import { ICommand } from '@nestjs/cqrs';
import { UpdateVerificationStatusInput } from '../../domain';
import { SellerProfile } from '../../domain/entities/seller_profiles.entity';

/**
 * Result returned after updating verification status
 */
export interface UpdateVerificationStatusResult {
  sellerProfile: SellerProfile;
}

/**
 * Command to update seller profile verification status
 * Restricted to admin users only
 *
 * Business Rules:
 * - Only platform admins can verify sellers
 * - Verified badge shown to increase buyer trust
 * - May require document verification before approval
 *
 * Use Cases:
 * - Admin verifies seller after reviewing documents
 * - Admin revokes verification due to policy violations
 * - Automated verification based on sales history
 */
export class UpdateVerificationStatusCommand implements ICommand {
  constructor(
    public readonly profileId: string,
    public readonly adminUserId: string,
    public readonly input: UpdateVerificationStatusInput,
  ) {}
}
