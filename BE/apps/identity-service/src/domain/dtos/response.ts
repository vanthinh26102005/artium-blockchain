import { ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { UserPayload } from './payload';

@ObjectType()
export class LoginResponse {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token for authentication',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token for renewing access token',
  })
  refreshToken: string;

  @ApiProperty({
    type: () => UserPayload,
    description: 'User profile information',
  })
  user: UserPayload;
}

@ObjectType()
export class RequestOtpResponse {
  @ApiProperty({
    example: true,
    description: 'Whether the OTP was sent successfully',
  })
  success: boolean;

  @ApiProperty({
    example: 'OTP đã được gửi đến email của bạn',
    description: 'Response message',
  })
  message: string;
}

@ObjectType()
export class RequestPasswordResetResponse {
  @ApiProperty({
    example: true,
    description: 'Whether the password reset request was successful',
  })
  success: boolean;

  @ApiProperty({
    example: 'Email đặt lại mật khẩu đã được gửi',
    description: 'Response message',
  })
  message: string;
}

@ObjectType()
export class VerifyPasswordResetResponse {
  @ApiProperty({
    example: 'reset-token-abc123xyz',
    description: 'Temporary token to confirm new password',
  })
  resetToken: string;

  @ApiProperty({
    example: true,
    description: 'Whether the OTP verification was successful',
  })
  success: boolean;
}
