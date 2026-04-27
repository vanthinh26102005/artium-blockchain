import { Transport, TcpClientOptions } from '@nestjs/microservices';

export const MICROSERVICES = {
  IDENTITY_SERVICE: 'IDENTITY_SERVICE',
  ARTWORK_SERVICE: 'ARTWORK_SERVICE',
  PAYMENTS_SERVICE: 'PAYMENTS_SERVICE',
  ORDERS_SERVICE: 'ORDERS_SERVICE',
  MESSAGING_SERVICE: 'MESSAGING_SERVICE',
  NOTIFICATIONS_SERVICE: 'NOTIFICATIONS_SERVICE',
  COMMUNITY_SERVICE: 'COMMUNITY_SERVICE',
  CRM_SERVICE: 'CRM_SERVICE',
  EVENTS_SERVICE: 'EVENTS_SERVICE',
};

export const getMicroserviceConfig = (service: string): TcpClientOptions => {
  const configs: Record<string, TcpClientOptions> = {
    [MICROSERVICES.IDENTITY_SERVICE]: {
      transport: Transport.TCP,
      options: {
        host: process.env.IDENTITY_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.IDENTITY_SERVICE_PORT || '3101', 10),
      },
    },
    [MICROSERVICES.ARTWORK_SERVICE]: {
      transport: Transport.TCP,
      options: {
        host: process.env.ARTWORK_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.ARTWORK_SERVICE_PORT || '3102', 10),
      },
    },
    [MICROSERVICES.PAYMENTS_SERVICE]: {
      transport: Transport.TCP,
      options: {
        host: process.env.PAYMENTS_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.PAYMENTS_SERVICE_PORT || '3103', 10),
      },
    },
    [MICROSERVICES.ORDERS_SERVICE]: {
      transport: Transport.TCP,
      options: {
        host: process.env.ORDERS_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.ORDERS_SERVICE_PORT || '3104', 10),
      },
    },
    [MICROSERVICES.MESSAGING_SERVICE]: {
      transport: Transport.TCP,
      options: {
        host: process.env.MESSAGING_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.MESSAGING_SERVICE_PORT || '3105', 10),
      },
    },
    [MICROSERVICES.NOTIFICATIONS_SERVICE]: {
      transport: Transport.TCP,
      options: {
        host: process.env.NOTIFICATIONS_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.NOTIFICATIONS_SERVICE_PORT || '3106', 10),
      },
    },
    [MICROSERVICES.EVENTS_SERVICE]: {
      transport: Transport.TCP,
      options: {
        host: process.env.EVENTS_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.EVENTS_SERVICE_PORT || '3107', 10),
      },
    },
    [MICROSERVICES.COMMUNITY_SERVICE]: {
      transport: Transport.TCP,
      options: {
        host: process.env.COMMUNITY_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.COMMUNITY_SERVICE_PORT || '3109', 10),
      },
    },
    [MICROSERVICES.CRM_SERVICE]: {
      transport: Transport.TCP,
      options: {
        host: process.env.CRM_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.CRM_SERVICE_PORT || '3109', 10),
      },
    },
  };

  const config = configs[service];
  if (!config) {
    throw new Error(`Microservice configuration not found for: ${service}`);
  }
  return config;
};
