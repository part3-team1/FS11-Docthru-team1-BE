import { HttpException } from './http.exception.js';
import { ERROR_MESSAGE } from '../constants/error.js';

export class UnauthorizedException extends HttpException {
  constructor(message = ERROR_MESSAGE.INVALID_TOKEN, details = null) {
    super(401, message, details);
  }
}