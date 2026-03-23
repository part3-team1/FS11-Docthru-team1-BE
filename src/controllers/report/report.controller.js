import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { authenticate, validate } from '#middlewares';
import { reportSchema } from '#schemas/validation.schema.js';

export class ReportController extends BaseController {
  #reportService;

  constructor({ reportService }) {
    super();
    this.#reportService = reportService;
  }

  routes() {
    this.router.get('/', authenticate, (req, res, next) =>
      this.getReports(req, res, next),
    );
    this.router.get('/:id', authenticate, (req, res, next) =>
      this.getReportById(req, res, next),
    );
    this.router.post(
      '/',
      authenticate,
      validate('body', reportSchema),
      (req, res, next) => this.createReport(req, res, next),
    );

    return this.router;
  }

  async getReports(req, res, next) {
    try {
      const { skip, take, sortBy, sortOrder, reportType } = req.query;
      const result = await this.#reportService.getReports({
        skip,
        take,
        sortBy,
        sortOrder,
        reportType,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { reports: result.reports, totalCount: result.totalCount },
      });
    } catch (error) {
      next(error);
    }
  }

  async getReportById(req, res, next) {
    try {
      const { id } = req.params;
      const report = await this.#reportService.getReportById(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  async createReport(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { reportType, targetId, reason } = req.body;

      const report = await this.#reportService.createReport(userId, {
        reportType,
        targetId,
        reason,
      });

      res.status(HTTP_STATUS.CREATED).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }
}
