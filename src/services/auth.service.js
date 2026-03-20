import { UP_GRADE_CONDITION } from '#constants/count.js';

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
    const [existingEmail, existingNickname] = await Promise.all([
      this.#userRepository.findByEmail(email),
      this.#userRepository.findByNickname(nickname),
    ]);

    if (existingEmail) {
      throw new Error('이미 사용 중인 이메일입니다.');
    }
    if (existingNickname) {
      throw new Error('이미 사용 중인 닉네임입니다.');
    }

    const hashed = await this.#passwordProvider.hash(password);

    const user = await this.#userRepository.create({
      email,
      password_hash: hashed,
      nickname,
    });

    return user;
  }

  async login({ email, password }) {
    const authUser = await this.#userRepository.findByEmail(email, {
      includePassword: true,
    });
    if (!authUser) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    if (authUser.status === 'BANNED' || authUser.is_banned) {
      throw new Error('운영 정책 위반으로 정지된 계정입니다.');
    }

    const isPasswordValid = await this.#passwordProvider.compare(
      password,
      authUser.password_hash,
    );

    if (!isPasswordValid) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const finalUser = await this.#checkGrade(authUser);
    const tokens = this.#tokenProvider.generateTokens(finalUser);

    await this.#userRepository.updateRefreshToken(
      finalUser.id,
      tokens.refresh_token,
    );

    delete finalUser.password_hash;
    return { user: finalUser, tokens };
  }

  async withdraw(userId) {
    const user = await this.#userRepository.findById(userId);
    if (!user) throw new Error('계정을 찾을 수 없습니다.');

    const timestamp = Date.now();
    const maskedEmail = `withdrawn_${timestamp}_${user.email}`;
    const maskedNickname = `(탈퇴한 사용자_${timestamp.toString().slice(-4)})`;

    return await this.#userRepository.deleteUser(userId, {
      email: maskedEmail,
      nickname: maskedNickname,
      deleted_at: new Date(),
    });
  }

  async refreshTokens(refreshToken) {
    const payload = this.#tokenProvider.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new Error('유효하지 않은 토큰입니다.');
    }

    const user = await this.#userRepository.findById(payload.user_id);
    if (!user) {
      throw new Error('계정을 찾을 수 없습니다.');
    }
    if (user.status !== 'ACTIVE' || user.is_banned) {
      throw new Error('사용 권한이 없는 계정입니다');
    }

    if (user.refresh_token !== refreshToken) {
      throw new Error('보안 인증에 실패하였습니다.');
    }

    const finalUser = await this.#checkGrade(user);
    const tokens = this.#tokenProvider.generateTokens(finalUser);

    await this.#userRepository.updateRefreshToken(
      finalUser.id,
      tokens.refresh_token,
    );

    return { user: finalUser, tokens };
  }

  async getMe(user_id) {
    const user = await this.#userRepository.findById(user_id);
    if (!user) {
      throw new Error('계정을 찾을 수 없습니다.');
    }

    return user;
  }

  async #checkGrade(user) {
    if (user.grade !== 'NORMAL') return user;

    if (
      user.participation_count >= UP_GRADE_CONDITION.PRTICIPATION_COUNT &&
      user.best_selection_count >= UP_GRADE_CONDITION.BEST_SELECTION_COUNT
    ) {
      await this.#userRepository.updateUser(user.id, {
        grade: 'EXPERT',
      });

      return { ...user, grade: 'EXPERT' };
    }

    return user;
  }
}
