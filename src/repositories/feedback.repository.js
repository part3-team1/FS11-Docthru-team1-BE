export class FeedbackRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  //페이지네이션 포함
  findAllBySubmissionId(submissionId, { skip = 0, take = 10 } = {}) {
    return this.#prisma.feedback.findMany({
      where: { submission_id: submissionId, is_blocked: false },
      skip: Number(skip),
      take: Number(take),
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { nickname: true, grade: true } },
      },
    });
  }

  createFeedback(data) {
    return this.#prisma.feedback.create({
      data: {
        submission_id: data.submissionId,
        user_id: data.userId,
        content: data.content,
      },
    });
  }

  updateFeedback(id, content) {
    return this.#prisma.feedback.update({ where: { id }, data: { content } });
  }

  deleteFeedback(id) {
    return this.#prisma.feedback.delete({ where: { id } });
  }

  blockFeedback(id) {
    return this.#prisma.feedback.update({
      where: { id },
      data: { is_blocked: true },
    });
  }
}
