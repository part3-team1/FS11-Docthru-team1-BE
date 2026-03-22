import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { authenticate, validate } from '#middlewares';
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
      authenticate,
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
        docUrl,
        description,
        category,
        documentType,
        dueDate,
        maxParticipants,
      } = req.body;

      const request = await this.#challengeService.createRequest(userId, {
        title,
        docUrl,
        description,
        category,
        documentType,
        dueDate,
        maxParticipants,
      });

      res.status(HTTP_STATUS.CREATED).json({ success: true, data: request });
    } catch (error) {
      next(error);
    }
  }
}
