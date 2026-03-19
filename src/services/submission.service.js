export class SubmissionService {
  #submissionRepository;
  #heartRepository;
  #userWorkspaceRepository;
  #challengeRepository;
  #notificationRepository;

  constructor({
    submissionRepository,
    heartRepository,
    userWorkspaceRepository,
    challengeRepository,
    notificationRepository,
  }) {
    this.#submissionRepository = submissionRepository;
    this.#heartRepository = heartRepository;
    this.#userWorkspaceRepository = userWorkspaceRepository;
    this.#challengeRepository = challengeRepository;
    this.#notificationRepository = notificationRepository;
  }

  async submit(userId, challengeId, data) {
    const challenge = await this.#challengeRepository.findById(challengeId);
    if (!challenge) {
      throw new Error('챌린지를 찾을 수 없습니다.');
    }

    if (new Date(challenge.due_date) < new Date()) {
      throw new Error('마감된 챌린지에는 작업물을 제출할 수 없습니다.');
    }

    const submission = await this.#submissionRepository.create({
      userId,
      challengeId,
      title: data.title,
      content: data.content,
    });

    await this.#notificationRepository.create({
      userId: challenge.request.requested_by,
      type: 'SUBMISSION_CREATED',
      message: challenge.title,
    });

    await this.#userWorkspaceRepository.deleteByChallenge(userId, challengeId);

    return submission;
  }

  async toggleHeart(userId, submissionId) {
    const submission = await this.#submissionRepository.findById(submissionId);
    if (!submission) throw new Error('작업물을 찾을 수 없습니다.');

    if (submission.user_id === userId) {
      throw new Error('스스로 1등을 하는것은 옳지 않습니다.');
    }

    const existingHeart = await this.#heartRepository.checkDuplicate(
      userId,
      submissionId,
    );

    if (existingHeart) {
      await this.#heartRepository.delete(userId, submissionId);
      return { liked: false, heartCount: submission.heart_count - 1 };
    } else {
      await this.#heartRepository.create(userId, submissionId);
    }

    await this.#notificationRepository.create({
      userId: submission.user_id,
      type: 'SUBMISSION_UPDATED',
      message: submission.title,
    });

    return { liked: true, heartCount: submission.heart_count + 1 };
  }
}
