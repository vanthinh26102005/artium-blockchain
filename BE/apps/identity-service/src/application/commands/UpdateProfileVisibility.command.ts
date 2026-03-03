import { ICommand } from '@nestjs/cqrs';
import { UpdateProfileVisibilityInput } from '../../domain';
import { SellerProfile } from '../../domain/entities/seller_profiles.entity';

/**
 * Result returned after updating profile visibility
 */
export interface UpdateProfileVisibilityResult {
  sellerProfile: SellerProfile;
}

/**
 * Command to update seller profile visibility settings
 * Controls whether profile is active and/or featured
 *
 * Business Rules:
 * - Sellers can activate/deactivate their own profiles
 * - Only admins can mark profiles as featured
 * - Inactive profiles hide all artworks from search
 *
 * Use Cases:
 * - Seller temporarily pauses selling (isActive = false)
 * - Admin features top sellers on homepage (isFeatured = true)
 * - Seller reactivates profile after vacation
 */
export class UpdateProfileVisibilityCommand implements ICommand {
  constructor(
    public readonly profileId: string,
    public readonly userId: string,
    public readonly input: UpdateProfileVisibilityInput,
    public readonly isAdmin: boolean = false,
  ) {}
}
