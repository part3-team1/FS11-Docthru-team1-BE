import { ERROR_MESSAGE, NOTIFICATION_MESSAGES } from '#constants';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '#exceptions';

export class ChallengeService {
  #challengeRepository;
  #challengeRequestRepository;
  #submissionRepository;
  #notificationRepository;

  constructor({
    challengeRepository,
    challengeRequestRepository,
    submissionRepository,
    notificationRepository,
  }) {
    this.#challengeRepository = challengeRepository;
    this.#challengeRequestRepository = challengeRequestRepository;
    this.#submissionRepository = submissionRepository;
    this.#notificationRepository = notificationRepository;
  }

  async createRequest(userId, data) {
    const request = await this.#challengeRequestRepository.create({
      userId,
      ...data,
    });

    return request;
  }

  async getChallengeRequestById(id) {
    const request = await this.#challengeRequestRepository.findById(id);
    if (!request)
      throw new NotFoundException(ERROR_MESSAGE.CHALLENGE_REQUEST_NOT_FOUND);

    return request;
  }

  async getMyChallengeRequests(userId, query) {
    const result = await this.#challengeRequestRepository.findAllByRequesterId(
      userId,
      query,
    );

    return { items: result.requests, totalCount: result.totalCount };
  }

  async cancelChallengeRequest(userId, requestId) {
    const request = await this.#challengeRequestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundException(ERROR_MESSAGE.CHALLENGE_REQUEST_NOT_FOUND);
    }

    if (request.requestedBy !== userId) {
      throw new ForbiddenException(ERROR_MESSAGE.FORBIDDEN);
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException(ERROR_MESSAGE.CANNOT_CANCLE_REQUEST);
    }

    return await this.#challengeRequestRepository.delete(requestId);
  }

  async getChallenges(query) {
    const result = await this.#challengeRepository.findAll(query);

    return { items: result.challenges, totalCount: result.totalCount };
  }

  async getChallengeById(id, userId = null) {
    const challenge = await this.#challengeRepository.findById(id);
    if (!challenge)
      throw new NotFoundException(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);

    const [participation, submission] = userId
      ? await Promise.all([
          this.#challengeRepository.isParticipating(userId, id),
          this.#submissionRepository.findByUserAndChallenge(userId, id),
        ])
      : [null, null];

    return {
      ...challenge,
      isParticipating: !!participation,
      hasSubmitted: !!submission,
    };
  }

  async getMyChallenges(userId, query) {
    const { participations, totalCount } =
      await this.#challengeRepository.findAllParticipating(userId, query);

    const formattedData = participations.map((p) => {
      const challengeInfo = p.challenge;
      const submissionId =
        challengeInfo.submissions?.length > 0
          ? challengeInfo.submissions[0].id
          : null;

      const { submissions, ...cleanChallengeInfo } = challengeInfo;

      return { ...cleanChallengeInfo, submissionId };
    });

    return { items: formattedData, totalCount };
  }

  async updateChallenge(userId, challengeId, updateData) {
    const challenge = await this.#challengeRepository.findById(challengeId);
    if (!challenge) {
      throw new NotFoundException(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);
    }

    if (challenge.request.requestedBy !== userId) {
      throw new ForbiddenException(ERROR_MESSAGE.FORBIDDEN);
    }

    if (new Date(challenge.dueDate) < new Date()) {
      throw new BadRequestException(ERROR_MESSAGE.CHALLENGE_EXPIRED);
    }

    if (challenge.currentParticipants > 0) {
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

    const isOwner = challenge.request.requestedBy === userId;
    const isStaff = role === 'ADMIN' || role === 'MASTER';

    if (!isOwner && !isStaff) {
      throw new ForbiddenException(ERROR_MESSAGE.FORBIDDEN);
    }

    if (new Date(challenge.dueDate) < new Date()) {
      throw new BadRequestException(ERROR_MESSAGE.CHALLENGE_EXPIRED);
    }

    if (!isOwner && isStaff) {
      await this.#notificationRepository.create({
        userId: challenge.request.requestedBy,
        type: 'ADMIN_ACTION',
        message: NOTIFICATION_MESSAGES.CHALLENGE_DELETED(challenge.title),
      });
    }

    return await this.#challengeRepository.delete(challengeId);
  }

  async join(userId, challengeId) {
    const challenge = await this.#challengeRepository.findById(challengeId);
    if (!challenge)
      throw new NotFoundException(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);

    if (challenge.status !== 'OPENED')
      throw new BadRequestException(ERROR_MESSAGE.CHALLENGE_NOT_OPENED);
    if (new Date(challenge.dueDate) < new Date())
      throw new BadRequestException(ERROR_MESSAGE.CHALLENGE_EXPIRED);
    if (challenge.currentParticipants >= challenge.maxParticipants)
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
      userId: challenge.request.requestedBy,
      type: 'CHALLENGE_PARTICIPATED',
      message: NOTIFICATION_MESSAGES.CHALLENGE_PARTICIPATED(challenge.title),
    });

    return result;
  }

  async leave(userId, challengeId) {
    const challenge = await this.#challengeRepository.findById(challengeId);
    if (!challenge)
      throw new NotFoundException(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);

    if (new Date(challenge.dueDate) < new Date()) {
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
