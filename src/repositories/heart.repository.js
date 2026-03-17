export class HeartRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  createHeart(userId, submissionId) {
    return this.#prisma.$transaction([
      this.#prisma.heart.create({
        data: { user_id: userId, submission_id: submissionId },
      }),
      this.#prisma.submission.update({
        where: { id: submissionId },
        data: { heart_count: { increment: 1 } },
      }),
    ]);
  }

  findHeart(userId, submissionId) {
    return this.#prisma.heart.findFirst({
      where: { user_id: userId, submission_id: submissionId },
    });
  }
}
