import { ERROR_MESSAGE } from '#constants/error.js';
import { NotFoundException, ForbiddenException } from '#exceptions';

export class NotificationService {
  #notificationRepository;

  constructor({ notificationRepository }) {
    this.#notificationRepository = notificationRepository;
  }

  //알림 목록
  async getMyNotifications(user_id) {
    const [items, unreadCount] = await Promise.all([
      this.#notificationRepository.findAllByUserId(user_id),
      this.#notificationRepository.countUnread(user_id),
    ]);

    return {
      totalCount: items.length,
      unreadCount,
      items,
    };
  }

  //안읽은 알림 카운트 (배지용)
  async getUnreadCount(user_id) {
    return await this.#notificationRepository.countUnread(user_id);
  }

  //읽음 처리 관련
  async markAsRead(user_id, notification_id) {
    const notification =
      await this.#notificationRepository.findById(notification_id);
    if (!notification) {
      throw new NotFoundException(ERROR_MESSAGE.NOTIFICATION_NOT_FOUND);
    }

    if (notification.user_id !== user_id) {
      throw new ForbiddenException(ERROR_MESSAGE.NOTIFICATION_ACCESS_DENIED);
    }

    return await this.#notificationRepository.markAsRead(notification_id);
  }

  async deleteNotification(user_id, notification_id) {
    const notification =
      await this.#notificationRepository.findById(notification_id);
    if (!notification) {
      throw new NotFoundException(ERROR_MESSAGE.NOTIFICATION_NOT_FOUND);
    }

    if (notification.user_id !== user_id) {
      throw new ForbiddenException(ERROR_MESSAGE.NOTIFICATION_ACCESS_DENIED);
    }

    return await this.#notificationRepository.delete(notification_id);
  }
}
