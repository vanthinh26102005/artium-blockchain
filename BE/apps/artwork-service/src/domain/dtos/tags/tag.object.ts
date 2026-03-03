import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractEntity, TagStatus } from '@app/common';

export class TagObject extends AbstractEntity {
  @ApiProperty({
    example: 'tag-uuid-123',
    description: 'Unique identifier of the tag',
  })
  id!: string;

  @ApiProperty({
    example: 'Abstract',
    description: 'Tag name',
  })
  name!: string;

  @ApiProperty({
    enum: TagStatus,
    example: TagStatus.CUSTOM,
  })
  status!: TagStatus;

  @ApiPropertyOptional({
    example: 'seller-uuid-456',
    description: 'Seller ID associated with the tag (optional)',
  })
  sellerId?: string;
}
