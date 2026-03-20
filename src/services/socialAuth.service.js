import { UP_GRADE_CONDITION } from '#constants/count.js';

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

    if (user.status === 'BANNED' || user.is_banned) {
      throw new Error('운영 정책 위반으로 정지된 계정입니다.');
    }

    if (user.status === 'WITHDRAWN') {
      throw new Error('탈퇴 처리된 계정입니다.');
    }

    const updatedUser = await this.#checkGrade(user);
    const tokens = this.#tokenProvider.generateTokens(updatedUser);

    await this.#userRepository.updateRefreshToken(
      updatedUser.id,
      tokens.refresh_token,
    );

    return { user: updatedUser, tokens };
  }

  async #resolveUser({ provider, profile }) {
    const socialUser = await this.#userRepository.findBySocialAccount(
      provider,
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
      return this.#userRepository.create({
        email,
        nickname: profile.nickname || `User_${Date.now().toString().slice(-4)}`,
        provider: provider.toUpperCase(),
        provider_id: String(profile.id),
        grade: 'NORMAL',
      });
    }

    await this.#userRepository.connectSocialAccount(existingUser.id, {
      provider: provider.toUpperCase(),
      provider_id: String(profile.id),
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
      user.participation_count >= UP_GRADE_CONDITION.PRTICIPATION_COUNT &&
      user.best_selection_count >= UP_GRADE_CONDITION.BEST_SELECTION_COUNT
    ) {
      await this.#userRepository.updateUser(...user, { grade: 'EXPERT' });

      return { ...user, grad: 'EXPERT' };
    }

    return user;
  }

  async #getSocialProfile(provider, code, state) {
    switch (provider) {
      case 'google':
        return this.#getGoogleProfile(code);
      case 'kakao':
        return this.#getKakaoProfile(code);
      case 'naver':
        return this.#getNaverProfile(code, state);
      default:
        throw new Error('지원하지 않는 소셜 제공자입니다.');
    }
  }

  async #getGoogleProfile(code) {
    //구현 예정
  }

  async #getKakaoProfile(code) {
    //구현 예정
  }

  async #getNaverProfile(code, state) {
    //구현 예정
  }

  async #requestSocialJson(url, options, defaultErrorMessage) {
    //구현 예정
  }
}
