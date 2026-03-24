import { HttpException } from './http.exception.js';
import { ERROR_MESSAGE } from '../constants/error.js';

export class BadRequestException extends HttpException {
  constructor(message = ERROR_MESSAGE.BAD_REQUEST, details = null) {
    super(400, message, details);
  }
}