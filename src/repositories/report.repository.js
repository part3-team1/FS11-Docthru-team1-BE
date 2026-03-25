import { validateSort } from '#utils/sort.util.js';
export class ReportRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  create(data) {
    return this.#prisma.report.create({
      data: {
        reporter_id: data.userId,
        target_user_id: data.targetUserId,
        target_id: data.targetId,
        report_type: data.reportType,
        reason: data.reason,
      },
    });
  }

  //어드민 or 마스터 관련, 페이지네이션 포함
  findAll({ skip = 0, take = 10, sortBy, sortOrder, reportType } = {}) {
    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = validateSort({
      sortBy,
      sortOrder,
      allowedFields: ['created_at'],
      defaultField: 'created_at',
    });

    const queryOptions = {
      ...(reportType && { report_type:reportType }),
    };

    return this.#prisma
      .$transaction([
        this.#prisma.report.findMany({
          where: queryOptions,
          skip: Number(skip),
          take: Number(take),
          orderBy: { [safeSortBy]: safeSortOrder },
          include: {
            reporter: { select: { nickname: true } },
            target_user: { select: { nickname: true, status: true } },
          },
        }),
        this.#prisma.report.count({
          where: queryOptions,
        }),
      ])
      .then(([reports, totalCount]) => {
        return { reports, totalCount };
      });
  }

  findById(id) {
    return this.#prisma.report.findUnique({
      where: { id },
      include: {
        reporter: { select: { nickname: true, email: true } },
        target_user: { select: { nickname: true, email: true, status: true } },
      },
    });
  }

  //신고 누적 카운트
  countByTarget(targetId) {
    return this.#prisma.report.count({
      where: { targetId },
    });
  }

  //중복신고 방지
  checkDuplicate(reporterId, targetId) {
    return this.#prisma.report.findFirst({
      where: {
        reporterId,
        targetId,
      },
    });
  }
}
