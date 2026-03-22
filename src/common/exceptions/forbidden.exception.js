import { HttpException } from './http.exception.js';
import { ERROR_MESSAGE } from '#constants';

export class ForbiddenException extends HttpException {
  constructor(message = ERROR_MESSAGE.FORBIDDEN, details = null) {
    super(403, message, details);
  }
}