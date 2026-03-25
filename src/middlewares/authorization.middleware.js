import { ERROR_MESSAGE } from '#constants';
import { UnauthorizedException, ForbiddenException } from '#exceptions';

const createAuthorizationMiddleware =
  (predicate, ErrorClass = UnauthorizedException, defaultMessage) =>
  (req, res, next) => {
    if (predicate(req)) {
      next();
    } else {
      next(new ErrorClass(defaultMessage));
    }
  };

const hasLoginUser = (req) => Boolean(req.user);
const hasAdminUser = (req) => ['ADMIN', 'MASTER'].includes(req.user?.role);

export const needsLogin = createAuthorizationMiddleware(
  hasLoginUser,
  UnauthorizedException,
  ERROR_MESSAGE.LOGIN_REQUIRED,
);
export const needsAdmin = createAuthorizationMiddleware(
  hasAdminUser,
  ForbiddenException,
  ERROR_MESSAGE.FORBIDDEN,
);
