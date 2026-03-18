export class ChallengeService {
  #challengeRepository;
  #notificationRepository;

  constructor({ challengeRepository, notificationRepository }) {
    this.#challengeRepository = challengeRepository;
    this.#notificationRepository = notificationRepository;
  }

  async getChallenge(id) {
    const challenge = await this.#challengeRepository.findById(id);
    if (!challenge) throw new Error('챌린지를 찾을 수 없습니다.');

    return challenge;
  }

  async join(userId, challengeId) {
    const challenge =
      await this.#challengeRepository.findById(challengeId);
    if (!challenge) throw new Error('챌린지를 찾을 수 없습니다.');

    if (challenge.status !== 'OPENED')
      throw new Error('지금은 챌린지를 참여할 수 없습니다.');
    if (new Date(challenge.due_date) < new Date())
      throw new Error('챌린지가 마감되었습니다.');
    if (challenge.current_participants >= challenge.max_participants)
      throw new Error('챌린지 인원이 초과되었습니다.');

    const isAlreadyJoined = await this.#challengeRepository.isParticipating(
      userId,
      challengeId,
    );
    if (isAlreadyJoined) {
      throw new Error('이미 참여중인 챌린지입니다.');
    }

    const result = await this.#challengeRepository.join(
      userId,
      challengeId,
    );

    await this.#notificationRepository.create({
      userId: challenge.request.requested_by,
      type: 'ACTIVITY',
      message: challenge.title,
    });

    return result;
  }

  async leave(userId, challengeId) {
    const challenge =
      await this.#challengeRepository.findById(challengeId);
    if (!challenge) throw new Error('챌린지를 찾을 수 없습니다.');

    if (new Date(challenge.due_date) < new Date()) {
      throw new Error('마감된 챌린지는 참여를 취소할 수 없습니다.');
    }

    const isParticipating = await this.#challengeRepository.isParticipating(
      userId,
      challengeId,
    );
    if (!isParticipating) {
      throw new Error('참여 중인 챌린지가 아닙니다.');
    }

    return await this.#challengeRepository.leave(userId, challengeId);
  }
}
