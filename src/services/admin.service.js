import { NOTIFICATION_MESSAGES, ERROR_MESSAGE } from '#constants';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '#exceptions';

export class AdminService {
  #challengeRepository;
  #challengeRequestRepository;
  #notificationRepository;
  #userRepository;
  #feedbackRepository;

  constructor({
    challengeRepository,
    challengeRequestRepository,
    notificationRepository,
    userRepository,
    feedbackRepository,
  }) {
    this.#challengeRepository = challengeRepository;
    this.#challengeRequestRepository = challengeRequestRepository;
    this.#notificationRepository = notificationRepository;
    this.#userRepository = userRepository;
    this.#feedbackRepository = feedbackRepository;
  }

  async getRequests({ skip, take, keyword, status, sortBy, sortOrder }) {
    return this.#challengeRequestRepository.findAll({
      skip,
      take,
      keyword,
      status,
      sortBy,
      sortOrder,
    });
  }

  async getRequestById(requestId) {
    const request = await this.#challengeRequestRepository.findById(requestId);
    if (!request) throw new NotFoundException(ERROR_MESSAGE.NOT_FOUND);
    return request;
  }

  async approveRequest(requestId) {
    const request = await this.#challengeRequestRepository.findById(requestId);
    if (!request) throw new NotFoundException(ERROR_MESSAGE.NOT_FOUND);

    if (request.status === 'APPROVED') {
      throw new ConflictException(ERROR_MESSAGE.ALREADY_APPROVED);
    }

    const challenge = await this.#challengeRepository.create({
      requestId: request.id,
      title: request.title,
      docUrl: request.docUrl,
      description: request.description,
      category: request.category,
      documentType: request.documentType,
      dueDate: request.dueDate,
      maxParticipants: request.maxParticipants,
    });

    await this.#challengeRequestRepository.updateStatus(requestId, 'APPROVED');

    await this.#notificationRepository.create({
      userId: request.requestedBy,
      type: 'CHALLENGE_APPROVED',
      message: NOTIFICATION_MESSAGES.CHALLENGE_APPROVED(request.title),
    });

    return challenge;
  }

  async rejectRequest(requestId, reason) {
    const request = await this.#challengeRequestRepository.findById(requestId);
    if (!request) throw new NotFoundException(ERROR_MESSAGE.NOT_FOUND);

    await this.#challengeRequestRepository.updateStatus(
      requestId,
      'REJECTED',
      reason,
    );

    await this.#notificationRepository.create({
      userId: request.requestedBy,
      type: 'CHALLENGE_REJECTED',
      message: NOTIFICATION_MESSAGES.CHALLENGE_REJECTED(request.title),
      reason,
    });
  }

  async deleteRequest(requestId, reason) {
    const request = await this.#challengeRequestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundException(ERROR_MESSAGE.NOT_FOUND);
    }

    await this.#challengeRequestRepository.delete(requestId);

    await this.#notificationRepository.create({
      userId: request.requestedBy,
      type: 'ADMIN_ACTION',
      message: NOTIFICATION_MESSAGES.REQUEST_DELETED(request.title),
      reason,
    });
  }

  async banUser(userId, reason) {
    const user = await this.#userRepository.findById(userId);
    if (!user) throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);

    if (user.role === 'MASTER')
      throw new ForbiddenException(ERROR_MESSAGE.CANNOT_BAN_MASTER);

    await this.#userRepository.updateStatus(userId, {
      status: 'BANNED',
      isBanned: true,
    });

    await this.#notificationRepository.create({
      userId,
      type: 'ADMIN_ACTION',
      message: NOTIFICATION_MESSAGES.USER_BANNED,
      reason,
    });
  }

  async adminBlockFeedback(feedbackId, isBlocked) { //블럭처리에는 이유가 아니라 불린으로 처리되서 바꿨씁니다.
    const feedback = await this.#feedbackRepository.findById(feedbackId);
    if (!feedback)
      throw new NotFoundException(ERROR_MESSAGE.FEEDBACK_NOT_FOUND);

    await this.#feedbackRepository.block(feedbackId, isBlocked); //블럭처리에는 이유가 아니라 불린으로 처리되서 바꿨씁니다.

    //블럭처러시만 알림가게 했습니다
    if (isBlocked) {
      await this.#notificationRepository.create({
        userId: feedback.userId,
        type: 'ADMIN_ACTION',
        message: NOTIFICATION_MESSAGES.FEEDBACK_BANNED,
      });
    }
  }
}
