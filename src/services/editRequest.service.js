import { NOTIFICATION_MESSAGES } from '#constants/message.js';

export class EditRequestService {
  #editRequestRepository;
  #challengeRepository;
  #notificationRepository;

  constructor({
    editRequestRepository,
    challengeRepository,
    notificationRepository,
  }) {
    this.#editRequestRepository = editRequestRepository;
    this.#challengeRepository = challengeRepository;
    this.#notificationRepository = notificationRepository;
  }

  async createEditRequest(admin_id, challenge_id, updateData, reason) {
    const challenge = await this.#challengeRepository.findById(challenge_id);
    if (!challenge) throw new Error('수정할 챌린지를 찾을 수 없습니다.');

    if (challenge.status === 'DELETED')
      throw new Error('이미 삭제된 챌린지입니다.');

    const editLog = await this.#editRequestRepository.create({
      challenge_id,
      user_id: admin_id,
      reason: reason,
      change_content: updateData,
      status: 'APPROVED',
    });

    const updatedChallenge = await this.#challengeRepository.update(
      challenge_id,
      updateData,
    );

    await this.#notificationRepository.create({
      user_id: challenge.request.requested_by,
      type: 'ADMIN_ACTION',
      message: NOTIFICATION_MESSAGES.EDITREQUEST_APPROVED,
      reason: reason,
    });

    return { updatedChallenge, editLog };
  }
}
