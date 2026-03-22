import { BAN_COUNT, ERROR_MESSAGE } from '#constants';
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

  constructor({
    reportRepository,
    submissionRepository,
    feedbackRepository,
    challengeRepository,
  }) {
    this.#reportRepository = reportRepository;
    this.#submissionRepository = submissionRepository;
    this.#feedbackRepository = feedbackRepository;
    this.#challengeRepository = challengeRepository;
  }

  async createReport(user_id, data) {
    const { report_type, target_id, reason } = data;

    const isDuplicate = await this.#reportRepository.checkDuplicate(
      user_id,
      target_id,
    );
    if (isDuplicate) {
      throw new ConflictException(ERROR_MESSAGE.REPORT_ALREADY_EXISTS);
    }

    const repoMap = {
      CHALLENGE: this.#challengeRepository,
      SUBMISSION: this.#submissionRepository,
      FEEDBACK: this.#feedbackRepository,
    };

    const targetRepo = repoMap[report_type];
    if (!targetRepo) {
      throw new BadRequestException(ERROR_MESSAGE.INVALID_REPORT_TARGET_TYPE);
    }

    const targetData = await targetRepo.findById(target_id);
    if (!targetData) {
      throw new NotFoundException(ERROR_MESSAGE.REPORT_TARGET_NOT_FOUND);
    }

    const target_user_id =
      targetData.user_id || targetData.request?.requested_by;

    const report = await this.#reportRepository.create({
      user_id,
      target_user_id,
      target_id,
      report_type,
      reason,
    });

    await this.#handleAutoAction(report_type, target_id);

    return report;
  }

  async #handleAutoAction(report_type, target_id) {
    const reportCount = await this.#reportRepository.countByTarget(target_id);

    if (reportCount >= BAN_COUNT) {
      if (report_type === 'CHALLENGE') {
        await this.#challengeRepository.delete(target_id);
      } else if (report_type === 'SUBMISSION') {
        await this.#submissionRepository.updateBlockStatus(target_id, true);
      } else if (report_type === 'FEEDBACK') {
        await this.#feedbackRepository.block(target_id, true);
      }
    }
  }
}
