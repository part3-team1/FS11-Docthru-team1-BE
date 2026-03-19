export class EditRequestService {
  #editRequestRepository;
  #challengeRepository;
  #notificationRepository;

  constructor(
    editRequestRepository,
    challengeRepository,
    notificationRepository,
  ) {
    this.#editRequestRepository = editRequestRepository;
    this.#challengeRepository = challengeRepository;
    this.#notificationRepository = notificationRepository;
  }

  async createEditRequest(adminId, challengeId, updateData, reason) {
    const challenge = await this.#challengeRepository.findById(challengeId);
    if (!challenge) throw new Error('수정할 챌린지를 찾을 수 없습니다.');

    if (challenge.status === 'DELETED')
      throw new Error('이미 삭제된 챌린지입니다.');

    const editLog = await this.#editRequestRepository.create({
      challenge_id: challengeId,
      user_id: adminId,
      reason: reason,
      change_content: updateData,
      sttus: 'APPROVED',
    });

    const updatedChallenge = await this.#challengeRepository.update(
      challengeId,
      updateData,
    );

    await this.#notificationRepository.create({
      userId: challenge.request.requested_by,
      type: 'ADMIN_ACTION',
      message: challenge.title,
      reason: reason,
    });

    return { updatedChallenge, editLog };
  }
}
