import { HttpException } from './http.exception.js';
import { ERROR_MESSAGE } from '#constants/error.js';

export class NotFoundException extends HttpException {
    constructor (message = ERROR_MESSAGE.NOT_FOUND, details = null){
        super(404, message , details);
    }
}