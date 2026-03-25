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
  #submissionRepository;

  constructor({
    challengeRepository,
    challengeRequestRepository,
    notificationRepository,
    userRepository,
    feedbackRepository,
    submissionRepository,
  }) {
    this.#challengeRepository = challengeRepository;
    this.#challengeRequestRepository = challengeRequestRepository;
    this.#notificationRepository = notificationRepository;
    this.#userRepository = userRepository;
    this.#feedbackRepository = feedbackRepository;
    this.#submissionRepository = submissionRepository;
  }

  //유저 서비스에도 어드민 로직이 있습니다. 확인해주세요!
  //챌린지, 피드백, 서브미션 수정/삭제/차단은 각 서비스 로직 확인.
  async approveRequest(requestId) {
    const request = await this.#challengeRequestRepository.findById(requestId);
    if (!request) throw new NotFoundException(ERROR_MESSAGE.NOT_FOUND);

    if (request.status === 'APPROVED') {
      throw new ConflictException(ERROR_MESSAGE.ALREADY_APPROVED);
    }

    const challenge = await this.#challengeRepository.create({
      requestId: request.id,
      title: request.title,
      docUrl: request.doc_url,
      description: request.description,
      category: request.category,
      documentType: request.document_type,
      dueDate: request.due_date,
      maxParticipants: request.max_participants,
    });

    await this.#challengeRequestRepository.updateStatus(requestId, 'APPROVED');

    await this.#notificationRepository.create({
      userId: request.requested_by,
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
      userId: request.requested_by,
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
      userId: request.requested_by,
      type: 'ADMIN_ACTION',
      message: NOTIFICATION_MESSAGES.REQUEST_DELETED(request.title),
      reason,
    });
  }

  //유저 강제 정지
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

  //어드민의 수동 댓글 차단
  async adminBlockFeedback(feedbackId, reason) {
    const feedback = await this.#feedbackRepository.findById(feedbackId);
    if (!feedback)
      throw new NotFoundException(ERROR_MESSAGE.FEEDBACK_NOT_FOUND);

    await this.#feedbackRepository.block(feedbackId, true);

    await this.#notificationRepository.create({
      userId: feedback.user_id,
      type: 'ADMIN_ACTION',
      message: NOTIFICATION_MESSAGES.FEEDBACK_BANNED,
      reason,
    });
  }
}
