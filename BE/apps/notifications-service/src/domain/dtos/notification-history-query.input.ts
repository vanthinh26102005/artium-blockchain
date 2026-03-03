import { Field, InputType } from '@nestjs/graphql';
import {
  BaseOrderByInput,
  BaseQueryOptionsInput,
  BaseWhereInput,
  SortDirection,
} from '@app/common';
import {
  NotificationChannel,
  NotificationStatus,
  NotificationTriggerEvent,
} from '../enums/notification.enums';
import { IsEnum, IsOptional } from 'class-validator';

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
  @IsOptional()
  where?: NotificationHistoryWhereInput;

  @Field(() => NotificationHistoryOrderByInput, {
    nullable: true,
    description: 'Thứ tự sắp xếp.',
  })
  @IsOptional()
  orderBy?: NotificationHistoryOrderByInput;

  @Field(() => NotificationChannel)
  @IsEnum(NotificationChannel)
  @IsOptional()
  channel?: NotificationChannel;

  @Field(() => NotificationStatus, { nullable: true })
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;
}
