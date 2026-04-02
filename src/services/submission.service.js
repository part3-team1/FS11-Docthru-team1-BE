import { NOTIFICATION_MESSAGES, ERROR_MESSAGE } from '#constants';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '#exceptions';

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

  async submit(userId, challengeId, data) {
    const challenge = await this.#challengeRepository.findById(challengeId);
    if (!challenge) {
      throw new NotFoundException(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);
    }

    if (new Date(challenge.dueDate) < new Date()) {
      throw new BadRequestException(ERROR_MESSAGE.CHALLENGE_ALREADY_CLOSED);
    }

    const existingSubmission =
      await this.#submissionRepository.findByUserAndChallenge(
        userId,
        challengeId,
      );
    if (existingSubmission) {
      throw new BadRequestException(
        '이미 지금 챌린지에 작업물을 제출하였습니다.',
      );
    }

    const submission = await this.#submissionRepository.create({
      userId,
      challengeId,
      title: data.title,
      content: data.content,
    });

    await this.#notificationRepository.create({
      userId: challenge.request.requestedBy,
      type: 'SUBMISSION_CREATED',
      message: NOTIFICATION_MESSAGES.SUBMISSION_ADDED(challenge.title),
    });

    await this.#draftRepository.deleteByChallenge(userId, challengeId);

    return submission;
  }

  async getMySubmissions(userId, query) {
    const result = await this.#submissionRepository.findAllByUserId(
      userId,
      query,
    );

    return { items: result.submissions, totalCount: result.totalCount };
  }

  async getSubmissionsByChallenge(challengeId, query) {
    return await this.#submissionRepository.findAllByChallengeId(
      challengeId,
      query,
    );
  }

  async getSubmissionById(id, userId = null) {
    const submission = await this.#submissionRepository.findById(id);

    if (!submission || submission.isDeleted || submission.isBlocked) {
      throw new NotFoundException(ERROR_MESSAGE.SUBMISSION_NOT_FOUND);
    }

    const existingHeart = await this.#heartRepository.checkDuplicate(
      userId,
      id,
    );
    const isHearted = userId ? !!existingHeart : false;

    return { ...submission, isHearted };
  }

  async getTopRankings(challengeId, limit) {
    return await this.#submissionRepository.findTopRankings(challengeId, limit);
  }

  async updateSubmission(userId, submissionId, updateData) {
    const submission = await this.#submissionRepository.findById(submissionId);
    if (!submission || submission.isDeleted || submission.isBlocked) {
      throw new NotFoundException(ERROR_MESSAGE.SUBMISSION_NOT_FOUND);
    }

    const isOwner = submission.userId === userId;
    if (!isOwner) {
      throw new ForbiddenException(ERROR_MESSAGE.SUBMISSION_ACCESS_DENIED);
    }

    return await this.#submissionRepository.update(submissionId, updateData);
  }

  async deleteSubmission(userId, submissionId, role) {
    const submission = await this.#submissionRepository.findById(submissionId);
    if (!submission || submission.isDeleted) {
      throw new NotFoundException(ERROR_MESSAGE.SUBMISSION_NOT_FOUND);
    }

    const isOwner = submission.userId === userId;
    const isStaff = role === 'ADMIN' || role === 'MASTER';
    if (!isOwner && !isStaff) {
      throw new ForbiddenException(ERROR_MESSAGE.SUBMISSION_ACCESS_DENIED);
    }

    await this.#notificationRepository.create({
      userId: submission.userId,
      type: 'ADMIN_ACTION',
      message: isOwner
        ? NOTIFICATION_MESSAGES.SUBMISSION_DELETED(submission.title)
        : NOTIFICATION_MESSAGES.SUBMISSION_BANNED(submission.title),
    });

    return await this.#submissionRepository.delete(submissionId);
  }

  async toggleHeart(userId, submissionId) {
    const submission = await this.#submissionRepository.findById(submissionId);
    if (!submission)
      throw new NotFoundException(ERROR_MESSAGE.SUBMISSION_NOT_FOUND);

    if (submission.userId === userId) {
      throw new BadRequestException(ERROR_MESSAGE.CANNOT_LIKE_OWN_SUBMISSION);
    }

    const existingHeart = await this.#heartRepository.checkDuplicate(
      userId,
      submissionId,
    );

    if (existingHeart) {
      await this.#heartRepository.delete(userId, submissionId);
      return { liked: false, heartCount: submission.heartCount - 1 };
    } else {
      await this.#heartRepository.create(userId, submissionId);
    }

    await this.#notificationRepository.create({
      userId: submission.userId,
      type: 'SUBMISSION_UPDATED',
      message: NOTIFICATION_MESSAGES.HEART_TOGGLED,
    });

    return { liked: true, heartCount: submission.heartCount + 1 };
  }
}
