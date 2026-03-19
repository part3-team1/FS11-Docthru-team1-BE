import { validateSort } from '#utils/sort.util.js';
export class ReportRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  create(data) {
    return this.#prisma.report.create({
      data: {
        reporter_id: data.user_id,
        target_user_id: data.target_user_id,
        target_id: data.target_id,
        report_type: data.report_type,
        reason: data.reason,
      },
    });
  }

  //어드민 or 마스터 관련, 페이지네이션 포함
  findAll({
    skip = 0,
    take = 10,
    sortBy,
    sortOrder,
    report_type,
    is_resolved,
  } = {}) {
    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = validateSort({
      sortBy,
      sortOrder,
      allowedFields: ['created_at', 'is_resolved'],
      defaultField: 'created_at',
    });

    const queryOptions = {
      ...(report_type && { report_type }),
      ...(is_resolved !== undefined && { is_resolved }),
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

  updateStatus(id, is_approved) {
    return this.#prisma.report.update({
      where: { id },
      data: {
        is_resolved: true,
        is_approved,
      },
    });
  }

  //중복신고 방지
  checkDuplicate(reporter_id, target_id) {
    return this.#prisma.report.findFirst({
      where: {
        reporter_id,
        target_id,
      },
    });
  }
}
