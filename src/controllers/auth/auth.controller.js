import { BaseController } from '#controllers/base.controller.js';
import { ERROR_MESSAGE, HTTP_STATUS } from '#constants';
import { validate, needsLogin } from '#middlewares';
import { authSchema, loginSchema } from '#schemas/validation.schema.js';

export class AuthController extends BaseController {
  #authService;
  #cookieProvider;

  constructor({ authService, cookieProvider }) {
    super();
    this.#authService = authService;
    this.#cookieProvider = cookieProvider;
  }

  routes() {
    this.router.post(
      '/signup',
      validate('body', authSchema),
      (req, res, next) => this.signup(req, res, next),
    );
    this.router.post('/login', validate('body', loginSchema), (req, res, next) =>
      this.login(req, res, next),
    );
    this.router.post('/logout', needsLogin, (req, res, next) =>
      this.logout(req, res, next),
    );
    this.router.get('/me', needsLogin, (req, res, next) =>
      this.getMe(req, res, next),
    );
    this.router.delete('/withdraw', needsLogin, (req, res, next) =>
      this.withdraw(req, res, next),
    );

    return this.router;
  }

  async signup(req, res, next) {
    try {
      const { email, password, nickname } = req.body;
      const { user, tokens } = await this.#authService.signup({
        email,
        password,
        nickname,
      });

      this.#cookieProvider.setAuthCookies(res, tokens);
      res.status(HTTP_STATUS.CREATED).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, tokens } = await this.#authService.login({
        email,
        password,
      });

      this.#cookieProvider.setAuthCookies(res, tokens);
      res.status(HTTP_STATUS.OK).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const userId = req.user.id;
      await this.#authService.logout(userId);

      this.#cookieProvider.clearAuthCookies(res);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await this.#authService.getMe(req.user.id);

      res.status(HTTP_STATUS.OK).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async withdraw(req, res, next) {
    try {
      const userId = req.user.id;
      await this.#authService.withdraw(userId);

      this.#cookieProvider.clearAuthCookies(res);
      res
        .status(HTTP_STATUS.OK)
        .json({ success: true, message: ERROR_MESSAGE.USER_WITHDRAWN });
    } catch (error) {
      next(error);
    }
  }
}
