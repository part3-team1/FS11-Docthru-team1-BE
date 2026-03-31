import { config } from '#config';
import { UP_GRADE_CONDITION, ERROR_MESSAGE } from '#constants';
import {
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
} from '#exceptions';
export class SocialAuthService {
  #userRepository;
  #tokenProvider;

  constructor({ userRepository, tokenProvider }) {
    this.#userRepository = userRepository;
    this.#tokenProvider = tokenProvider;
  }

  async loginOrSignUp({ provider, code, state }) {
    const profile = await this.#getSocialProfile(provider, code, state);
    const user = await this.#resolveUser({ provider, profile });

    if (user.status === 'BANNED' || user.isBanned) {
      throw new ForbiddenException(ERROR_MESSAGE.USER_BANNED);
    }

    if (user.status === 'WITHDRAWN') {
      throw new ForbiddenException(ERROR_MESSAGE.USER_WITHDRAWN);
    }

    const updatedUser = await this.#checkGrade(user);
    const tokens = this.#tokenProvider.generateTokens(updatedUser);

    await this.#userRepository.updateRefreshToken(
      updatedUser.id,
      tokens.refreshToken,
    );

    return { user: updatedUser, tokens };
  }

  async #resolveUser({ provider, profile }) {
    const upperProvider = provider.toUpperCase();
    const socialUser = await this.#userRepository.findBySocialAccount(
      upperProvider,
      profile.id,
    );

    if (socialUser) {
      return !socialUser.nickname && profile.nickname
        ? this.#userRepository.updateUser(socialUser.id, {
            nickname: profile.nickname,
          })
        : socialUser;
    }

    const email = this.#resolveEmail({ provider, profile });
    const existingUser = await this.#userRepository.findByEmail(email);

    if (!existingUser) {
      return this.#userRepository.createWithSocialAccount({
        email,
        nickname: profile.nickname || `User_${Date.now().toString().slice(-4)}`,
        provider: upperProvider,
        providerId: String(profile.id),
        grade: 'NORMAL',
        status: 'ACTIVE',
      });
    }

    await this.#userRepository.connectSocialAccount(existingUser.id, {
      provider: provider.toUpperCase(),
      providerId: String(profile.id),
    });

    return existingUser;
  }

  #resolveEmail({ provider, profile }) {
    if (profile.email) {
      return profile.email.toLowerCase();
    }

    const safeSocialId = String(profile.id).replace(/[^a-zA-Z0-9_.-]/g, '_');
    return `${provider}_${safeSocialId}@social.local`;
  }

  async #checkGrade(user) {
    if (
      user.grade === 'NORMAL' &&
      user.participationCount >= UP_GRADE_CONDITION.PRTICIPATION_COUNT &&
      user.bestSelectionCount >= UP_GRADE_CONDITION.BEST_SELECTION_COUNT
    ) {
      const upgradeUser = await this.#userRepository.updateUser(user.id, {
        grade: 'EXPERT',
      });

      return upgradeUser;
    }

    return user;
  }

  async #getSocialProfile(provider, code, state) {
    switch (provider) {
      case 'google':
        return this.#getGoogleProfile(code);
      default:
        throw new BadRequestException(ERROR_MESSAGE.UNSUPPORTED_PROVIDER);
    }
  }

  async #getGoogleProfile(code) {
    const callbackUri = `${config.API_BASE_URL}/api/auth/social/callback/google`;

    const tokenResponse = await this.#requestSocialJson(
      'https://oauth2.googleapis.com/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: config.GOOGLE_CLIENT_ID,
          client_secret: config.GOOGLE_CLIENT_SECRET,
          redirect_uri: callbackUri,
          grant_type: 'authorization_code',
        }),
      },
      ERROR_MESSAGE.CANNOT_GET_GOOGLE_TOKEN,
    );

    const { access_token: accessToken } = tokenResponse;

    const profileResponse = await this.#requestSocialJson(
      'https://openidconnect.googleapis.com/v1/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      ERROR_MESSAGE.CANNOT_GET_GOOGEL_PROFILE,
    );

    return {
      id: String(profileResponse.sub),
      email: profileResponse.email ?? null,
      name: profileResponse.name ?? 'Google User',
    };
  }

  async #requestSocialJson(url, options, defaultErrorMessage) {
    const response = await fetch(url, options);
    const rawText = await response.text();
    let payload = null;

    if (rawText) {
      try {
        payload = JSON.parse(rawText);
      } catch {
        payload = null;
      }
    }

    if (!response.ok) {
      const message =
        payload?.error_description ??
        payload?.error ??
        payload?.message ??
        payload?.msg ??
        payload?.extras?.detailMsg ??
        rawText ??
        response.statusText ??
        defaultErrorMessage;

      throw new UnauthorizedException(
        message ?? ERROR_MESSAGE.FAILED_SOCIAL_AUTH,
      );
    }

    return payload;
  }
}
