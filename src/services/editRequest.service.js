import { ERROR_MESSAGE, NOTIFICATION_MESSAGES } from '#constants';
import { NotFoundException, BadRequestException } from '#exceptions';

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
    if (!challenge)
      throw new NotFoundException(ERROR_MESSAGE.CHALLENGE_FOR_EDIT_NOT_FOUND);

    if (challenge.status === 'DELETED')
      throw new BadRequestException(ERROR_MESSAGE.CHALLENGE_ALREADY_DELETED);

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
      message: NOTIFICATION_MESSAGES.EDITREQUEST_APPROVED(challenge.title),
      reason: reason,
    });

    return { updatedChallenge, editLog };
  }
}
