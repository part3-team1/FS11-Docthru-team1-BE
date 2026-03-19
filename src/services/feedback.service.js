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

  async createFeedback(userId, submissionId, content) {
    const submission = await this.#submissionRepository.findById(submissionId);
    if (!submission) throw new Error('작업물을 찾을 수 없습니다.');

    const challenge = await this.#challengeRepository.findById(
      submission.challenge_id,
    );
    if (challenge.status === 'CLOSED')
      throw new Error('이미 완료된 챌린지입니다.');

    const feedback = await this.#feedbackRepository.create({
      userId,
      submissionId,
      content,
    });

    await this.#notificationRepository.create({
      userId: submission.user_id,
      type: 'FEEDBACK_CREATED',
      message: submission.title,
    });

    return feedback;
  }

  async updatedFeedback(userId, feedbackId, content, userRole) {
    const feedback = await this.#feedbackRepository.findById(feedbackId);
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
      feedback.user_id !== userId &&
      userRole !== 'ADMIN' &&
      userRole !== 'MASTER'
    ) {
      throw new Error('수정 권한이 없습니다.');
    }

    const updatedFeedback = await this.#feedbackRepository.update(feedbackId, {
      content,
    });

    if (feedback.user_id !== userId && userRole === 'ADMIN') {
      await this.#notificationRepository.create({
        userId: feedback.user_id,
        type: 'FEEDBACK_UPDATED',
      });
    }

    return updatedFeedback;
  }
}
