import { registerEnumType } from '@nestjs/graphql';

/**
 * User role enumeration for platform access control
 * Used in: User.roles
 */
export enum UserRole {
  /** Platform administrator with full system access */
  ADMIN = 'admin',
  /** Seller who can list and sell artworks */
  SELLER = 'seller',
  /** Collector who can browse and purchase artworks */
  COLLECTOR = 'collector',
  /** Trusted neutral party who resolves auction disputes */
  ARBITER = 'arbiter',
}

registerEnumType(UserRole, {
  name: 'UserRole',
  description:
    'User roles defining access permissions (ADMIN, SELLER, COLLECTOR, ARBITER)',
});
