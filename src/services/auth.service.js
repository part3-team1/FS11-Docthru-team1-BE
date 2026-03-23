import { UP_GRADE_CONDITION, ERROR_MESSAGE } from '#constants';
import {
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '#exceptions';

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
      throw new ConflictException(ERROR_MESSAGE.DUPLICATE_EMAIL);
    }
    if (existingNickname) {
      throw new ConflictException(ERROR_MESSAGE.DUPLICATE_NICKNAME);
    }

    const hashed = await this.#passwordProvider.hash(password);

    const user = await this.#userRepository.create({
      email,
      password_hash: hashed,
      nickname,
    });

    const tokens = this.#tokenProvider.generateTokens(user);

    await this.#userRepository.updateRefreshToken(
      user.id,
      tokens.refresh_token,
    );

    return { user, tokens };
  }

  async login({ email, password }) {
    const authUser = await this.#userRepository.findByEmail(email, {
      includePassword: true,
    });
    if (!authUser) {
      throw new UnauthorizedException(ERROR_MESSAGE.INVALID_LOGIN);
    }

    if (authUser.status === 'BANNED' || authUser.is_banned) {
      throw new ForbiddenException(ERROR_MESSAGE.USER_BANNED);
    }

    const isPasswordValid = await this.#passwordProvider.compare(
      password,
      authUser.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(ERROR_MESSAGE.INVALID_LOGIN);
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

  async logout(userId) {
    const user = await this.#userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGE.ACCOUNT_NOT_FOUND);
    }

    await this.#userRepository.updateRefreshToken(userId, null);
  }

  async withdraw(userId) {
    const user = await this.#userRepository.findById(userId);
    if (!user) throw new NotFoundException(ERROR_MESSAGE.ACCOUNT_NOT_FOUND);

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
      throw new UnauthorizedException(ERROR_MESSAGE.INVALID_TOKEN);
    }

    const user = await this.#userRepository.findById(payload.user_id);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGE.ACCOUNT_NOT_FOUND);
    }
    if (user.status !== 'ACTIVE' || user.is_banned) {
      throw new ForbiddenException(ERROR_MESSAGE.INACTIVE_ACCOUNT);
    }

    if (user.refresh_token !== refreshToken) {
      throw new UnauthorizedException(ERROR_MESSAGE.TOKEN_MISMATCH);
    }

    const finalUser = await this.#checkGrade(user);
    const tokens = this.#tokenProvider.generateTokens(finalUser);

    await this.#userRepository.updateRefreshToken(
      finalUser.id,
      tokens.refresh_token,
    );

    return { user: finalUser, tokens };
  }

  async getMe(userId) {
    const user = await this.#userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGE.ACCOUNT_NOT_FOUND);
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
  async refreshTokens(refreshToken) {
    const payload = this.#tokenProvider.verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new Error('유효하지 않은 토큰입니다.');
    } 

    const user = await this.#userRepository.findById(payload.userId);

    if (!user) {
      throw new Error('유저를 찾을 수 없습니다.');
    }

    const tokens = this.#tokenProvider.generateTokens(user);
    await this.#userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    return { user, tokens };
  } 
}