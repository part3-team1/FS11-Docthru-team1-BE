import { NOTIFICATION_MESSAGES } from '../common/constants/message.js';
import { NotFoundException, ForbiddenException } from '#exceptions';
import { ERROR_MESSAGE } from '#constants/error.js';

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

  async approveRequest(request_id) {
    const request = await this.#challengeRequestRepository.findById(request_id);
    if (!request) throw new NotFoundException(ERROR_MESSAGE.NOT_FOUND);

    const challenge = await this.#challengeRepository.create({
      request_id: request.id,
      title: request.title,
      doc_url: request.doc_url,
      description: request.description,
      category: request.category,
      document_type: request.document_type,
      due_date: request.due_date,
      max_participants: request.max_participants,
    });

    await this.#challengeRequestRepository.updateStatus(request_id, 'APPROVED');

    await this.#notificationRepository.create({
      user_id: request.requested_by,
      type: 'CHALLENGE_APPROVED',
      message: NOTIFICATION_MESSAGES.CHALLENGE_APPROVED(request.title),
    });

    return challenge;
  }

  async rejectRequest(request_id, reason) {
    const request = await this.#challengeRequestRepository.findById(request_id);
    if (!request) throw new NotFoundException(ERROR_MESSAGE.NOT_FOUND);

    await this.#challengeRequestRepository.updateStatus(
      request_id,
      'REJECTED',
      reason,
    );

    await this.#notificationRepository.create({
      user_id: request.requested_by,
      type: 'CHALLENGE_REJECTED',
      message: NOTIFICATION_MESSAGES.CHALLENGE_REJECTED(request.title),
      reason,
    });
  }

  //유저 강제 정지
  async banUser(user_id, reason) {
    const user = await this.#userRepository.findById(user_id);
    if (!user) throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);

    if (user.role === 'MASTER')
      throw new ForbiddenException(ERROR_MESSAGE.CANNOT_BAN_MASTER);

    await this.#userRepository.updateStatus(user_id, {
      status: 'BANNED',
      is_banned: true,
    });

    await this.#notificationRepository.create({
      user_id,
      type: 'ADMIN_ACTION',
      message: NOTIFICATION_MESSAGES.USER_BANNED,
      reason,
    });
  }

  //어드민의 수동 삭제
  async adminDeleteSubmission(submission_id, reason) {
    const submission = await this.#submissionRepository.findById(submission_id);
    if (!submission)
      throw new NotFoundException(ERROR_MESSAGE.SUBMISSION_NOT_FOUND);

    await this.#notificationRepository.create({
      user_id: submission.user_id,
      type: 'ADMIN_ACTION',
      message: NOTIFICATION_MESSAGES.SUBMISSION_BANNED(submission.title),
      reason,
    });

    await this.#submissionRepository.delete(submission_id);
  }

  //어드민의 수동 댓글 차단
  async adminBlockFeedback(feedback_id, reason) {
    const feedback = await this.#feedbackRepository.findById(feedback_id);
    if (!feedback)
      throw new NotFoundException(ERROR_MESSAGE.FEEDBACK_NOT_FOUND);

    await this.#feedbackRepository.block(feedback_id, true);

    await this.#notificationRepository.create({
      user_id: feedback.user_id,
      type: 'ADMIN_ACTION',
      message: NOTIFICATION_MESSAGES.FEEDBACK_BANNED,
      reason,
    });
  }
}
