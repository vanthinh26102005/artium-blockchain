import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationHistory } from '../domain';
import { notificationsSeed } from './seeds/notifications.seed';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(NotificationHistory)
    private readonly notificationHistoryRepository: Repository<NotificationHistory>,
  ) {}

  async seed() {
    for (const notification of notificationsSeed) {
      const existingNotification =
        await this.notificationHistoryRepository.findOne({
          where: {
            userId: notification.userId,
            triggerEvent: notification.triggerEvent,
          },
        });
      if (!existingNotification) {
        await this.notificationHistoryRepository.save(
          this.notificationHistoryRepository.create(notification),
        );
      }
    }
  }
}
