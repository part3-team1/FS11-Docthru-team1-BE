export class SubmissionService {
  #submissionRepository;
  #heartRepository;
  #userWorkspaceRepository;
  #notificationRepository;

  constructor({
    submissionRepository,
    heartRepository,
    userWorkspaceRepository,
    notificationRepository,
  }) {
    this.#submissionRepository = submissionRepository;
    this.#heartRepository = heartRepository;
    this.#userWorkspaceRepository = userWorkspaceRepository;
    this.#notificationRepository = notificationRepository;
  }

  async submit(userId, challengeId, data) {
    const submission = await this.#submissionRepository.createSubmission({
      userId,
      challengeId,
      title: data.title,
      content: data.content,
    });

    await this.#userWorkspaceRepository.deleteUserWorkspaceByChallenge(
      userId,
      challengeId,
    );

    return submission;
  }

  async toggleHeart(userId, submissionId) {
    const submission =
      await this.#submissionRepository.findSubmissionById(submissionId);
    if (!submission) throw new Error('작업물을 찾을 수 없습니다.');

    const existingHeart = await this.#heartRepository.findHeart(
      userId,
      submissionId,
    );

    if (existingHeart) {
      await this.#heartRepository.deleteHeart(userId, submissionId);
      return { liked: false, heartCount: submission.heart_count - 1 };
    } else {
      await this.#heartRepository.createHeart(userId, submissionId);
    }

    await this.#notificationRepository.createNotification({
      userId: submission.user_id,
      type: 'ACTIVITY',
    });

    return { liked: true, heartCount: submission.heart_count + 1 };
  }
}
