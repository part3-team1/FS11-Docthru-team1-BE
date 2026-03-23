import { BaseController } from '#controllers/base.controller.js';
import { ERROR_MESSAGE, HTTP_STATUS } from '#constants';
import { needsLogin, validate } from '#middlewares';
import { feedbackSchema } from '#schemas/validation.schema.js';

export class FeedbackController extends BaseController {
  #feedbackService;

  constructor({ feedbackService }) {
    super();
    this.#feedbackService = feedbackService;
  }

  routes() {
    this.router.get('/submissions/:submissionId', (req, res, next) =>
      this.getFeedbacksBySubmission(req, res, next),
    );
    this.router.post(
      '/submissions/:submissionId',
      needsLogin,
      validate('body', feedbackSchema),
      (req, res, next) => this.createFeedback(req, res, next),
    );
    this.router.patch(
      '/:id',
      needsLogin,
      validate('body', feedbackSchema),
      (req, res, next) => this.updateFeedback(req, res, next),
    );
    this.router.delete('/:id', needsLogin, (req, res, next) =>
      this.deleteFeedback(req, res, next),
    );

    return this.router;
  }

  async getFeedbacksBySubmission(req, res, next) {
    try {
      const { submission_id: submissionId } = req.params;
      const { skip, take, sort_by: sortBy, sort_order: sortOrder } = req.query;

      const result = await this.#feedbackService.getFeedbacksBySubmission(
        submissionId,
        { skip, take, sortBy, sortOrder },
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { feedbacks: result.feedbacks, totalCount: result.totalCount },
      });
    } catch (error) {
      next(error);
    }
  }

  async createFeedback(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { submission_id: submissionId } = req.params;
      const { content } = req.body;

      const feedback = await this.#feedbackService.createFeedback(
        userId,
        submissionId,
        content,
      );

      res.status(HTTP_STATUS.CREATED).json({ success: true, data: feedback });
    } catch (error) {
      next(error);
    }
  }

  async updateFeedback(req, res, next) {
    try {
      const { id: userId, role } = req.user;
      const { id: feedbackId } = req.params;
      const { content } = req.body;

      const updatedFeedback = await this.#feedbackService.updateFeedback(
        userId,
        feedbackId,
        content,
        role,
      );

      res.status(HTTP_STATUS.OK).json({ success: true, data: updatedFeedback });
    } catch (error) {
      next(error);
    }
  }

  async deleteFeedback(req, res, next) {
    try {
      const { id: userId, role } = req.user;
      const { id: feedbackId } = req.params;

      await this.#feedbackService.deleteFeedback(userId, feedbackId, role);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: ERROR_MESSAGE.FEEDBACK_DELELTED,
      });
    } catch (error) {
      next(error);
    }
  }
}
