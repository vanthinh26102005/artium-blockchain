import { ICommand } from '@nestjs/cqrs';
import { CreateSellerProfileInput } from '../../domain';
import { SellerProfile } from '../../domain/entities/seller_profiles.entity';

/**
 * Result returned after successfully creating a seller profile
 */
export interface CreateSellerProfileResult {
  sellerProfile: SellerProfile;
}

/**
 * Command to create a new seller profile for a user
 * This allows users to become sellers on the platform
 *
 * Business Rules:
 * - User must not already have a seller profile
 * - Slug must be unique across all sellers
 * - User must have appropriate role/permissions
 */
export class CreateSellerProfileCommand implements ICommand {
  constructor(public readonly input: CreateSellerProfileInput) {}
}
