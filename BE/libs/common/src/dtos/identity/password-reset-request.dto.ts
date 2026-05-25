import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class PasswordResetRequestDto {
  @ApiProperty({
    description: 'User email address to send password reset instructions',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'Captcha response token when the API requires verification',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  captchaToken?: string;
}
