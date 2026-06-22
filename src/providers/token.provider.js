import jwt from 'jsonwebtoken';
import { config } from '#config';

export class TokenProvider {
  #accessSecret;
  #refreshSecret;

  constructor() {
    this.#accessSecret = config.JWT_ACCESS_SECRET;
    this.#refreshSecret = config.JWT_REFRESH_SECRET;
  }

  generateAccessToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        role: user.role,
        grade: user.grade,
      },
      this.#accessSecret,
      { expiresIn: '15m', algorithm: 'HS256' },
    );
  }

  generateRefreshToken(user) {
    return jwt.sign({ userId: user.id }, this.#refreshSecret, {
      expiresIn: '7d',
      algorithm: 'HS256',
    });
  }

  generateTokens(user) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  verifyAccessToken(token) {
    return this.#verifyToken(token, this.#accessSecret);
  }

  verifyRefreshToken(token) {
    return this.#verifyToken(token, this.#refreshSecret);
  }

  #verifyToken(token, secret) {
    try {
      // 알고리즘을 HS256으로 고정해 alg 혼동(alg:none/비대칭키 주입) 공격을 차단.
      return jwt.verify(token, secret, { algorithms: ['HS256'] });
    } catch (error) {
      return null;
    }
  }
}
