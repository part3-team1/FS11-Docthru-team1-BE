import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { authenticate } from '#middlewares';

export class DraftController extends BaseController {
  #draftService;

  constructor({ draftService }) {
    super();
    this.#draftService = draftService;
  }

  routes() {
    this.router.get(
      '/challenges/:challengeId',
      authenticate,
      (req, res, next) => this.getListDraft(req, res, next),
    );
    this.router.get(
      '/challenges/:challengeId/latest',
      authenticate,
      (req, res, next) => this.getLatestDraft(req, res, next),
    );
    this.router.get('/:id', authenticate, (req, res, next) =>
      this.getDraft(req, res, next),
    );
    this.router.post(
      '/challenges/:challengeId',
      authenticate,
      (req, res, next) => this.saveDraft(req, res, next),
    );
    this.router.delete('/:id', authenticate, (req, res, next) =>
      this.deleteDraft(req, res, next),
    );

    return this.router;
  }

  async getListDraft(req, res, next) {
    try {
      //로직 작성
    } catch (error) {
      next(error);
    }
  }

  async getLatestDraft(req, res, next) {
    try {
      //로직 작성
    } catch (error) {
      next(error);
    }
  }

  async getDraft(req, res, next) {
    try {
      //로직 작성
    } catch (error) {
      next(error);
    }
  }

  async saveDraft(req, res, next) {
    try {
      //로직 작성
    } catch (error) {
      next(error);
    }
  }

  async deleteDraft(req, res, next) {
    try {
      //로직 작성
    } catch (error) {
      next(error);
    }
  }
}
