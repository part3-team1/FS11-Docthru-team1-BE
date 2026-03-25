import { ERROR_MESSAGE, NOTIFICATION_MESSAGES } from '#constants';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '#exceptions';

export class ChallengeService {
  #challengeRepository;
  #challengeRequestRepository;
  #notificationRepository;

  constructor({
    challengeRepository,
    challengeRequestRepository,
    notificationRepository,
  }) {
    this.#challengeRepository = challengeRepository;
    this.#challengeRequestRepository = challengeRequestRepository;
    this.#notificationRepository = notificationRepository;
  }

  async createRequest(userId, data) {
    const request = await this.#challengeRequestRepository.create({
      userId,
      ...data,
    });

    return request;
  }

  async getChallenges(query) {
    return await this.#challengeRepository.findAll(query);
  }

  async getChallengeById(id) {
    const challenge = await this.#challengeRepository.findById(id);
    if (!challenge)
      throw new NotFoundException(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);

    return challenge;
  }

  async updateChallenge(userId, challengeId, updateData) {
    const challenge = await this.#challengeRepository.findById(challengeId);
    if (!challenge) {
      throw new NotFoundException(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);
    }

    if (challenge.request.requested_by !== userId) {
      throw new ForbiddenException(ERROR_MESSAGE.INACTIVE_ACCOUNT);
    }

    if (new Date(challenge.due_date) < new Date()) {
      throw new BadRequestException(ERROR_MESSAGE.CHALLENGE_EXPIRED);
    }

    if (challenge.current_participants > 0) {
      throw new BadRequestException(
        ERROR_MESSAGE.CHALLENGE_EDIT_RESTRICTED_WITH_PARTICIPANTS,
      );
    }

    return await this.#challengeRepository.update(challengeId, updateData);
  }

  async deleteChallenge(userId, challengeId, role) {
    const challenge = await this.#challengeRepository.findById(challengeId);
    if (!challenge) {
      throw new NotFoundException(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);
    }

    const isOwner = challenge.request.requested_by === userId;
    const isStaff = role === 'ADMIN' || role === 'MASTER';

    if (!isOwner && !isStaff) {
      throw new ForbiddenException(ERROR_MESSAGE.INACTIVE_ACCOUNT);
    }

    if (new Date(challenge.due_date) < new Date()) {
      throw new BadRequestException(ERROR_MESSAGE.CHALLENGE_EXPIRED);
    }

    if (!isOwner && isStaff) {
      await this.#notificationRepository.create({
        userId: challenge.request.requested_by,
        type: 'ADMIN_ACTION',
        message: NOTIFICATION_MESSAGES.CHALLENGE_DELETED(challenge.title),
      });
    }
  }

  async join(userId, challengeId) {
    const challenge = await this.#challengeRepository.findById(challengeId);
    if (!challenge)
      throw new NotFoundException(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);

    if (challenge.status !== 'OPENED')
      throw new BadRequestException(ERROR_MESSAGE.CHALLENGE_NOT_OPENED);
    if (new Date(challenge.due_date) < new Date())
      throw new BadRequestException(ERROR_MESSAGE.CHALLENGE_EXPIRED);
    if (challenge.current_participants >= challenge.max_participants)
      throw new BadRequestException(ERROR_MESSAGE.CHALLENGE_FULL);

    const isAlreadyJoined = await this.#challengeRepository.isParticipating(
      userId,
      challengeId,
    );
    if (isAlreadyJoined) {
      throw new BadRequestException(
        ERROR_MESSAGE.ALREADY_PARTICIPATING_CHALLENGE,
      );
    }

    const result = await this.#challengeRepository.join(userId, challengeId);

    await this.#notificationRepository.create({
      userId: challenge.request.requested_by,
      type: 'CHALLENGE_PARTICIPATED',
      message: NOTIFICATION_MESSAGES.CHALLENGE_PARTICIPATED(challenge.title),
    });

    return result;
  }

  async leave(userId, challengeId) {
    const challenge = await this.#challengeRepository.findById(challengeId);
    if (!challenge)
      throw new NotFoundException(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);

    if (new Date(challenge.due_date) < new Date()) {
      throw new BadRequestException(ERROR_MESSAGE.CANNOT_LEAVE_CHALLENGE);
    }

    const isParticipating = await this.#challengeRepository.isParticipating(
      userId,
      challengeId,
    );
    if (!isParticipating) {
      throw new BadRequestException(ERROR_MESSAGE.NOT_PARTICIPATING_CHALLENGE);
    }

    return await this.#challengeRepository.leave(userId, challengeId);
  }
}
