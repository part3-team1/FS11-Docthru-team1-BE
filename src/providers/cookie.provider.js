import { config } from '#config';
import { ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE } from '#constants';

export class CookieProvider {
  setAuthCookies(res, tokens) {
    const { access_token, refresh_token } = tokens;

    const commonOptions = {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    };

    res.cookie('accessToken', access_token, {
      ...commonOptions,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    res.cookie('refreshToken', refresh_token, {
      ...commonOptions,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  }

  clearAuthCookies(res) {
    const clearOptions = {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    };

    res.clearCookie('accessToken', clearOptions);
    res.clearCookie('refreshToken', clearOptions);
  }
}
