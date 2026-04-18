import { RabbitMQExchangeConfig } from '@golevelup/nestjs-rabbitmq';

export const DeadLetterExchangeName = {
  USER_EVENTS_DLX: 'user.events.dlx',
  NOTIFICATION_EVENTS_DLX: 'notification.events.dlx',
  BLOCKCHAIN_EVENTS_DLX: 'blockchain.events.dlx',
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
  {
    name: DeadLetterExchangeName.BLOCKCHAIN_EVENTS_DLX,
    type: 'direct',
    options: { durable: true },
  },
];
