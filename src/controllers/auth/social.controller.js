import { BaseController } from '#controllers/base.controller.js';
import { validate } from '#middlewares';
import { ERROR_MESSAGE } from '#constants';
import { config } from '#config';
import { BadRequestException } from '#exceptions';
import {
  socialLoginSchema,
  socialCallbackSchema,
  socialProviderSchema,
} from '#schemas/validation.schema.js';

export class SocialAuthController extends BaseController {
  #socialAuthService;
  #cookieProvider;

  constructor({ socialAuthService, cookieProvider }) {
    super();
    this.#socialAuthService = socialAuthService;
    this.#cookieProvider = cookieProvider;
  }

  routes() {
    this.router.get(
      '/social/:provider/login',
      validate('params', socialProviderSchema),
      validate('query', socialLoginSchema),
      (req, res, next) => this.socialRedirect(req, res, next),
    );

    this.router.get(
      '/social/callback/:provider',
      validate('params', socialProviderSchema),
      validate('query', socialCallbackSchema),
      (req, res, next) => this.socialCallback(req, res, next),
    );

    return this.router;
  }

  async socialRedirect(req, res, next) {
    try {
      const { provider } = req.params;
      const { next: nextPath } = req.query;

      const loginUrl = this.generateSocialLoginLink(provider, {
        next: nextPath,
      });

      res.redirect(loginUrl);
    } catch (error) {
      next(error);
    }
  }

  async socialCallback(req, res, next) {
    try {
      const { provider } = req.params;
      const { code, state } = req.query;

      const { tokens } = await this.#socialAuthService.loginOrSignUp({
        provider,
        code,
        state,
      });

      this.#cookieProvider.setAuthCookies(res, tokens);

      const { next: targetNext } = this.#decodeState(state);
      const safeNext = this.#normalizeNextPath(targetNext);
      const redirectUrl = new URL(safeNext, config.CLIENT_BASE_URL).toString();

      return res.redirect(redirectUrl);
    } catch (error) {
      next(error);
    }
  }

  generateSocialLoginLink(provider, { next = '/' }) {
    const generator = this.socialLoginLinkGenerator[provider];
    if (!generator) {
      throw new BadRequestException(ERROR_MESSAGE.UNSUPPORTED_PROVIDER);
    }

    return generator({ next: this.#normalizeNextPath(next) });
  }

  get socialLoginLinkGenerator() {
    const redirectBase = `${config.API_BASE_URL}/api/auth/social/callback`;

    return {
      google: ({ next }) => {
        const params = new URLSearchParams({
          client_id: config.GOOGLE_CLIENT_ID,
          redirect_uri: `${redirectBase}/google`,
          response_type: 'code',
          scope: 'openid email profile',
          state: this.#encodeState({ next }),
          access_type: 'offline',
          prompt: 'consent',
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      },
    };
  }

  #encodeState(payload) {
    return Buffer.from(JSON.stringify(payload)).toString('base64url');
  }

  #decodeState(rawState) {
    if (!rawState) {
      return { next: '/' };
    }

    try {
      const parsed = JSON.parse(
        Buffer.from(rawState, 'base64url').toString('utf8'),
      );

      return { next: parsed?.next };
    } catch {
      return { next: '/' };
    }
  }

  #normalizeNextPath(next) {
    if (typeof next !== 'string') return '/';

    const trimmed = next.trim();
    if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return '/';

    return trimmed;
  }
}
