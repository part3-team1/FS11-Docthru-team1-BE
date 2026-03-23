import { BaseController } from '#controllers/base.controller.js';
import { ERROR_MESSAGE, HTTP_STATUS } from '#constants';
import { authenticate } from '#middlewares';

export class NotificationController extends BaseController {
  #notificationService;

  constructor({ notificationService }) {
    super();
    this.#notificationService = notificationService;
  }

  routes() {
    this.router.get('/', authenticate, (req, res, next) =>
      this.getMyNotifications(req, res, next),
    );
    this.router.get('/unread-count', authenticate, (req, res, next) =>
      this.getUnreadCount(req, res, next),
    );
    this.router.patch('/:id/read', authenticate, (req, res, next) =>
      this.markAsRead(req, res, next),
    );
    this.router.delete('/:id', authenticate, (req, res, next) =>
      this.deleteNotification(req, res, next),
    );

    return this.router;
  }

  async getMyNotifications(req, res, next) {
    try {
      const { id: userId } = req.user;
      const result = await this.#notificationService.getMyNotifications(userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const { id: userId } = req.user;
      const unreadCount =
        await this.#notificationService.getUnreadCount(userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { unreadCount },
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { id: notificationId } = req.params;

      await this.#notificationService.markAsRead(userId, notificationId);

      res
        .status(HTTP_STATUS.OK)
        .json({ success: true, message: ERROR_MESSAGE.NOTIFICATION_READ });
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { id: notificationId } = req.params;

      await this.#notificationService.deleteNotification(
        userId,
        notificationId,
      );

      res
        .status(HTTP_STATUS.OK)
        .json({ success: true, message: ERROR_MESSAGE.NOTIFICATION_DELETED });
    } catch (error) {
      next(error);
    }
  }
}
