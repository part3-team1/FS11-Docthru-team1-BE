import { validateSort } from '#utils/sort.util.js';

export class FeedbackRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  findAllByUserId(userId, { skip = 0, take = 10 } = {}) {
    return this.#prisma
      .$transaction([
        this.#prisma.feedback.findMany({
          where: { userId: userId },
          skip: Number(skip),
          take: Number(take),
          orderBy: { createdAt: 'desc' },
          include: {
            submission: { select: { id: true, title: true } },
          },
        }),
        this.#prisma.feedback.count({ where: { userId: userId } }),
      ])
      .then(([feedbacks, totalCount]) => {
        return { feedbacks, totalCount };
      });
  }

  findAllBySubmissionId(
    submissionId,
    { skip = 0, take = 10, sortBy, sortOrder } = {},
  ) {
    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = validateSort({
      sortBy,
      sortOrder,
      allowedFields: ['createdAt'],
      defaultField: 'createdAt',
    });

    const whereCondition = { submissionId, isBlocked: false };

    return this.#prisma
      .$transaction([
        this.#prisma.feedback.findMany({
          where: whereCondition,
          skip: Number(skip),
          take: Number(take),
          orderBy: { [safeSortBy]: safeSortOrder },
          include: {
            user: { select: { nickname: true, grade: true, status: true } },
          },
        }),
        this.#prisma.feedback.count({
          where: whereCondition,
        }),
      ])
      .then(([feedbacks, totalCount]) => {
        return { feedbacks, totalCount };
      });
  }

  findById(id) {
    return this.#prisma.feedback.findUnique({
      where: { id },
      include: { submission: { select: { challengeId: true } } },
    });
  }

  create(data) {
    return this.#prisma.feedback.create({
      data: {
        submissionId: data.submissionId,
        userId: data.userId,
        content: data.content,
      },
    });
  }

  update(id, content) {
    return this.#prisma.feedback.update({ where: { id }, data: { content } });
  }

  delete(id) {
    return this.#prisma.feedback.delete({ where: { id } });
  }

  block(id, isBlocked = true) {
    return this.#prisma.feedback.update({
      where: { id },
      data: { isBlocked },
    });
  }
}
