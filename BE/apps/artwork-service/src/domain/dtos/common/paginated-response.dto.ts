import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({
    description: 'Total number of items',
    example: 150,
  })
  total!: number;

  @ApiProperty({
    description: 'Number of items to skip',
    example: 0,
  })
  skip!: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  take!: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 8,
  })
  totalPages!: number;

  @ApiProperty({
    description: 'Current page number (1-indexed)',
    example: 1,
  })
  currentPage!: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNext!: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPrev!: boolean;
}

export class PaginatedResponse<T> {
  @ApiProperty({
    description: 'Array of items',
    isArray: true,
  })
  data!: T[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMeta,
  })
  pagination!: PaginationMeta;

  static create<T>(
    data: T[],
    total: number,
    skip: number,
    take: number,
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / take);
    const currentPage = Math.floor(skip / take) + 1;

    return {
      data,
      pagination: {
        total,
        skip,
        take,
        totalPages,
        currentPage,
        hasNext: skip + take < total,
        hasPrev: skip > 0,
      },
    };
  }
}
