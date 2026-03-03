import { AbstractEntity } from '@app/common/entities/abstract.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ArtworkFolderObject extends AbstractEntity {
  @ApiProperty({
    example: '9b3c8f42-1a2e-4d91-9c4e-0bfa8a9a1234',
    description: 'Unique folder ID',
  })
  id!: string;

  @ApiProperty({
    example: 'seller-uuid-123',
    description: 'ID of the seller who owns this folder',
  })
  sellerId!: string;

  @ApiProperty({
    example: 'My Portfolio',
    description: 'Folder name',
  })
  name!: string;

  @ApiProperty({
    example: 0,
    description: 'Display position/order of folder',
  })
  position!: number;

  @ApiProperty({
    example: false,
    description: 'Whether folder is hidden from display',
  })
  isHidden!: boolean;

  @ApiProperty({
    example: 'parent-folder-id',
    nullable: true,
    description: 'Parent folder ID (null if root folder)',
  })
  parentId?: string;

  @ApiProperty({
    type: () => [ArtworkFolderObject],
    required: false,
    description: 'Child folders (recursive)',
  })
  children?: ArtworkFolderObject[];
}
