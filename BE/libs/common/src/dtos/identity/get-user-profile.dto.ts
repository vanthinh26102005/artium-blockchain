import { ApiProperty } from '@nestjs/swagger';
import { UserPayload } from '../users';

export class GetUserProfileDto {
  @ApiProperty({
    description: 'User object from JWT token',
    example: {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
    },
  })
  user: UserPayload;
}
