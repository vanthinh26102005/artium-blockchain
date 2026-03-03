import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginGoogleDto {
  @ApiProperty({
    description: 'Google ID token obtained from OAuth',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE4MmU0...',
  })
  @IsString()
  @IsNotEmpty({ message: 'Google ID token is required' })
  idToken: string;
}
