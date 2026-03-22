import { NOTIFICATION_MESSAGES } from '#constants/message.js';
import { ERROR_MESSAGE } from '#constants/error.js';
import { NotFoundException, BadRequestException } from '#exceptions';

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
      throw new NotFoundException(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);
    }

    if (new Date(challenge.due_date) < new Date()) {
      throw new BadRequestException(ERROR_MESSAGE.CHALLENGE_ALREADY_CLOSED);
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
    if (!submission)
      throw new NotFoundException(ERROR_MESSAGE.SUBMISSION_NOT_FOUND);

    if (submission.user_id === user_id) {
      throw new BadRequestException(ERROR_MESSAGE.CANNOT_LIKE_OWN_SUBMISSION);
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
