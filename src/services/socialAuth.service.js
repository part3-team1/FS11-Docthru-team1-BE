export class SocialAuthService {
  #userRepository;
  #tokenProvider;

  constructor({ userRepository, tokenProvider }) {
    this.#userRepository = userRepository;
    this.#tokenProvider - tokenProvider;
  }

  async loginOrSingUp({ provider, code, state }) {
    const profile = await this.#getSocialProfile(provider, code, state);
    const user = await this.#resolveUser({ provider, profile });

    const updatedUser = await this.#checkGrade(user);
    const tokens = this.#tokenProvider.generateTokens(updatedUser);

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
      return this.#userRepository.createUser({
        email,
        nickname: profile.nickname,
        provider,
        provider_id: profile.id,
        grade: 'NORMAL',
      });
    }

    await this.#userRepository.connectSocialAccount(existingUser.id, {
      provider,
      provider_id: profile.id,
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
      user.participation_count >= 5 &&
      user.best_selection_count >= 5
    ) {
      return await this.#userRepository.updateUser(user.id, {
        grade: 'EXPERT',
      });
    }
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

  async #requestSocialJson(url, options, deffaltErrorMessage) {
    //구현 예정
  }
}
