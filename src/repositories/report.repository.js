import { validateSort } from '#utils/sort.util.js';
export class ReportRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  create(data) {
    return this.#prisma.report.create({
      data: {
        reporterId: data.userId,
        targetUserId: data.targetUserId,
        targetId: data.targetId,
        reportType: data.reportType,
        reason: data.reason,
      },
    });
  }

  //어드민 or 마스터 관련, 페이지네이션 포함
  findAll({ skip = 0, take = 10, sortBy, sortOrder, reportType } = {}) {
    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = validateSort({
      sortBy,
      sortOrder,
      allowedFields: ['createdAt'],
      defaultField: 'createdAt',
    });

    const queryOptions = {
      ...(reportType && { reportType: reportType }),
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
            targetUser: { select: { nickname: true, status: true } },
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
        targetUser: { select: { nickname: true, email: true, status: true } },
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
      where: { reporterId, targetId },
    });
  }
}
