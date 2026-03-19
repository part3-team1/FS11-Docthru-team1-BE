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
        user_id: user.id,
        role: user.role,
        grade: user.grade,
      },
      this.#accessSecret,
      { expiresIn: '15m' },
    );
  }

  generateRefreshToken(user) {
    return jwt.sign({ user_id: user.id }, this.#refreshSecret, {
      expiresIn: '7d',
    });
  }

  generateTokens(user) {
    return {
      access_token: this.generateAccessToken(user),
      refresh_token: this.generateRefreshToken(user),
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
      return jwt.verify(token, secret);
    } catch (error) {
      return null;
    }
  }
}
