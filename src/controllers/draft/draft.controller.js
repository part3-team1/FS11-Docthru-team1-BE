import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { needsLogin } from '#middlewares';

export class DraftController extends BaseController {
  #draftService;

  constructor({ draftService }) {
    super();
    this.#draftService = draftService;
  }

  routes() {
    this.router.get('/challenges/:challengeId', needsLogin, (req, res, next) =>
      this.getListDraft(req, res, next),
    );
    this.router.get(
      '/challenges/:challengeId/latest',
      needsLogin,
      (req, res, next) => this.getLatestDraft(req, res, next),
    );
    this.router.get('/:id', needsLogin, (req, res, next) =>
      this.getDraft(req, res, next),
    );
    this.router.post('/challenges/:challengeId', needsLogin, (req, res, next) =>
      this.saveDraft(req, res, next),
    );
    this.router.delete('/:id', needsLogin, (req, res, next) =>
      this.deleteDraft(req, res, next),
    );

    return this.router;
  }

  //매핑 주의!!!!!!

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
