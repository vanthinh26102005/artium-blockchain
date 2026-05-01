import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../enums/user-role.enum';

export class UserPayload {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique user identifier',
  })
  id: string;

  @ApiProperty({
    example: 'dg.pthinh@gmail.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({
    example: 'duong-phuong-thinh',
    required: false,
    description: 'Unique URL-friendly identifier for the user profile',
  })
  slug: string | null;

  @ApiProperty({
    example: 'Duong Phuong Thinh',
    required: false,
    description: 'Full name of the user',
  })
  fullName: string | null;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    required: false,
    description: 'URL to user avatar image',
  })
  avatarUrl: string | null;

  @ApiProperty({
    example: '112233445566778899',
    required: false,
    description: 'Google OAuth ID if user logged in with Google',
  })
  googleId: string | null;

  @ApiProperty({
    example: '0x1234567890abcdef1234567890abcdef12345678',
    required: false,
    description: 'Ethereum wallet address if user logged in with MetaMask',
  })
  walletAddress: string | null;

  @ApiProperty({
    example: true,
    description: 'Whether the user has verified their email',
  })
  isEmailVerified: boolean;

  @ApiProperty({
    enum: UserRole,
    isArray: true,
    example: ['USER'],
    description: 'User roles and permissions',
  })
  roles: UserRole[];

  @ApiProperty({
    example: 'cus_1234567890',
    required: false,
    description: 'Stripe customer ID for payments',
  })
  stripeCustomerId: string | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-01-09T07:00:00.000Z',
    required: false,
    description: 'Last login timestamp',
  })
  lastLogin: Date | null;

  @ApiProperty({
    example: true,
    description: 'Whether the user account is active',
  })
  isActive: boolean;
}
