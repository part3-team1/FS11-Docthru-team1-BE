import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { needsLogin, validate } from '#middlewares';
import { submissionSchema } from '#schemas/validation.schema.js';

export class SubmissionController extends BaseController {
  #submissionService;

  constructor({ submissionService }) {
    super();
    this.#submissionService = submissionService;
  }

  routes() {
    this.router.get('/challenges/:challengeId/submissions', (req, res, next) =>
      this.getSubmissionsByChallenge(req, res, next),
    );
    this.router.get('/submissions/:id', (req, res, next) =>
      this.getSubmissionById(req, res, next),
    );
    this.router.get(
      '/challenges/:challengeId/submissions/rankings',
      (req, res, next) => this.getTopRankings(req, res, next),
    );
    this.router.post(
      '/challenges/:challengeId/submissions',
      needsLogin,
      validate('body', submissionSchema),
      (req, res, next) => this.submit(req, res, next),
    );
    this.router.post('/submissions/:id/heart', needsLogin, (req, res, next) =>
      this.toggleHeart(req, res, next),
    );
    this.router.patch(
      '/submissions/:id',
      needsLogin,
      validate('body', submissionSchema.partial()),
      (req, res, next) => this.updateSubmission(req, res, next),
    );
    this.router.delete('/submissions/:id', needsLogin, (req, res, next) =>
      this.deleteSubmission(req, res, next),
    );

    return this.router;
  }

  async getSubmissionByChallenge(req, res, next) {
    try {
      const { challengeId } = req.params;
      const { skip, take, SortBy, sortOrder } = req.query;

      const result = await this.#submissionService.getSubmissionByChallenge(
        challengeId,
        { skip, take, SortBy, sortOrder },
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          submissions: result.submissions,
          totalCount: result.totalCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getSubmissionById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const submission = await this.#submissionService.getSubmissionById(
        id,
        userId,
      );

      res.status(HTTP_STATUS.OK).json({ success: true, data: submission });
    } catch (error) {
      next(error);
    }
  }

  async getTopRankings(req, res, next) {
    try {
      const { challengeId } = req.params;
      const { limit = 5 } = req.query;

      const rankings = await this.#submissionService.getTopRankings(
        challengeId,
        limit,
      );

      res
        .status(HTTP_STATUS.OK)
        .json({ success: true, data: { submissions: rankings } });
    } catch (error) {
      next(error);
    }
  }

  async submit(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { challengeId } = req.params;
      const { title, content } = req.body;

      const submission = await this.#submissionService.submit(
        userId,
        challengeId,
        { title, content },
      );

      res.status(HTTP_STATUS.CREATED).json({ success: true, data: submission });
    } catch (error) {
      next(error);
    }
  }

  async updateSubmission(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { id: submissionId } = req.params;
      const updateData = req.body;

      const updated = await this.#submissionService.updateSubmission(
        userId,
        submissionId,
        updateData,
      );

      res.status(HTTP_STATUS.OK).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async deleteSubmission(req, res, next) {
    try {
      const { id: userId, role } = req.user;
      const { id: submissionId } = req.params;

      await this.#submissionService.deleteSubmission(
        userId,
        submissionId,
        role,
      );

      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }

  async toggleHeart(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { id: submissionId } = req.params;

      const result = await this.#submissionService.toggleHeart(
        userId,
        submissionId,
      );

      res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
