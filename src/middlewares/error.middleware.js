import { HTTP_STATUS, PRISMA_ERROR, ERROR_MESSAGE } from '#constants';
import { HttpException, UnauthorizedException } from '#exceptions';
import jwt from 'jsonwebtoken';

export const errorMiddleware = (err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof jwt.JsonWebTokenError) {
    const error = new UnauthorizedException(ERROR_MESSAGE.INVALID_TOKEN);
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  if (err instanceof HttpException) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === PRISMA_ERROR.UNIQUE_CONSTRAINT) {
      const field = err.meta?.target?.[0];
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: `${field}가 이미 사용 중입니다.`,
      });
    }

    if (err.code === PRISMA_ERROR.RECORD_NOT_FOUND) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGE.RESOURCE_NOT_FOUND,
      });
    }
  }

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
  });
};