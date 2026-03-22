import { ERROR_MESSAGE } from '#constants';
import { UnauthorizedException } from '#exceptions';

const createAuthorizationMiddleware = (predicate) => (req, res, next) => {
  if (predicate(req)) {
    next();
  } else {
    next(new UnauthorizedException(ERROR_MESSAGE.INVALID_TOKEN));
  }
};

const hasLoginUser = (req) => Boolean(req.user);

export const needsLogin = createAuthorizationMiddleware(hasLoginUser);
