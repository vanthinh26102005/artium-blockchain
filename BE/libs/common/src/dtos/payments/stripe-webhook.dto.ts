import { ApiProperty } from '@nestjs/swagger';

export class StripeWebhookDto {
  @ApiProperty({
    description: 'Raw webhook body',
  })
  body: Buffer | string;

  @ApiProperty({
    description: 'Stripe signature header for webhook verification',
    example: 't=1614556800,v1=abc123...',
  })
  signature: string;
}
