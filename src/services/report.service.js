import { BAN_COUNT, ERROR_MESSAGE, NOTIFICATION_MESSAGES } from '#constants';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '#exceptions';

export class ReportService {
  #reportRepository;
  #submissionRepository;
  #feedbackRepository;
  #challengeRepository;
  #notificationRepository;

  constructor({
    reportRepository,
    submissionRepository,
    feedbackRepository,
    challengeRepository,
    notificationRepository,
  }) {
    this.#reportRepository = reportRepository;
    this.#submissionRepository = submissionRepository;
    this.#feedbackRepository = feedbackRepository;
    this.#challengeRepository = challengeRepository;
    this.#notificationRepository = notificationRepository;
  }

  async getReports(query) {
    return await this.#reportRepository.findAll(query);
  }

  async getReportById(id) {
    const report = await this.#reportRepository.findById(id);
    if (!report) throw new NotFoundException(ERROR_MESSAGE.REPORT_NOT_FOUND);

    return report;
  }

  async createReport(userId, data) {
    const { reportType, targetId, reason } = data;

    const isDuplicate = await this.#reportRepository.checkDuplicate(
      userId,
      targetId,
    );
    if (isDuplicate) {
      throw new ConflictException(ERROR_MESSAGE.REPORT_ALREADY_EXISTS);
    }

    const repoMap = {
      CHALLENGE: this.#challengeRepository,
      SUBMISSION: this.#submissionRepository,
      FEEDBACK: this.#feedbackRepository,
    };

    const targetRepo = repoMap[reportType];
    if (!targetRepo) {
      throw new BadRequestException(ERROR_MESSAGE.INVALID_REPORT_TARGET_TYPE);
    }

    const targetData = await targetRepo.findById(targetId);
    if (!targetData) {
      throw new NotFoundException(ERROR_MESSAGE.REPORT_TARGET_NOT_FOUND);
    }

    const targetUserId = targetData.userId || targetData.request?.requestedBy;

    const report = await this.#reportRepository.create({
      userId,
      targetUserId,
      targetId,
      reportType,
      reason,
    });

    await this.#handleAutoAction(
      reportType,
      targetId,
      targetUserId,
      targetData.title,
    );

    return report;
  }

  async #handleAutoAction(reportType, targetId, targetUserId, targetTitle) {
    const reportCount = await this.#reportRepository.countByTarget(targetId);

    if (reportCount >= BAN_COUNT) {
      if (reportType === 'CHALLENGE') {
        await this.#challengeRepository.delete(targetId);
      } else if (reportType === 'SUBMISSION') {
        await this.#submissionRepository.updateBlockStatus(targetId, true);
      } else if (reportType === 'FEEDBACK') {
        await this.#feedbackRepository.block(targetId, true);
      }

      if (targetUserId) {
        await this.#notificationRepository.create({
          userId: targetUserId,
          type: 'ADMIN_ACTION',
          message: NOTIFICATION_MESSAGES.AUTO_BLOCKED(targetTitle || '콘텐츠'),
          reason: '신고 누적으로 인한 자동 차단',
        });
      }
    }
  }
}
