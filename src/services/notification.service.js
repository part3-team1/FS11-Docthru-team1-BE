import { ERROR_MESSAGE } from '#constants';
import { NotFoundException, ForbiddenException } from '#exceptions';

export class NotificationService {
  #notificationRepository;

  constructor({ notificationRepository }) {
    this.#notificationRepository = notificationRepository;
  }

  async getMyNotifications(userId, query) {
    const [result, unreadCount] = await Promise.all([
      this.#notificationRepository.findAllByUserId(userId, query),
      this.#notificationRepository.countUnread(userId),
    ]);

    return {
      items: result.notifications,
      totalCount: result.totalCount,
      unreadCount,
    };
  }

  async getUnreadCount(userId) {
    return await this.#notificationRepository.countUnread(userId);
  }

  async markAsRead(userId, notificationId) {
    const notification =
      await this.#notificationRepository.findById(notificationId);
    if (!notification) {
      throw new NotFoundException(ERROR_MESSAGE.NOTIFICATION_NOT_FOUND);
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(ERROR_MESSAGE.NOTIFICATION_ACCESS_DENIED);
    }

    return await this.#notificationRepository.markAsRead(notificationId);
  }

  async deleteNotification(userId, notificationId) {
    const notification =
      await this.#notificationRepository.findById(notificationId);
    if (!notification) {
      throw new NotFoundException(ERROR_MESSAGE.NOTIFICATION_NOT_FOUND);
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(ERROR_MESSAGE.NOTIFICATION_ACCESS_DENIED);
    }

    return await this.#notificationRepository.delete(notificationId);
  }
}
