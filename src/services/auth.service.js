export class AuthService {
  #userRepository;
  #passwordProvider;
  #tokenProvider;

  constructor({ userRepository, passwordProvider, tokenProvider }) {
    this.#userRepository = userRepository;
    this.#passwordProvider = passwordProvider;
    this.#tokenProvider = tokenProvider;
  }

  async signup({ email, password, nickname }) {
    const existingUser = await this.#userRepository.findUserByEmail(email);

    if (existingUser) {
      throw new Error('이미 사용 중인 이메일입니다.');
    }

    const hashed = await this.#passwordProvider.hash(password);

    const user = await this.#userRepository.createUser({
      email,
      password: hashed,
      nickname,
      grade: 'NORMAL',
    });

    return user;
  }

  async login({ email, password }) {
    const authUser = await this.#userRepository.findUserByEmail(email, {
      includePassword: true,
    });
    if (!authUser) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const isPasswordValid = await this.#passwordProvider.compare(
      password,
      authUser.password_hash,
    );

    if (!isPasswordValid) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    // 등급승격
    const finalUser = await this.#checkGrade(authUser);

    // 토큰발급
    const tokens = this.#tokenProvider.generateTokens(finalUser);

    await this.#userRepository.updateRefreshToken(
      finalUser.id,
      tokens.refreshToken,
    );

    return { user: finalUser, tokens };
  }

  async refreshTokens(refreshToken) {
    const payload = this.#tokenProvider.verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new Error('유효하지 않은 토큰입니다.');
    }

    const user = await this.#userRepository.findById(payload.userId);

    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    const tokens = this.#tokenProvider.generateTokens(user);
    await this.#userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    return { user, tokens };
  }

  async getMe(userId) {
    const user = await this.#userRepository.findById(userId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    return user;
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

    return user;
  }
}
