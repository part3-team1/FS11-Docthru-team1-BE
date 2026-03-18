export class ReportRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  createReport(data) {
    return this.#prisma.report.create({
      data: {
        reporter_id: data.userId,
        target_user_id: data.targetUserId,
        target_id: data.targetId,
        target_type: data.targetType,
        reason: data.reason,
      },
    });
  }

  //어드민 or 마스터 관련, 페이지네이션 포함
  findAllReporter({ skip = 0, take = 10, targetType, isResolved } = {}) {
    const queryOptions = {
      ...(targetType && { target_type: targetType }),
      ...(isResolved !== undefined && { is_resolved: isResolved }),
    };

    return this.#prisma
      .$transaction([
        this.#prisma.report.findMany({
          where: queryOptions,
          skip: Number(skip),
          take: Number(take),
          orderBy: { created_at: 'desc' },
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

  findReportById(id) {
    return this.#prisma.report.findUnique({
      where: { id },
      include: {
        reporter: { select: { nickname: true, email: true } },
        target_user: { select: { nickname: true, email: true, status: true } },
      },
    });
  }

  updateReportStatus(id, isApproved) {
    return this.#prisma.report.update({
      where: { id },
      data: {
        is_resolved: true,
        is_approved: isApproved,
      },
    });
  }

  //중복신고 방지
  checkDuplicateReport(reporterId, targetId) {
    return this.#prisma.report.findFirst({
      where: {
        reporter_id: reporterId,
        target_id: targetId,
      },
    });
  }
}
