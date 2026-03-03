import { ApiProperty } from '@nestjs/swagger';

export class BusinessAddress {
  @ApiProperty({
    example: '123 Main Street',
    required: false,
    description: 'Address line 1',
  })
  line1: string | null;

  @ApiProperty({
    example: 'Suite 456',
    required: false,
    description: 'Address line 2',
  })
  line2: string | null;

  @ApiProperty({
    example: 'Ho Chi Minh City',
    required: false,
    description: 'City name',
  })
  city: string | null;

  @ApiProperty({
    example: 'Ho Chi Minh',
    required: false,
    description: 'State or province',
  })
  state: string | null;

  @ApiProperty({
    example: '700000',
    required: false,
    description: 'Postal or ZIP code',
  })
  postalCode: string | null;

  @ApiProperty({
    example: 'Vietnam',
    required: false,
    description: 'Country name',
  })
  country: string | null;
}
