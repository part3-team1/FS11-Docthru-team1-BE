import { ERROR_MESSAGE } from '#constants';
import { NotFoundException, ForbiddenException } from '#exceptions';

export class UserService {
  #userRepository;
  #submissionRepository;
  #challengeRepository;
  #challengeRequestRepository;
  #heartRepository;
  #feedbackRepository;

  constructor({
    userRepository,
    submissionRepository,
    challengeRepository,
    challengeRequestRepository,
    heartRepository,
    feedbackRepository,
  }) {
    this.#userRepository = userRepository;
    this.#submissionRepository = submissionRepository;
    this.#challengeRepository = challengeRepository;
    this.#challengeRequestRepository = challengeRequestRepository;
    this.#heartRepository = heartRepository;
    this.#feedbackRepository = feedbackRepository;
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

  async getMySubmissions(userId, query) {
    return await this.#submissionRepository.findAllByUserId(userId, query);
  }

  async getMyChallenges(userId, query) {
    const result = await this.#challengeRepository.findAllParticipating(
      userId,
      query,
    );

    return { items: result.participations, totalCount: result.totalCount };
  }

  async getMyChallengeRequests(userId, query) {
    const result = await this.#challengeRequestRepository.findAllByRequesterId(
      userId,
      query,
    );

    return { items: result.requests, totalCount: result.totalCount };
  }

  async getMyHearts(userId, query) {
    const result = await this.#heartRepository.findAllByUserId(userId, query);

    return { items: result.hearts, totalCount: result.totalCount };
  }

  async getMyFeedbacks(userId, query) {
    const result = await this.#feedbackRepository.findAllByUserId(
      userId,
      query,
    );

    return { items: result.feedbacks, totalCount: result.totalCount };
  }
}
