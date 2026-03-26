export class AuthMiddleware {
  #authService;
  #tokenProvider;
  #cookieProvider;

  constructor({ authService, tokenProvider, cookieProvider }) {
    this.#authService = authService;
    this.#tokenProvider = tokenProvider;
    this.#cookieProvider = cookieProvider;
  }

  async authenticate(req, res, next) {
    try {
      const { accessToken, refreshToken } = req.cookies;

      if (!accessToken && !refreshToken) {
        return next();
      }

      const decoded = accessToken
        ? this.#tokenProvider.verifyAccessToken(accessToken)
        : null;

      if (decoded?.userId) {
        req.user = {
          id: decoded.userId,
          role: decoded.role,
          grade: decoded.grade,
        };
        return next();
      }

      if (!refreshToken) {
        this.#cookieProvider.clearAuthCookies(res);
        return next();
      }

      const { user, tokens } =
        await this.#authService.refreshTokens(refreshToken);

      this.#cookieProvider.setAuthCookies(res, tokens);
      req.user = { id: user.id, role: user.role, grade: user.grade };

      return next();
    } catch {
      this.#cookieProvider.clearAuthCookies(res);
      return next();
    }
  }
}
