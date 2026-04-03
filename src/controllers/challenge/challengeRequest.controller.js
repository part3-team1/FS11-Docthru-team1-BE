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

      const request = await this.#challengeService.createRequest(
        userId,
        req.body,
      );

      res.status(HTTP_STATUS.CREATED).json({ success: true, data: request });
    } catch (error) {
      next(error);
    }
  }
}
