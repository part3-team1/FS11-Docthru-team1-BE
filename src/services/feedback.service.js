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

  async createFeedback(user_id, submission_id, content) {
    const submission = await this.#submissionRepository.findById(submission_id);
    if (!submission)
      throw new NotFoundException(ERROR_MESSAGE.SUBMISSION_NOT_FOUND);

    const challenge = await this.#challengeRepository.findById(
      submission.challenge_id,
    );
    if (challenge.status === 'CLOSED')
      throw new BadRequestException(ERROR_MESSAGE.CHALLENGE_ALREADY_FINISHED);

    const feedback = await this.#feedbackRepository.create({
      user_id,
      submission_id,
      content,
    });

    await this.#notificationRepository.create({
      user_id: submission.user_id,
      type: 'FEEDBACK_CREATED',
      message: NOTIFICATION_MESSAGES.FEEDBACK_ADDED(challenge.title),
    });

    return feedback;
  }

  async updateFeedback(user_id, feedback_id, content, userRole) {
    const feedback = await this.#feedbackRepository.findById(feedback_id);
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

    const isOwner = feedback.user_id === userRole.id;
    const isStaff = userRole === 'ADMIN' || userRole === 'MASTER';
    if (!isOwner && !isStaff) {
      throw new ForbiddenException(ERROR_MESSAGE.FEEDBACK_ACCESS_DENIED);
    }

    const updatedFeedback = await this.#feedbackRepository.update(
      feedback_id,
      content,
    );

    if (!isOwner && !isStaff) {
      await this.#notificationRepository.create({
        user_id: feedback.user_id,
        type: 'FEEDBACK_UPDATED',
        message: NOTIFICATION_MESSAGES.FEEDBACK_MODIFIED(challenge.title),
      });
    }

    return updatedFeedback;
  }
}
