import { ERROR_MESSAGE, NOTIFICATION_MESSAGES } from '#constants';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '#exceptions';

export class FeedbackService {
  #feedbackRepository;
  #submissionRepository;
  #challengeRepository;
  #notificationRepository;

  constructor({
    feedbackRepository,
    submissionRepository,
    challengeRepository,
    notificationRepository,
  }) {
    this.#feedbackRepository = feedbackRepository;
    this.#submissionRepository = submissionRepository;
    this.#challengeRepository = challengeRepository;
    this.#notificationRepository = notificationRepository;
  }

  async getFeedbacksBySubmission(submissionId, query) {
    return await this.#feedbackRepository.findAllBySubmissionId(
      submissionId,
      query,
    );
  }

  async createFeedback(userId, submissionId, content) {
    const submission = await this.#submissionRepository.findById(submissionId);
    if (!submission)
      throw new NotFoundException(ERROR_MESSAGE.SUBMISSION_NOT_FOUND);

    const challenge = await this.#challengeRepository.findById(
      submission.challenge_id,
    );
    if (challenge.status === 'CLOSED')
      throw new BadRequestException(ERROR_MESSAGE.CHALLENGE_ALREADY_FINISHED);

    const feedback = await this.#feedbackRepository.create({
      userId,
      submissionId,
      content,
    });

    await this.#notificationRepository.create({
      userId: submission.user_id,
      type: 'FEEDBACK_CREATED',
      message: NOTIFICATION_MESSAGES.FEEDBACK_ADDED(challenge.title),
    });

    return feedback;
  }

  async updateFeedback(userId, feedbackId, content, role) {
    const feedback = await this.#feedbackRepository.findById(feedbackId);
    if (!feedback)
      throw new NotFoundException(ERROR_MESSAGE.FEEDBACK_NOT_FOUND);

    const submission = await this.#submissionRepository.findById(
      feedback.submission_id,
    );
    const challenge = await this.#challengeRepository.findById(
      submission.challenge_id,
    );
    if (challenge.status === 'CLOSED')
      throw new BadRequestException(ERROR_MESSAGE.CHALLENGE_ALREADY_FINISHED);

    const isOwner = feedback.user_id === userId;
    const isStaff = role === 'ADMIN' || role === 'MASTER';
    if (!isOwner && !isStaff) {
      throw new ForbiddenException(ERROR_MESSAGE.FEEDBACK_ACCESS_DENIED);
    }

    const updatedFeedback = await this.#feedbackRepository.update(
      feedbackId,
      content,
    );

    if (!isOwner && isStaff) {
      await this.#notificationRepository.create({
        userId: feedback.user_id,
        type: 'FEEDBACK_UPDATED',
        message: NOTIFICATION_MESSAGES.FEEDBACK_MODIFIED(challenge.title),
      });
    }

    return updatedFeedback;
  }

  async deleteFeedback(userId, feedbackId, role) {
    const feedback = await this.#feedbackRepository.findById(feedbackId);
    if (!feedback)
      throw new NotFoundException(ERROR_MESSAGE.FEEDBACK_NOT_FOUND);

    const isOwner = feedback.user_id === userId;
    const isStaff = role === 'ADMIN' || role === 'MASTER';
    if (!isOwner && !isStaff)
      throw new ForbiddenException(ERROR_MESSAGE.FEEDBACK_ACCESS_DENIED);

    if (!isOwner && isStaff) {
      await this.#notificationRepository.create({
        userId: feedback.user_id,
        type: 'ADMIN_ACTION',
        message: NOTIFICATION_MESSAGES.FEEDBACK_DELETED,
      });
    }

    return await this.#feedbackRepository.delete(feedbackId);
  }
}
