import { validateSort } from '#utils/sort.util.js';

export class FeedbackRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  //페이지네이션 포함
  findAllBySubmissionId(
    submission_id,
    { skip = 0, take = 10, sortBy, sortOrder } = {},
  ) {
    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = validateSort({
      sortBy,
      sortOrder,
      allowedFields: ['created_at'],
      defaultField: 'created_at',
    });

    return this.#prisma
      .$transaction([
        this.#prisma.feedback.findMany({
          where: { submission_id },
          skip: Number(skip),
          take: Number(take),
          orderBy: { [safeSortBy]: safeSortOrder },
          include: {
            user: { select: { nickname: true, grade: true, status: true } },
          },
        }),
        this.#prisma.feedback.count({
          where: { submission_id },
        }),
      ])
      .then(([feedbacks, totalCount]) => {
        return { feedbacks, totalCount };
      });
  }

  findById(id) {
    return this.#prisma.feedback.findUnique({
      where: { id },
      include: { submission: { select: { challenge_id: true } } },
    });
  }

  create(data) {
    return this.#prisma.feedback.create({
      data: {
        submission_id: data.submission_id,
        user_id: data.user_id,
        content: data.content,
      },
    });
  }

  update(id, content) {
    return this.#prisma.feedback.update({ where: { id }, data: { content } });
  }

  deleteFeedback(id) {
    return this.#prisma.feedback.delete({ where: { id } });
  }

  block(id, is_blocked = true) {
    return this.#prisma.feedback.update({
      where: { id },
      data: { is_blocked },
    });
  }
}
