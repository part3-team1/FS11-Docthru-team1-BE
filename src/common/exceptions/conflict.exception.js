import { HttpException } from './http.exception.js';
import { ERROR_MESSAGE } from '#constants/error.js';

export class ConflictException extends HttpException {
  constructor(message = ERROR_MESSAGE.CONFLICT, details = null) {
    super(409, message, details);
  }
}