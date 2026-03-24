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
    this.router.get('/challenges/:challengeId', (req, res, next) =>
      this.getSubmissionByChallenge(req, res, next),
    );
    this.router.get('/:id', (req, res, next) =>
      this.getSubmissionById(req, res, next),
    );
    this.router.get('/me', needsLogin, (req, res, next) =>
      this.getMySubmissions(req, res, next),
    );
    this.router.get('/challenges/:challengeId/rankings', (req, res, next) =>
      this.getTopRankings(req, res, next),
    );
    this.router.post(
      '/challenges/:challengeId',
      needsLogin,
      validate('body', submissionSchema),
      (req, res, next) => this.submit(req, res, next),
    );
    this.router.post('/:id/heart', needsLogin, (req, res, next) =>
      this.toggleHeart(req, res, next),
    );

    return this.router;
  }

  async getSubmissionByChallenge(req, res, next) {
    try {
      const { challenge_id: challengeId } = req.params;
      const { skip, take, sort_by: SortBy, sort_order: sortOrder } = req.query;

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
      const submission = await this.#submissionService.getSubmissionById(id);

      res.status(HTTP_STATUS.OK).json({ success: true, data: submission });
    } catch (error) {
      next(error);
    }
  }

  async getMySubmissions(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { skip, take } = req.query;

      const result = await this.#submissionService.getMySubmissions(userId, {
        skip,
        take,
      });

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

  async getTopRankings(req, res, next) {
    try {
      const { challenge_id: challengeId } = req.params;
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
      const { challenge_id: challengeId } = req.params;
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
