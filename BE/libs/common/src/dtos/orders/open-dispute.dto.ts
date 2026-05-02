import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class OpenDisputeDto {
  @ApiProperty({
    description: 'Reason for opening the dispute',
    example: 'Artwork arrived damaged — scratches on the frame',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty({ message: 'Dispute reason is required' })
  @MaxLength(2000, {
    message: 'Dispute reason must not exceed 2000 characters',
  })
  reason: string;
}
