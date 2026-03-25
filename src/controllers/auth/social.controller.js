import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { validate } from '#middlewares';
import { socialLoginSchema } from '#schemas/validation.schema.js';

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
