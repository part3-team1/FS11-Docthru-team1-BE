import { format } from 'date-fns';
import { BaseController } from './base.controller.js';
import { HTTP_STATUS } from '#constants';

export * from './base.controller.js';
export * from './admin/index.js';
export * from './auth/index.js';
export * from './challenge/index.js';
export * from './draft/index.js';
export * from './edit-request/index.js';
export * from './feedback/index.js';
export * from './notification/index.js';
export * from './report/index.js';
export * from './submission/index.js';

export class Controller extends BaseController {
  #adminController;
  #authController;
  #socialAuthController;
  #challengeController;
  #challengeRequestController;
  #draftController;
  #editRequestController;
  #feedbackController;
  #notificationController;
  #reportController;
  #submissionController;

  constructor({
    adminController,
    authController,
    socialAuthController,
    challengeController,
    challengeRequestController,
    draftController,
    editRequestController,
    feedbackController,
    notificationController,
    reportController,
    submissionController,
  }) {
    super();
    this.#adminController = adminController;
    this.#authController = authController;
    this.#socialAuthController = socialAuthController;
    this.#challengeController = challengeController;
    this.#challengeRequestController = challengeRequestController;
    this.#draftController = draftController;
    this.#editRequestController = editRequestController;
    this.#feedbackController = feedbackController;
    this.#notificationController = notificationController;
    this.#reportController = reportController;
    this.#submissionController = submissionController;
  }

  routes() {
    this.router.use('/admin', this.#adminController.routes());
    this.router.use('/auth', this.#authController.routes());
    this.router.use('/auth', this.#socialAuthController.routes());
    this.router.use('/challenge', this.#challengeController.routes());
    this.router.use(
      '/challengeRequest',
      this.#challengeRequestController.routes(),
    );
    this.router.use('/draft', this.#draftController.routes());
    this.router.use('/editRequest', this.#editRequestController.routes());
    this.router.use('/feedback', this.#feedbackController.routes());
    this.router.use('/notification', this.#notificationController.routes());
    this.router.use('/report', this.#reportController.routes());
    this.router.use('/submission', this.#submissionController.routes());

    this.router.get('./ping', (req, res) => this.ping(req, res));

    return this.router;
  }

  ping(req, res) {
    const time = new Date();
    const formattedTime = format(time, 'yyyy-MM-dd HH:mm:ss');
    const message = `서버 상태 정상 - 현재 시간: ${formattedTime}`;

    res.status(HTTP_STATUS.OK).json({ success: true, message });
  }
}
