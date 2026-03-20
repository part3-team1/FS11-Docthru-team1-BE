import { NOTIFICATION_MESSAGES } from '#constants/message.js';

export class SubmissionService {
  #submissionRepository;
  #heartRepository;
  #draftRepository;
  #challengeRepository;
  #notificationRepository;

  constructor({
    submissionRepository,
    heartRepository,
    draftRepository,
    challengeRepository,
    notificationRepository,
  }) {
    this.#submissionRepository = submissionRepository;
    this.#heartRepository = heartRepository;
    this.#draftRepository = draftRepository;
    this.#challengeRepository = challengeRepository;
    this.#notificationRepository = notificationRepository;
  }

  async submit(user_id, challenge_id, data) {
    const challenge = await this.#challengeRepository.findById(challenge_id);
    if (!challenge) {
      throw new Error('챌린지를 찾을 수 없습니다.');
    }

    if (new Date(challenge.due_date) < new Date()) {
      throw new Error('마감된 챌린지에는 작업물을 제출할 수 없습니다.');
    }

    const submission = await this.#submissionRepository.create({
      user_id,
      challenge_id,
      title: data.title,
      content: data.content,
    });

    await this.#notificationRepository.create({
      user_id: challenge.request.requested_by,
      type: 'SUBMISSION_CREATED',
      message: NOTIFICATION_MESSAGES.SUBMISSION_ADDED(challenge.title),
    });

    await this.#draftRepository.deleteByChallenge(user_id, challenge_id);

    return submission;
  }

  async toggleHeart(user_id, submission_id) {
    const submission = await this.#submissionRepository.findById(submission_id);
    if (!submission) throw new Error('작업물을 찾을 수 없습니다.');

    if (submission.user_id === user_id) {
      throw new Error('스스로 1등을 하는것은 옳지 않습니다.');
    }

    const existingHeart = await this.#heartRepository.checkDuplicate(
      user_id,
      submission_id,
    );

    if (existingHeart) {
      await this.#heartRepository.delete(user_id, submission_id);
      return { liked: false, heart_count: submission.heart_count - 1 };
    } else {
      await this.#heartRepository.create(user_id, submission_id);
    }

    await this.#notificationRepository.create({
      user_id: submission.user_id,
      type: 'SUBMISSION_UPDATED',
      message: NOTIFICATION_MESSAGES.HEART_TOGGLED,
    });

    return { liked: true, heart_count: submission.heart_count + 1 };
  }
}
