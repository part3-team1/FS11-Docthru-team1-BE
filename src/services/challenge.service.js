import { ERROR_MESSAGE, NOTIFICATION_MESSAGES } from '#constants';
import { NotFoundException, BadRequestException } from '#exceptions';

export class ChallengeService {
  #challengeRepository;
  #notificationRepository;

  constructor({ challengeRepository, notificationRepository }) {
    this.#challengeRepository = challengeRepository;
    this.#notificationRepository = notificationRepository;
  }

  async getChallenge(id) {
    const challenge = await this.#challengeRepository.findById(id);
    if (!challenge)
      throw new NotFoundException(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);

    return challenge;
  }

  async join(user_id, challenge_id) {
    const challenge = await this.#challengeRepository.findById(challenge_id);
    if (!challenge)
      throw new NotFoundException(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);

    if (challenge.status !== 'OPENED')
      throw new BadRequestException(ERROR_MESSAGE.CHALLENGE_NOT_OPENED);
    if (new Date(challenge.due_date) < new Date())
      throw new BadRequestException(ERROR_MESSAGE.CHALLENGE_EXPIRED);
    if (challenge.current_participants >= challenge.max_participants)
      throw new BadRequestException(ERROR_MESSAGE.CHALLENGE_FULL);

    const isAlreadyJoined = await this.#challengeRepository.isParticipating(
      user_id,
      challenge_id,
    );
    if (isAlreadyJoined) {
      throw new BadRequestException(
        ERROR_MESSAGE.ALREADY_PARTICIPATING_CHALLENGE,
      );
    }

    const result = await this.#challengeRepository.join(user_id, challenge_id);

    await this.#notificationRepository.create({
      user_id: challenge.request.requested_by,
      type: 'CHALLENGE_PARTICIPATED',
      message: NOTIFICATION_MESSAGES.CHALLENGE_PARTICIPATED(challenge.title),
    });

    return result;
  }

  async leave(user_id, challenge_id) {
    const challenge = await this.#challengeRepository.findById(challenge_id);
    if (!challenge)
      throw new NotFoundException(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);

    if (new Date(challenge.due_date) < new Date()) {
      throw new BadRequestException(ERROR_MESSAGE.CANNOT_LEAVE_CHALLENGE);
    }

    const isParticipating = await this.#challengeRepository.isParticipating(
      user_id,
      challenge_id,
    );
    if (!isParticipating) {
      throw new BadRequestException(ERROR_MESSAGE.NOT_PARTICIPATING_CHALLENGE);
    }

    return await this.#challengeRepository.leave(user_id, challenge_id);
  }
}
