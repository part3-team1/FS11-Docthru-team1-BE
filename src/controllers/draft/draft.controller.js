import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { needsLogin, validate } from '#middlewares';
import { draftSchema } from '#schemas/validation.schema.js';

export class DraftController extends BaseController {
  #draftService;

  constructor({ draftService }) {
    super();
    this.#draftService = draftService;
  }

  routes() {
    this.router.get('/challenges/:challengeId', needsLogin, (req, res, next) =>
      this.getDraftList(req, res, next),
    );
    this.router.get('/:id', needsLogin, (req, res, next) =>
      this.getDraft(req, res, next),
    );
    this.router.post(
      '/challenges/:challengeId',
      needsLogin,
      validate('body', draftSchema),
      (req, res, next) => this.saveDraft(req, res, next),
    );
    this.router.delete('/:id', needsLogin, (req, res, next) =>
      this.deleteDraft(req, res, next),
    );

    return this.router;
  }

  async getDraftList(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { challengeId } = req.params;

      const drafts = await this.#draftService.getDraftList(userId, challengeId);

      res.status(HTTP_STATUS.OK).json({ success: true, data: drafts });
    } catch (error) {
      next(error);
    }
  }

  async getDraft(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { id: draftId } = req.params;

      const draft = await this.#draftService.getDraftById(userId, draftId);

      res.status(HTTP_STATUS.OK).json({ success: true, data: draft });
    } catch (error) {
      next(error);
    }
  }

  async saveDraft(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { challengeId } = req.params;
      const { title, content } = req.body;

      const draft = await this.#draftService.saveDraft(userId, challengeId, {
        title,
        content,
      });

      res.status(HTTP_STATUS.CREATED).json({ success: true, data: draft });
    } catch (error) {
      next(error);
    }
  }

  async deleteDraft(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { id: draftId } = req.params;

      await this.#draftService.deleteDraft(userId, draftId);

      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }
}
