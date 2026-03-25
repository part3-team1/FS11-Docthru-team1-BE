import { ERROR_MESSAGE } from '#constants';
import { NotFoundException, ForbiddenException } from '#exceptions';

export class NotificationService {
  #notificationRepository;

  constructor({ notificationRepository }) {
    this.#notificationRepository = notificationRepository;
  }

  //알림 목록
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

  //안읽은 알림 카운트 (배지용)
  async getUnreadCount(userId) {
    return await this.#notificationRepository.countUnread(userId);
  }

  //읽음 처리 관련
  async markAsRead(userId, notificationId) {
    const notification =
      await this.#notificationRepository.findById(notificationId);
    if (!notification) {
      throw new NotFoundException(ERROR_MESSAGE.NOTIFICATION_NOT_FOUND);
    }

    if (notification.user_id !== userId) {
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

    if (notification.user_id !== userId) {
      throw new ForbiddenException(ERROR_MESSAGE.NOTIFICATION_ACCESS_DENIED);
    }

    return await this.#notificationRepository.delete(notificationId);
  }
}
