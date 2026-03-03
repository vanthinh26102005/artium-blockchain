import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import {
  NotificationChannel,
  NotificationStatus,
  NotificationTriggerEvent,
  SortDirection,
} from '../../enums';
import {
  BaseOrderByInput,
  BaseQueryOptionsInput,
  BaseWhereInput,
  GraphQLJSONObject,
} from '../../graphql';

export class SendEmailInput {
  readonly recipientEmail: string;
  readonly userId?: string;
  readonly triggerEvent: NotificationTriggerEvent;

  /** Tên của template email (ví dụ: 'password-reset', 'welcome-email'). */
  readonly template: string;

  /** Dữ liệu động để render vào template. */
  readonly context: Record<string, any>;

  /** Tiêu đề của email (subject). */
  readonly title: string;

  /** Nội dung tóm tắt hoặc body (có thể dùng để lưu trữ). */
  readonly body: string;

  /** Metadata bổ sung (nếu có). */
  readonly metadata?: Record<string, any>;
}

@InputType()
export class CreateNotificationHistoryInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Field(() => NotificationChannel)
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @Field(() => NotificationTriggerEvent)
  @IsEnum(NotificationTriggerEvent)
  triggerEvent: NotificationTriggerEvent | string;

  @Field(() => NotificationStatus, { nullable: true })
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsString()
  body: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  templateContext?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  failureReason?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  sentAt?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  readAt?: Date;
}

/**
 * DTO cho việc cập nhật NotificationHistory.
 * - Tất cả trường đều optional.
 * - Dùng cho updateById / partial update.
 */
@InputType()
export class UpdateNotificationHistoryInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Field(() => NotificationChannel, { nullable: true })
  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @Field(() => NotificationTriggerEvent, { nullable: true })
  @IsOptional()
  @IsEnum(NotificationTriggerEvent)
  triggerEvent?: NotificationTriggerEvent | string;

  @Field(() => NotificationStatus, { nullable: true })
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  body?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  templateContext?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  failureReason?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  sentAt?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  readAt?: Date;
}

@InputType()
export class NotificationHistoryOrderByInput extends BaseOrderByInput {
  @Field(() => SortDirection, { nullable: true })
  sentAt?: SortDirection;
}

@InputType()
export class NotificationHistoryWhereInput extends BaseWhereInput {
  @Field({ nullable: true })
  userId?: string;

  @Field(() => NotificationChannel, { nullable: true })
  channel?: NotificationChannel;

  @Field(() => [NotificationChannel], {
    nullable: true,
    description: 'Lọc theo một trong các kênh',
  })
  channel_in?: NotificationChannel[];

  @Field(() => NotificationTriggerEvent, { nullable: true })
  triggerEvent?: NotificationTriggerEvent;

  @Field(() => NotificationStatus, { nullable: true })
  status?: NotificationStatus;

  @Field(() => [NotificationStatus], {
    nullable: true,
    description: 'Lọc theo một trong các trạng thái',
  })
  status_in?: NotificationStatus[];
}

@InputType()
export class ListNotificationHistoriesOptionsInput extends BaseQueryOptionsInput {
  @Field(() => NotificationHistoryWhereInput, {
    nullable: true,
    description: 'Các điều kiện lọc.',
  })
  where?: NotificationHistoryWhereInput;

  @Field(() => NotificationHistoryOrderByInput, {
    nullable: true,
    description: 'Thứ tự sắp xếp.',
  })
  orderBy?: NotificationHistoryOrderByInput;
}
