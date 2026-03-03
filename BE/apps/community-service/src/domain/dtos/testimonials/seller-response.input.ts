import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SellerResponseInput {
  @ApiProperty({
    description: 'Seller response to the testimonial',
    maxLength: 2000,
    example: 'Thank you for your kind review! We appreciate your business.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  response: string;
}
