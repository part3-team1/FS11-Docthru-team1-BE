import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { authenticate } from '#middlewares';

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
    this.router.post('/:id/join', authenticate, (req, res, next) =>
      this.join(req, res, next),
    );
    this.router.delete('/:id/leave', authenticate, (req, res, next) =>
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
          challenge: result.challenges,
          totalCount: result.totalCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getChallengeById(req, res, next) {
    try {
      const { id } = req.params;
      const challenge = await this.#challengeService.getChallengeById(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: challenge,
      });
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
