// notification-history.object.ts
import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  NotificationChannel,
  NotificationStatus,
  NotificationTriggerEvent,
} from '../../enums';
import { GraphQLJSONObject } from '../../graphql';

@ObjectType('NotificationHistoryObject')
export class NotificationHistoryObject {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field(() => NotificationChannel)
  channel: NotificationChannel;

  @Field(() => NotificationTriggerEvent)
  triggerEvent: NotificationTriggerEvent;

  @Field(() => NotificationStatus)
  status: NotificationStatus;

  @Field({ description: 'Tiêu đề của thông báo (ví dụ: subject của email)' })
  title: string;

  @Field({
    description: 'Nội dung chính của thông báo (ví dụ: body của email)',
  })
  body: string;

  @Field(() => GraphQLJSONObject, {
    nullable: true,
    description: 'Dữ liệu ngữ cảnh được dùng để render template',
  })
  templateContext?: Record<string, any>;

  @Field(() => GraphQLJSONObject, {
    nullable: true,
    description:
      'Metadata bổ sung, ví dụ: ID từ service bên ngoài (SendGrid ID, Twilio SID)',
  })
  metadata?: Record<string, any>;

  @Field({ nullable: true, description: 'Lý do thất bại nếu có' })
  failureReason?: string;

  @Field({
    nullable: true,
    description: 'Thời điểm thông báo được gửi đi thành công',
  })
  sentAt?: Date;

  @Field({ nullable: true, description: 'Thời điểm người dùng đọc thông báo' })
  readAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
