import { format } from 'date-fns';
import { BaseController } from './base.controller.js';
import { HTTP_STATUS } from '#constants';

export * from './base.controller.js';
export * from './admin/index.js';
export * from './auth/index.js';
export * from './challenge/index.js';
export * from './draft/index.js';
export * from './feedback/index.js';
export * from './notification/index.js';
export * from './report/index.js';
export * from './submission/index.js';
export * from './user/index.js';

export class Controller extends BaseController {
  #adminController;
  #authController;
  #socialAuthController;
  #challengeController;
  #challengeRequestController;
  #draftController;
  #feedbackController;
  #notificationController;
  #reportController;
  #submissionController;
  #userController;

  constructor({
    adminController,
    authController,
    socialAuthController,
    challengeController,
    challengeRequestController,
    draftController,
    feedbackController,
    notificationController,
    reportController,
    submissionController,
    userController,
  }) {
    super();
    this.#adminController = adminController;
    this.#authController = authController;
    this.#socialAuthController = socialAuthController;
    this.#challengeController = challengeController;
    this.#challengeRequestController = challengeRequestController;
    this.#draftController = draftController;
    this.#feedbackController = feedbackController;
    this.#notificationController = notificationController;
    this.#reportController = reportController;
    this.#submissionController = submissionController;
    this.#userController = userController;
  }

  routes() {
    this.router.use('/admin', this.#adminController.routes());
    this.router.use('/auth', this.#authController.routes());
    this.router.use('/auth', this.#socialAuthController.routes());
    this.router.use('/users', this.#userController.routes());
    this.router.use('/challenges', this.#challengeController.routes());
    this.router.use(
      '/challengeRequests',
      this.#challengeRequestController.routes(),
    );
    this.router.use('/drafts', this.#draftController.routes());
    this.router.use('/notifications', this.#notificationController.routes());
    this.router.use('/reports', this.#reportController.routes());
    this.router.use('/', this.#feedbackController.routes());
    this.router.use('/', this.#submissionController.routes());

    this.router.get('/ping', (req, res) => this.ping(req, res));

    return this.router;
  }

  ping(req, res) {
    const time = new Date();
    const formattedTime = format(time, 'yyyy-MM-dd HH:mm:ss');
    const message = `서버 상태 정상 - 현재 시간: ${formattedTime}`;

    res.status(HTTP_STATUS.OK).json({ success: true, message });
  }
}
