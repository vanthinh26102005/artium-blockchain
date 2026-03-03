import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DetailedRatingsObject {
  @ApiPropertyOptional({ description: 'Accuracy rating' })
  accuracy?: number;

  @ApiPropertyOptional({ description: 'Communication rating' })
  communication?: number;

  @ApiPropertyOptional({ description: 'Shipping rating' })
  shipping?: number;

  @ApiPropertyOptional({ description: 'Value rating' })
  value?: number;
}

export class TestimonialObject {
  @ApiProperty({
    description: 'Unique identifier of the testimonial',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Buyer user ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  buyerId: string;

  @ApiProperty({
    description: 'Seller user ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  sellerId: string;

  @ApiProperty({
    description: 'Artwork ID',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  artworkId: string;

  @ApiPropertyOptional({
    description: 'Order ID',
  })
  orderId?: string | null;

  @ApiProperty({
    description: 'Overall rating (1-5)',
    example: 5,
  })
  rating: number;

  @ApiProperty({
    description: 'Review comment',
  })
  comment: string;

  @ApiPropertyOptional({
    description: 'Cached buyer name',
  })
  buyerName?: string | null;

  @ApiPropertyOptional({
    description: 'Cached artwork title',
  })
  artworkTitle?: string | null;

  @ApiProperty({
    description: 'Whether testimonial is approved',
    example: true,
  })
  isApproved: boolean;

  @ApiProperty({
    description: 'Whether testimonial is visible',
    example: true,
  })
  isVisible: boolean;

  @ApiPropertyOptional({
    description: 'When the testimonial was approved',
  })
  approvedAt?: Date | null;

  @ApiPropertyOptional({
    description: 'User ID who approved',
  })
  approvedBy?: string | null;

  @ApiProperty({
    description: 'Whether this is a verified purchase',
    example: true,
  })
  isVerifiedPurchase: boolean;

  @ApiPropertyOptional({
    description: 'URLs to review images',
    type: [String],
  })
  reviewImages?: string[] | null;

  @ApiPropertyOptional({
    description: 'Detailed ratings breakdown',
    type: DetailedRatingsObject,
  })
  detailedRatings?: DetailedRatingsObject | null;

  @ApiProperty({
    description: 'Whether testimonial is flagged',
    example: false,
  })
  isFlagged: boolean;

  @ApiPropertyOptional({
    description: 'Reason for flagging',
  })
  flagReason?: string | null;

  @ApiPropertyOptional({
    description: 'Seller response to the testimonial',
  })
  sellerResponse?: string | null;

  @ApiPropertyOptional({
    description: 'When the seller responded',
  })
  sellerRespondedAt?: Date | null;

  @ApiProperty({
    description: 'Number of users who found this helpful',
    example: 10,
  })
  helpfulCount: number;

  @ApiProperty({
    description: 'Number of users who found this not helpful',
    example: 1,
  })
  notHelpfulCount: number;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Last update timestamp',
  })
  updatedAt?: Date | null;
}
