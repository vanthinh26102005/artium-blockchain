import { RabbitMQConfig, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Exchanges } from './exchanges/exchanges';
import { DeadLetterExchanges } from './exchanges/dl-exchange';

const DEFAULT_PREFETCH_COUNT = 10;
const DEFAULT_RETRY_ATTEMPTS = 10;
const DEFAULT_RETRY_DELAY_MS = 5000;
const DEFAULT_SOCKET_TIMEOUT_MS = 10000;
const DEFAULT_HEARTBEAT_SECONDS = 30;

const getPositiveInt = (
  configService: ConfigService,
  key: string,
  fallback: number,
): number => {
  const rawValue = configService.get<string | number>(key);

  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return fallback;
  }

  const value =
    typeof rawValue === 'number' ? rawValue : Number.parseInt(rawValue, 10);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${key} must be a positive integer`);
  }

  return value;
};

@Global()
@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): RabbitMQConfig => {
        const uri = configService.get<string>('RABBITMQ_URI');

        if (!uri) {
          throw new Error('RABBITMQ_URI is required');
        }

        const prefetch = getPositiveInt(
          configService,
          'RABBITMQ_PREFETCH',
          DEFAULT_PREFETCH_COUNT,
        );
        const retryAttempts = getPositiveInt(
          configService,
          'RABBITMQ_RETRY_ATTEMPTS',
          DEFAULT_RETRY_ATTEMPTS,
        );
        const retryDelayMs = getPositiveInt(
          configService,
          'RABBITMQ_RETRY_DELAY',
          DEFAULT_RETRY_DELAY_MS,
        );
        const socketTimeoutMs = getPositiveInt(
          configService,
          'RABBITMQ_SOCKET_TIMEOUT',
          DEFAULT_SOCKET_TIMEOUT_MS,
        );
        const heartbeatSeconds = getPositiveInt(
          configService,
          'RABBITMQ_HEARTBEAT_SECONDS',
          DEFAULT_HEARTBEAT_SECONDS,
        );
        const reconnectTimeInSeconds = Math.max(
          1,
          Math.ceil(retryDelayMs / 1000),
        );
        const startupTimeoutMs = retryAttempts * retryDelayMs + socketTimeoutMs;
        const logger = new Logger('RabbitMQConfig');

        logger.debug(
          `Connecting to RabbitMQ at URI: ${uri} with reconnect interval ${reconnectTimeInSeconds}s and startup timeout ${startupTimeoutMs}ms`,
        );

        return {
          exchanges: [...Exchanges, ...DeadLetterExchanges],
          uri,
          prefetchCount: prefetch,
          connectionInitOptions: {
            wait: true,
            timeout: startupTimeoutMs,
            reject: true,
          },
          connectionManagerOptions: {
            heartbeatIntervalInSeconds: heartbeatSeconds,
            reconnectTimeInSeconds,
            connectionOptions: {
              timeout: socketTimeoutMs,
            },
          },
          enableControllerDiscovery: true,
        };
      },
    }),
  ],
  exports: [RabbitMQModule],
})
export class AppRabbitMQModule {}
