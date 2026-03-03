import { ICommand } from '@nestjs/cqrs';
import { UpdateSellerProfileInput } from '../../domain';
import { SellerProfile } from '../../domain/entities/seller_profiles.entity';

/**
 * Result returned after successfully updating a seller profile
 */
export interface UpdateSellerProfileResult {
  sellerProfile: SellerProfile;
}

/**
 * Command to update an existing seller profile
 * Supports partial updates - only provided fields will be updated
 *
 * Business Rules:
 * - User must own the profile or be an admin
 * - If slug is changed, must remain unique
 * - Cannot change userId after creation
 */
export class UpdateSellerProfileCommand implements ICommand {
  constructor(
    public readonly profileId: string,
    public readonly userId: string,
    public readonly input: UpdateSellerProfileInput,
  ) {}
}
