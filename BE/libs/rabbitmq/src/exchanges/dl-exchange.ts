import { RabbitMQExchangeConfig } from '@golevelup/nestjs-rabbitmq';

export const DeadLetterExchangeName = {
  USER_EVENTS_DLX: 'user.events.dlx',
  NOTIFICATION_EVENTS_DLX: 'notification.events.dlx',
};

export const DeadLetterExchanges: RabbitMQExchangeConfig[] = [
  {
    name: DeadLetterExchangeName.USER_EVENTS_DLX,
    type: 'direct',
    options: { durable: true },
  },
  {
    name: DeadLetterExchangeName.NOTIFICATION_EVENTS_DLX,
    type: 'direct',
    options: { durable: true },
  },
];
