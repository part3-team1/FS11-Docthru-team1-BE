import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { needsLogin, validate } from '#middlewares';
import { challengeSchema } from '#schemas/validation.schema.js';

export class ChallengeController extends BaseController {
  #challengeService;

  constructor({ challengeService }) {
    super();
    this.#challengeService = challengeService;
  }

  routes() {
    this.router.get('/', (req, res, next) =>
      this.getChallenges(req, res, next),
    );
    this.router.get('/:id', (req, res, next) =>
      this.getChallengeById(req, res, next),
    );
    this.router.patch(
      '/:id',
      needsLogin,
      validate('body', challengeSchema.partial()),
      (req, res, next) => this.updateChallenge(req, res, next),
    );
    this.router.delete('/:id', needsLogin, (req, res, next) =>
      this.deleteChallenge(req, res, next),
    );
    this.router.post('/:id/join', needsLogin, (req, res, next) =>
      this.join(req, res, next),
    );
    this.router.delete('/:id/leave', needsLogin, (req, res, next) =>
      this.leave(req, res, next),
    );

    return this.router;
  }

  async getChallenges(req, res, next) {
    try {
      const { skip, take, keyword, category, status, sortBy, sortOrder } =
        req.query;

      const result = await this.#challengeService.getChallenges({
        skip,
        take,
        keyword,
        category,
        status,
        sortBy,
        sortOrder,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          challenges: result.items, //서비스에서는 items로 변환하는데 여기서는 challenge여서 바꿨습니다.!
          totalCount: result.totalCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getChallengeById(req, res, next) {
    try {
      const { id: challengeId } = req.params;
      const challenge =
        await this.#challengeService.getChallengeById(challengeId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: challenge,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateChallenge(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { id: challengeId } = req.params;

      const result = await this.#challengeService.updateChallenge(
        userId,
        challengeId,
        req.body,
      );
      res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async deleteChallenge(req, res, next) {
    try {
      const { id: userId, role } = req.user;
      const { id: challengeId } = req.params;

      await this.#challengeService.deleteChallenge(userId, challengeId, role);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }

  async join(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { id: challengeId } = req.params;
      const result = await this.#challengeService.join(userId, challengeId);

      res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async leave(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { id: challengeId } = req.params;
      const result = await this.#challengeService.leave(userId, challengeId);

      res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
