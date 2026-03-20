import { NOTIFICATION_MESSAGES } from '#constants/message.js';

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
    if (!submission) throw new Error('작업물을 찾을 수 없습니다.');

    const challenge = await this.#challengeRepository.findById(
      submission.challenge_id,
    );
    if (challenge.status === 'CLOSED')
      throw new Error('이미 완료된 챌린지입니다.');

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
    if (!feedback) throw new Error('댓글을 찾을 수 없습니다.');

    const submission = await this.#submissionRepository.findById(
      feedback.submission_id,
    );
    const challenge = await this.#challengeRepository.findById(
      submission.challenge_id,
    );
    if (challenge.status === 'CLOSED')
      throw new Error('이미 완료된 챌린지입니다.');

    if (
      feedback.user_id !== user_id &&
      userRole !== 'ADMIN' &&
      userRole !== 'MASTER'
    ) {
      throw new Error('수정 권한이 없습니다.');
    }

    const updatedFeedback = await this.#feedbackRepository.update(
      feedback_id,
      content,
    );

    if (
      feedback.user_id !== user_id &&
      (userRole === 'ADMIN' || userRole === 'MASTER')
    ) {
      await this.#notificationRepository.create({
        user_id: feedback.user_id,
        type: 'FEEDBACK_UPDATED',
        message: NOTIFICATION_MESSAGES.FEEDBACK_MODIFIED(challenge.title),
      });
    }

    return updatedFeedback;
  }
}
