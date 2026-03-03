import { ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { UserPayload } from './user.payload';

@ObjectType()
export class LoginResponse {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ type: () => UserPayload })
  user: UserPayload;
}

@ObjectType()
export class RequestOtpResponse {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;
}

@ObjectType()
export class RequestPasswordResetResponse {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;
}

@ObjectType()
export class VerifyPasswordResetResponse {
  @ApiProperty({ description: 'Token tạm thời để xác nhận mật khẩu mới' })
  resetToken: string;

  @ApiProperty()
  success: boolean;
}
