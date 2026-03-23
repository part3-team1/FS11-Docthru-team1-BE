import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { needsLogin, validate } from '#middlewares';
import { challengeSchema } from '#schemas/validation.schema.js';

export class ChallengeRequestController extends BaseController {
  #challengeService;

  constructor({ challengeService }) {
    super();
    this.#challengeService = challengeService;
  }

  routes() {
    this.router.post(
      '/',
      needsLogin,
      validate('body', challengeSchema),
      (req, res, next) => this.createRequest(req, res, next),
    );

    return this.router;
  }

  async createRequest(req, res, next) {
    try {
      const { id: userId } = req.user;
      const {
        title,
        doc_url,
        description,
        category,
        document_type,
        due_date,
        max_participants,
      } = req.body;

      const request = await this.#challengeService.createRequest(userId, {
        title,
        doc_url,
        description,
        category,
        document_type,
        due_date,
        max_participants,
      });

      res.status(HTTP_STATUS.CREATED).json({ success: true, data: request });
    } catch (error) {
      next(error);
    }
  }
}
