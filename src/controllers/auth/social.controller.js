import { BaseController } from '#controllers/base.controller.js';
import { validate } from '#middlewares';
import { HTTP_STATUS, ERROR_MESSAGE } from '#constants';
import { config } from '#config';
import { socialLoginSchema } from '#schemas/validation.schema.js';
import { BadRequestException } from '#exceptions';

export class SocialAuthController extends BaseController {
  #socialAuthService;
  #cookieProvider;

  constructor({ socialAuthService, cookieProvider }) {
    super();
    this.#socialAuthService = socialAuthService;
    this.#cookieProvider = cookieProvider;
  }

  routes() {
    this.router.post(
      '/login/:provider',
      validate('body', socialLoginSchema),
      (req, res, next) => this.login(req, res, next),
    );

    return this.router;
  }

  async login(req, res, next) {
    try {
      const { provider } = req.params;
      const { code, state } = req.body;

      const { user, tokens } = await this.#socialAuthService.loginOrSignUp({
        provider,
        code,
        state,
      });

      this.#cookieProvider.setAuthCookies(res, tokens);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}
