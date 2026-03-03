import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationHistory } from '../domain';
import { SeederService } from './seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationHistory])],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
