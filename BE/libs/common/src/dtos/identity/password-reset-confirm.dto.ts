import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class PasswordResetConfirmDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'Password reset token received via email',
    example: 'abc123def456ghi789',
    minLength: 10,
  })
  @IsString()
  @IsNotEmpty({ message: 'Reset token is required' })
  @MinLength(10, { message: 'Invalid reset token format' })
  resetToken: string;

  @ApiProperty({
    description: 'New password (min: 8 characters, max: 128 characters)',
    example: 'NewSecurePass123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @MaxLength(128, {
    message: 'New password must be less than 128 characters long',
  })
  newPassword: string;

  @ApiProperty({
    description: 'Password confirmation (must match new password)',
    example: 'NewSecurePass123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password confirmation is required' })
  @MinLength(8, {
    message: 'Confirmation password must be at least 8 characters long',
  })
  @MaxLength(128, {
    message: 'Confirmation password must be less than 128 characters long',
  })
  confirmPassword: string;
}
