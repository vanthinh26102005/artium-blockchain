import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum NotificationStatusEnum {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  READ = 'READ',
}

export class GetNotificationsDto {
  @ApiProperty({
    description: 'Filter by user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'Filter by notification status',
    enum: NotificationStatusEnum,
    example: NotificationStatusEnum.SENT,
    required: false,
  })
  @IsOptional()
  @IsEnum(NotificationStatusEnum)
  status?: NotificationStatusEnum;

  @ApiProperty({
    description: 'Number of records to skip for pagination',
    example: 0,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  skip?: number;

  @ApiProperty({
    description: 'Maximum number of records to return',
    example: 20,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  take?: number;
}
