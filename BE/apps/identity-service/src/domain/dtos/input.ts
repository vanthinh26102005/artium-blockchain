import { User } from '../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
  IsOptional,
} from 'class-validator';

export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserInput = Partial<
  Omit<User, 'id' | 'createdAt' | 'updatedAt'>
>;

export class UserRegisterInput {
  @ApiProperty({ example: 'Thinh' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'dg.pthinh@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 6, example: 'Thinh123$' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;
}

export class CompleteUserRegisterInput {
  @ApiProperty({ example: 'dg.pthinh@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'OTP 6 chữ số' })
  @IsString()
  @Length(6, 6, { message: 'OTP phải có 6 chữ số' })
  otp: string;
}

export class RequestPasswordResetInput {
  @ApiProperty({ example: 'dg.pthinh@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class VerifyPasswordResetInput {
  @ApiProperty({ example: 'dg.pthinh@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class ConfirmPasswordResetInput {
  @ApiProperty({ example: 'dg.pthinh@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'reset-token-abc123' })
  @IsString()
  @IsNotEmpty()
  resetToken: string;

  @ApiProperty({ minLength: 8, example: 'Thinh234%' })
  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  newPassword: string;

  @ApiProperty({ minLength: 8, example: 'Thinh234$' })
  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  confirmPassword: string;
}

export class GoogleLoginInput {
  @ApiProperty({ description: 'Google ID Token' })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}

export class EmailLoginInput {
  @ApiProperty({ example: 'dg.pthinh@gmail.com' })
  @IsString()
  email: string;

  @ApiProperty({ minLength: 6, example: 'Thinh123$' })
  @IsString()
  @MinLength(6)
  password: string;
}
export class BusinessAddressInput {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  line1: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  line2: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  postalCode: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country: string | null;
}
