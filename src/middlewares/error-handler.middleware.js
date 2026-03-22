import { Prisma } from '#generated/prisma/client.ts';
import { HttpException } from '#exceptions';
import { ERROR_MESSAGE, HTTP_STATUS, PRISMA_ERROR } from '#constants';

export const errorHandler = (err, req, res, _next) => {
  console.error(err.stack);

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
        message: `${field}가 이미 사용중입니다.`,
      });
    }

    if (err.code === PRISMA_ERROR.RECORD_NOT_FOUND) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGE.NOT_FOUND,
      });
    }
  }

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
  });
};
