import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { needsLogin } from '#middlewares';

export class NotificationController extends BaseController {
  #notificationService;

  constructor({ notificationService }) {
    super();
    this.#notificationService = notificationService;
  }

  routes() {
    this.router.get('/', needsLogin, (req, res, next) =>
      this.getMyNotifications(req, res, next),
    );
    this.router.get('/unread-count', needsLogin, (req, res, next) =>
      this.getUnreadCount(req, res, next),
    );
    this.router.patch('/:id/read', needsLogin, (req, res, next) =>
      this.markAsRead(req, res, next),
    );
    this.router.delete('/:id', needsLogin, (req, res, next) =>
      this.deleteNotification(req, res, next),
    );

    return this.router;
  }

  async getMyNotifications(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { skip, take } = req.query;
      const result = await this.#notificationService.getMyNotifications(
        userId,
        { skip, take },
      );

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
        .json({ success: true, data: { id: notificationId } });
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

      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }
}
