import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private repo: Repository<Notification>,
  ) {}

  create(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
  ) {
    const notif = this.repo.create({ userId, title, message, type });
    return this.repo.save(notif);
  }

  findByUser(userId: string) {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  getUnreadCount(userId: string) {
    return this.repo.count({ where: { userId, isRead: false } });
  }

  async markAsRead(id: string) {
    await this.repo.update(id, { isRead: true });
    return { success: true };
  }

  async markAllRead(userId: string) {
    await this.repo.update({ userId, isRead: false }, { isRead: true });
    return { success: true };
  }
}
