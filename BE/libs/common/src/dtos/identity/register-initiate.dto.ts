import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterInitiateDto {
  @ApiProperty({ example: 'Thinh' })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'User password (min: 8 characters, max: 128 characters)',
    example: 'SecurePass123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must be less than 128 characters long' })
  password: string;

  @ApiProperty({
    description: 'Captcha response token when the API requires verification',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  captchaToken?: string;
}
