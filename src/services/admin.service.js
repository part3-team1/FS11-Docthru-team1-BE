export class AdminService {
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

  async approveRequest(requestId) {
    const request =
      await this.#challengeRequestRepository.findRequestById(requestId);
    if (!request) throw new Error('리퀘스트를 찾을 수 없습니다.');

    const challenge = await this.#challengeRepository.createChallenge({
      requestId: request.id,
      title: request.title,
      doc_url: request.doc_url,
      description: request.description,
      category: request.category,
      document_type: request.document_type,
      due_date: request.due_date,
      max_participants: request.max_participants,
    });

    await this.#challengeRequestRepository.updateRequestStatus(
      requestId,
      'APPROVED',
    );

    await this.#notificationRepository.createNotification({
      userId: request.requested_by,
      type: 'STATUS',
      message: request.title,
    });

    return challenge;
  }

  async rejectRequest(requestId, reason) {
    const request =
      await this.#challengeRequestRepository.findRequestById(requestId);
    if (!request) throw new Error('리퀘스트를 찾을 수 없습니다.');

    await this.#challengeRequestRepository.updateRequestStatus(
      requestId,
      'REJECTED',
      reason,
    );

    await this.#notificationRepository.createNotification({
      userId: request.requested_by,
      type: 'STATUS',
      message: request.title,
      reason,
    });
  }
}
