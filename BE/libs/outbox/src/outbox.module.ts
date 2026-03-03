import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { OutboxService } from './outbox.service';
import { OutboxProcessor } from './outbox.processor';
import { OutboxEntity } from './entities/outbox.entity';
import { AppRabbitMQModule } from '@app/rabbitmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([OutboxEntity]),
    ScheduleModule.forRoot(),
    AppRabbitMQModule,
  ],
  providers: [OutboxService, OutboxProcessor],
  exports: [OutboxService],
})
export class OutboxModule {}
