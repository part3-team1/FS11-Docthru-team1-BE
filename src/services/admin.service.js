export class AdminService {
  #challengeRepository;
  #challengeRequestRepository;
  #notificationRepository;
  #userRepository;
  #reportRepository;
  #feedbackRepository;
  #submissionRepository;

  constructor({
    challengeRepository,
    challengeRequestRepository,
    notificationRepository,
    userRepository,
    reportRepository,
    feedbackRepository,
    submissionRepository,
  }) {
    this.#challengeRepository = challengeRepository;
    this.#challengeRequestRepository = challengeRequestRepository;
    this.#notificationRepository = notificationRepository;
    this.#userRepository = userRepository;
    this.#reportRepository = reportRepository;
    this.#feedbackRepository = feedbackRepository;
    this.#submissionRepository = submissionRepository;
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

  //유저 강제 정지
  async banUser(userId, reason) {
    const user = await this.#userRepository.findUserById(userId);
    if (!user) throw new Error('유저를 찾을 수 없습니다.');

    await this.#userRepository.updateUserStatus(userId, {
      status: 'BANNED',
      isBanned: true,
    });

    await this.#notificationRepository.createNotification({
      userId,
      type: 'ADMIN',
      message: '운영 정책 위반으로 계정이 정지되었습니다.',
      reason,
    });
  }

  //신고 처리
  async handleReport(reportId, isApproved) {
    const report = await this.#reportRepository.findReportById(reportId);
    if (!report) throw new Error('신고 내역을 찾을 수 없습니다.');

    await this.#reportRepository.updateReportStatus(reportId, isApproved);
    if (isApproved) {
      if (report.report_type === 'FEEDBACK') {
        await this.#feedbackRepository.blockFeedback(report.target_id);
      }

      if (report.report_type === 'USER' && report.target_user_id) {
        await this.banUser(report.target_user_id, report.reason);
      }
    }
  }
}
