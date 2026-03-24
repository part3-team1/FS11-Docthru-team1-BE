import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { needsLogin } from '#middlewares';

export class EditRequestController extends BaseController {
  #editRequestService;

  constructor({ editRequestService }) {
    super();
    this.#editRequestService = editRequestService;
  }

  routes() {
    this.router.post('/challenge/:challengeId', needsLogin, (req, res, next) =>
      this.createEditRequest(req, res, next),
    );

    return this.router;
  }

  async createEditRequest(req, res, next) {
    try {
      const { challenge_id: challengeId } = req.params;
      const { id: adminId } = req.user;
      const { update_data: updateData, reason } = req.body;

      const result = await this.#editRequestService.createEditRequest(
        adminId,
        challengeId,
        updateData,
        reason,
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
