import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Exchanges } from './exchanges/exchanges';
import { DeadLetterExchanges } from './exchanges/dl-exchange';

@Global()
@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('RABBITMQ_URI')!;
        const prefetch = configService.get<number>('RABBITMQ_PREFETCH') ?? 10;
        const retryAttempts =
          configService.get<number>('RABBITMQ_RETRY_ATTEMPTS') ?? 10;
        const retryDelay =
          configService.get<number>('RABBITMQ_RETRY_DELAY') ?? 5000;
        const logger = new Logger('RabbitMQConfig');

        logger.debug(`Connecting to RabbitMQ at URI: ${uri}`);

        return {
          exchanges: [...Exchanges, ...DeadLetterExchanges],
          uri,
          prefetchCount: prefetch,
          retryAttempts,
          retryDelay,
          connectionInitOptions: { wait: true },
          enableControllerDiscovery: true,
          socketOptions: {
            heartbeat: 30,
            timeout: 10000,
          },
        };
      },
    }),
  ],
  exports: [RabbitMQModule],
})
export class AppRabbitMQModule {}
