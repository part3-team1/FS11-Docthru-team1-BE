import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { needsAdmin, needsLogin, validate } from '#middlewares';
import { userUpdateSchema } from '#schemas/validation.schema.js';

export class UserController extends BaseController {
  #userService;

  constructor({ userService }) {
    super();
    this.#userService = userService;
  }

  routes() {
    this.router.get('/me', needsLogin, (req, res, next) =>
      this.getUserProfile(req, res, next),
    );
    this.router.patch(
      '/me',
      needsLogin,
      validate('body', userUpdateSchema),
      (req, res, next) => this.updateProfile(req, res, next),
    );
    this.router.get('/me/submissions', needsLogin, (req, res, next) =>
      this.getMySubmissions(req, res, next),
    );
    this.router.get('/me/challenges', needsLogin, (req, res, next) =>
      this.getMyChallenges(req, res, next),
    );
    this.router.get('/me/challengeRequests', needsLogin, (req, res, next) =>
      this.getMyChallengeRequests(req, res, next),
    );
    this.router.get('/me/hearts', needsLogin, (req, res, next) =>
      this.getMyHearts(req, res, next),
    );
    this.router.get('/me/feedbacks', needsLogin, (req, res, next) =>
      this.getMyFeedbacks(req, res, next),
    );

    this.router.get('/', needsAdmin, (req, res, next) =>
      this.getUsers(req, res, next),
    );
    this.router.get('/:id', needsAdmin, (req, res, next) =>
      this.getUserById(req, res, next),
    );
    this.router.patch('/:id/role', needsAdmin, (req, res, next) =>
      this.changeUserRole(req, res, next),
    );

    return this.router;
  }

  async getUserProfile(req, res, next) {
    try {
      const { id: userId } = req.user;
      const user = await this.#userService.getUserProfile(userId);

      res.status(HTTP_STATUS.OK).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { id: userId } = req.user;
      const updatedUser = await this.#userService.updateProfile(
        userId,
        req.body,
      );

      res.status(HTTP_STATUS.OK).json({ success: true, data: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  async getMySubmissions(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { skip, take, sortBy, sortOrder } = req.query;

      const result = await this.#userService.getMySubmissions(userId, {
        skip,
        take,
        sortBy,
        sortOrder,
      });

      res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getMyChallenges(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { skip, take, sortBy, sortOrder } = req.query;

      const result = await this.#userService.getMyChallenges(userId, {
        skip,
        take,
        sortBy,
        sortOrder,
      });

      res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getMyChallengeRequests(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { skip, take, sortBy, sortOrder } = req.query;

      const result = await this.#userService.getMyChallengeRequests(userId, {
        skip,
        take,
        sortBy,
        sortOrder,
      });

      res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getMyHearts(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { skip, take, sortBy, sortOrder } = req.query;

      const result = await this.#userService.getMyHearts(userId, {
        skip,
        take,
        sortBy,
        sortOrder,
      });

      res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getMyFeedbacks(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { skip, take, sortBy, sortOrder } = req.query;

      const result = await this.#userService.getMyFeedbacks(userId, {
        skip,
        take,
        sortBy,
        sortOrder,
      });

      res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      const { skip, take, sortBy, sortOrder, role, status, keyword } = req.query;

      const result = await this.#userService.getUsers({
        skip,
        take,
        sortBy,
        sortOrder,
        role,
        status,
        keyword,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { users: result.users, totalCount: result.totalCount },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await this.#userService.getUserById(id);

      res.status(HTTP_STATUS.OK).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async changeUserRole(req, res, next) {
    try {
      const { id: requesterId } = req.user;
      const { id: targetUserId } = req.params;
      const { role: newRole } = req.body;

      const result = await this.#userService.changeUserRole(
        requesterId,
        targetUserId,
        newRole,
      );

      res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
