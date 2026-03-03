import { ICommand } from '@nestjs/cqrs';

/**
 * Result returned after successfully deleting a seller profile
 */
export interface DeleteSellerProfileResult {
  success: boolean;
  message: string;
}

/**
 * Command to delete (soft delete or hard delete) a seller profile
 *
 * Business Rules:
 * - User must own the profile or be an admin
 * - May prevent deletion if seller has active orders/listings
 * - Cascade deletes related SellerWebsite entries
 *
 * Implementation Notes:
 * - Consider soft delete (isActive = false) vs hard delete
 * - Check for dependencies (artworks, orders) before deletion
 */
export class DeleteSellerProfileCommand implements ICommand {
  constructor(
    public readonly profileId: string,
    public readonly userId: string,
    public readonly hardDelete: boolean = false,
  ) {}
}
