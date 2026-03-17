export class FeedbackRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  findAllBySubmissionId(submissionId) {
    return this.#prisma.feedback.findMany({
      where: { submission_id: submissionId, is_blocked: false },
      include: {
        user: { select: { nickname: true, grade: true } },
      },
    });
  }

  createFeedback(data) {
    return this.#prisma.feedback.create({ data });
  }

  blockFeedback(id) {
    return this.#prisma.feedback.update({
      where: { id },
      data: { is_blocked: true },
    });
  }
}
