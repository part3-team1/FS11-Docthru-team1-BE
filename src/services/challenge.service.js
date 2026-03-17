export class ChallengeService {
  #challengeRepository;
  #notificationRepository;

  constructor({ challengeRepository, notificationRepository }) {
    this.#challengeRepository = challengeRepository;
    this.#notificationRepository = notificationRepository;
  }

  async getChallenge(id) {
    const challenge = await this.#challengeRepository.findChallengeById(id);
    if (!challenge) throw new Error('챌린지를 찾을 수 없습니다.');

    return challenge;
  }

  async join(userId, challengeId) {
    const challenge =
      await this.#challengeRepository.findChallengeById(challengeId);
    if (!challenge) throw new Error('챌린지를 찾을 수 없습니다.');

    if (challenge.status !== 'OPENED')
      throw new Error('챌린지를 참여 할 수 없습니다.');
    if (new Date(challenge.due_date) < new Date())
      throw new Error('챌린지가 만료되었습니다.');
    if (challenge.current_participants >= challenge.max_participants)
      throw new Error('챌린지 인원이 모두 찼습니다.');

    const isAlreadyJoined = await this.#challengeRepository.isParticipating(
      userId,
      challengeId,
    );
    if (isAlreadyJoined) {
      throw new Error('이미 참여중인 챌린지입니다.');
    }

    const result = await this.#challengeRepository.joinChallenge(
      userId,
      challengeId,
    );

    await this.#notificationRepository.createNotification({
      userId: challenge.request.request_by,
      type: 'ACTIVITY',
      message: challenge.title,
    });

    return result;
  }
}
