import { BaseController } from '#controllers/base.controller.js';
import { ERROR_MESSAGE, HTTP_STATUS } from '#constants';
import { needsAdmin } from '#middlewares';

export class AdminController extends BaseController {
  #adminService;

  constructor({ adminService }) {
    super();
    this.#adminService = adminService;
  }

  routes() {
    this.router.use(needsAdmin);

    this.router.get('/requests', (req, res, next) =>
      this.getRequests(req, res, next),
    );
    this.router.get('/requests/:id', (req, res, next) =>
      this.getRequestById(req, res, next),
    );
    this.router.patch('/requests/:id/approve', (req, res, next) =>
      this.approveRequest(req, res, next),
    );
    this.router.patch('/requests/:id/reject', (req, res, next) =>
      this.rejectRequest(req, res, next),
    );
    this.router.delete('/requests/:id', (req, res, next) =>
      this.deleteRequest(req, res, next),
    );
    this.router.patch('/users/:id/ban', (req, res, next) =>
      this.banUser(req, res, next),
    );
    this.router.patch('/feedbacks/:id/block', (req, res, next) =>
      this.blockFeedback(req, res, next),
    );

    return this.router;
  }

  async getRequests(req, res, next) {
    try {
      const { skip, take, keyword, status, sortBy, sortOrder } = req.query;
      
      const result = await this.#adminService.getRequests({
        skip,
        take,
        keyword,
        status,
        sortBy,
        sortOrder,
      });

      res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getRequestById(req, res, next) {
    try {
      const { id } = req.params;

      const request = await this.#adminService.getRequestById(id);
      res.status(HTTP_STATUS.OK).json({ success: true, data: request });
    } catch (error) {
      next(error);
    }
  }

  async approveRequest(req, res, next) {
    try {
      const { id: requestId } = req.params;

      const challenge = await this.#adminService.approveRequest(requestId);
      res.status(HTTP_STATUS.OK).json({ success: true, data: challenge });
    } catch (error) {
      next(error);
    }
  }

  async rejectRequest(req, res, next) {
    try {
      const { id: requestId } = req.params;
      const { reason } = req.body;

      await this.#adminService.rejectRequest(requestId, reason);
      res
        .status(HTTP_STATUS.OK)
        .json({ success: true, message: ERROR_MESSAGE.REQUEST_DENIED });
    } catch (error) {
      next(error);
    }
  }

  async deleteRequest(req, res, next) {
    try {
      const { id: requestId } = req.params;
      const { reason } = req.body;

      await this.#adminService.deleteRequest(requestId, reason);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }

  async banUser(req, res, next) {
    try {
      const { id: userId } = req.params;
      const { reason } = req.body;

      await this.#adminService.banUser(userId, reason);
      res
        .status(HTTP_STATUS.OK)
        .json({ success: true, message: ERROR_MESSAGE.USER_BANNED });
    } catch (error) {
      next(error);
    }
  }

  async blockFeedback(req, res, next) {
    try {
      const { id: feedbackId } = req.params;
      const { isBlocked } = req.body;
      //블럭처리에는 이유가 아니라 불린으로 처리되서 바꿨씁니다.
      await this.#adminService.adminBlockFeedback(feedbackId, isBlocked);
      res
        .status(HTTP_STATUS.OK)
        .json({ success: true, message: ERROR_MESSAGE.FEEDBACK_BANNED });
    } catch (error) {
      next(error);
    }
  }
}
