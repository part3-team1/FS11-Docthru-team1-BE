import { NOTIFICATION_MESSAGES } from '../common/constants/message.js';

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
    const request = await this.#challengeRequestRepository.findById(requestId);
    if (!request) throw new Error('리퀘스트를 찾을 수 없습니다.');

    const challenge = await this.#challengeRepository.create({
      requestId: request.id,
      title: request.title,
      doc_url: request.doc_url,
      description: request.description,
      category: request.category,
      document_type: request.document_type,
      due_date: request.due_date,
      max_participants: request.max_participants,
    });

    await this.#challengeRequestRepository.updateStatus(requestId, 'APPROVED');

    await this.#notificationRepository.create({
      userId: request.requested_by,
      type: 'CHALLENGE_APPROVED',
      message: NOTIFICATION_MESSAGES.CHALLENGE_APPROVED(request.title),
    });

    return challenge;
  }

  async rejectRequest(requestId, reason) {
    const request = await this.#challengeRequestRepository.findById(requestId);
    if (!request) throw new Error('리퀘스트를 찾을 수 없습니다.');

    await this.#challengeRequestRepository.updateStatus(
      requestId,
      'REJECTED',
      reason,
    );

    await this.#notificationRepository.create({
      userId: request.requested_by,
      type: 'CHALLENGE_REJECTED',
      message: NOTIFICATION_MESSAGES.CHALLENGE_REJECTED(request.title),
      reason,
    });
  }

  //유저 강제 정지
  async banUser(userId, reason) {
    const user = await this.#userRepository.findById(userId);
    if (!user) throw new Error('유저를 찾을 수 없습니다.');

    if (user.role === 'MASTER')
      throw new Error('정지/ 차단할 수 없는 계정입니다.');

    await this.#userRepository.updateStatus(userId, {
      status: 'BANNED',
      isBanned: true,
    });

    await this.#notificationRepository.create({
      userId,
      type: 'ADMIN_ACTION',
      message: NOTIFICATION_MESSAGES.USER_BANNED,
      reason,
    });
  }

  //신고 처리
  async handleReport(reportId, isApproved) {
    const report = await this.#reportRepository.findById(reportId);
    if (!report) throw new Error('신고 내역을 찾을 수 없습니다.');

    await this.#reportRepository.updateStatus(reportId, isApproved);
    if (isApproved) {
      if (report.report_type === 'FEEDBACK') {
        await this.#feedbackRepository.block(report.target_id);

        if (report.target_user_id) {
          await this.#notificationRepository.create({
            userId: report.target_user_id,
            type: 'ADMIN_ACTION',
            message: NOTIFICATION_MESSAGES.FEEDBACK_BANNED,
            reason: report.reason,
          });
        }
      }

      if (report.report_type === 'SUBMISSION') {
        await this.#submissionRepository.delete(report.target_id);

        if (report.target_user_id) {
          await this.#notificationRepository.create({
            userId: report.target_user_id,
            type: 'ADMIN_ACTION',
            message: NOTIFICATION_MESSAGES.SUBMISSION_BANNED,
            reason: report.reason,
          });
        }
      }

      if (report.report_type === 'USER' && report.target_user_id) {
        await this.banUser(report.target_user_id, report.reason);
      }

      await this.#notificationRepository.create({
        userId: report.reporter_id,
        type: 'ADMIN_ACTION',
        message: NOTIFICATION_MESSAGES.REPORT_PROCESSED,
      });
    }
  }
}
