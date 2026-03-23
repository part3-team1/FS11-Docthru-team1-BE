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
    this.router.use(needsAdmin); //어드민만 이 파일의 api 이용가능

    this.router.patch('/requests/:id/approve', (req, res, next) =>
      this.approveRequest(req, res, next),
    );
    this.router.patch('/requests/:id/reject', (req, res, next) =>
      this.rejectRequest(req, res, next),
    );
    this.router.patch('/users/:id/ban', (req, res, next) =>
      this.banUser(req, res, next),
    );
    this.router.delete('/submissions/:id', (req, res, next) =>
      this.deleteSubmission(req, res, next),
    );
    this.router.patch('/feedbacks/:id/block', (req, res, next) =>
      this.blockFeedback(req, res, next),
    );

    return this.router;
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

  async deleteSubmission(req, res, next) {
    try {
      const { id: submissionId } = req.params;
      const { reason } = req.body;

      await this.#adminService.adminDeleteSubmission(submissionId, reason);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }

  async blockFeedback(req, res, next) {
    try {
      const { id: feedbackId } = req.params;
      const { reason } = req.body;

      await this.#adminService.adminBlockFeedback(feedbackId, reason);
      res
        .status(HTTP_STATUS.OK)
        .json({ success: true, message: ERROR_MESSAGE.FEEDBACK_BANNED });
    } catch (error) {
      next(error);
    }
  }
}
