import { RabbitMQExchangeConfig } from '@golevelup/nestjs-rabbitmq';

export const ExchangeName = {
  USER_EVENTS: 'user.events.exchange',
  NOTIFICATION_EVENTS: 'notification.events.exchange',
  PAYMENT_EVENTS: 'payment.events.exchange',
};

export const Exchanges: RabbitMQExchangeConfig[] = [
  {
    name: ExchangeName.USER_EVENTS,
    type: 'topic',
    options: { durable: true },
  },
  {
    name: ExchangeName.NOTIFICATION_EVENTS,
    type: 'x-delayed-message',
    options: {
      durable: true,
      arguments: { 'x-delayed-type': 'topic' },
    },
  },
  {
    name: ExchangeName.PAYMENT_EVENTS,
    type: 'topic',
    options: { durable: true },
  },
];
