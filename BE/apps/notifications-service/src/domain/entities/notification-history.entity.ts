import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { AbstractEntity, GraphQLJSONObject } from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import {
  NotificationChannel,
  NotificationStatus,
  NotificationTriggerEvent,
} from '../enums/notification.enums';

registerEnumType(NotificationChannel, { name: 'NotificationChannel' });
registerEnumType(NotificationTriggerEvent, {
  name: 'NotificationTriggerEvent',
});
registerEnumType(NotificationStatus, { name: 'NotificationStatus' });

@ObjectType('NotificationHistory')
@Entity('notification_history')
@Index(['userId', 'createdAt'])
@Index(['triggerEvent', 'status'])
export class NotificationHistory extends AbstractEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ nullable: true })
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @Field(() => NotificationChannel)
  @Column({ type: 'enum', enum: NotificationChannel })
  channel: NotificationChannel;

  @Field(() => NotificationTriggerEvent)
  @Column({ type: 'varchar', name: 'trigger_event' })
  triggerEvent: NotificationTriggerEvent;

  @Field(() => NotificationStatus)
  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  @Index()
  status: NotificationStatus;

  @Field({ description: 'Notification title' })
  @Column()
  title: string;

  @Field({ description: 'Notification body content' })
  @Column({ type: 'text' })
  body: string;

  @Field(() => GraphQLJSONObject, {
    nullable: true,
    description: 'Template context data',
  })
  @Column({ type: 'jsonb', nullable: true, name: 'template_context' })
  templateContext: Record<string, any>;

  @Field(() => GraphQLJSONObject, {
    nullable: true,
    description: 'Additional metadata',
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Field({ nullable: true, description: 'Failure reason' })
  @Column({ type: 'text', nullable: true, name: 'failure_reason' })
  failureReason?: string;

  @Field({ nullable: true, description: 'When notification was sent' })
  @Column({ type: 'timestamptz', name: 'sent_at', nullable: true })
  sentAt?: Date;

  @Field({ nullable: true, description: 'When user read notification' })
  @Column({ type: 'timestamptz', name: 'read_at', nullable: true })
  readAt?: Date;
}
