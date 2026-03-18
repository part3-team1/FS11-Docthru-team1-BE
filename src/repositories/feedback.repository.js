export class FeedbackRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  //페이지네이션 포함
  findAllBySubmissionId(submissionId, { skip = 0, take = 10 } = {}) {
    return this.#prisma
      .$transaction([
        this.#prisma.feedback.findMany({
          where: { submission_id: submissionId },
          skip: Number(skip),
          take: Number(take),
          orderBy: { created_at: 'desc' },
          include: {
            user: { select: { nickname: true, grade: true, status: true } },
          },
        }),
        this.#prisma.feedback.count({
          where: { submission_id: submissionId },
        }),
      ])
      .then(([feedbacks, totalCount]) => {
        return { feedbacks, totalCount };
      });
  }

  create(data) {
    return this.#prisma.feedback.create({
      data: {
        submission_id: data.submissionId,
        user_id: data.userId,
        content: data.content,
        is_blocked: false,
      },
    });
  }

  //수정 및 삭제 기능 없음
  // update(id, content) {
  //   return this.#prisma.feedback.update({ where: { id }, data: { content } });
  // }

  // deleteFeedback(id) {
  //   return this.#prisma.feedback.delete({ where: { id } });
  // }

  block(id) {
    return this.#prisma.feedback.update({
      where: { id },
      data: { is_blocked: true },
    });
  }
}
