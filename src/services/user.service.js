import { ERROR_MESSAGE } from '#constants';
import { NotFoundException, ForbiddenException } from '#exceptions';

export class UserService {
  #userRepository;

  constructor({ userRepository }) {
    this.#userRepository = userRepository;
  }

  async getUsers(query) {
    return await this.#userRepository.findAll(query);
  }

  async getUserById(userId) {
    const user = await this.#userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    }

    return user;
  }

  async changeUserRole(requesterId, targetUserId, newRole) {
    const requester = await this.#userRepository.findById(requesterId);
    if (!requester || requester.role !== 'MASTER') {
      throw new ForbiddenException(ERROR_MESSAGE.ONLY_MASTER_ALLOWED);
    }

    const targetUser = await this.#userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    }

    if (requesterId === targetUserId) {
      throw new ForbiddenException(ERROR_MESSAGE.NOT_CHANGE_ROLE_SELF);
    }

    await this.#userRepository.updateRole(targetUserId, newRole);

    return { message: `유저의 권한이 [${newRole}](으)로 변경 되었습니다.` };
  }

  async getUserProfile(userId) {
    const user = await this.#userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    }

    return user;
  }

  async updateProfile(userId, { nickname }) {
    const user = await this.#userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    }

    const updatedUser = await this.#userRepository.updateUser(userId, {
      nickname,
    });

    return updatedUser;
  }
}
