export class HeartRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  create(userId, submissionId) {
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

  delete(userId, submissionId) {
    return this.#prisma.$transaction([
      this.#prisma.heart.delete({
        where: {
          submission_id_user_id: {
            user_id: userId,
            submission_id: submissionId,
          },
        },
      }),
      this.#prisma.submission.update({
        where: { id: submissionId },
        data: { heart_count: { decrement: 1 } },
      }),
    ]);
  }

  //중복 체크(유저 1명당 제출물에 1회 가능)
  checkDuplicate(userId, submissionId) {
    return this.#prisma.heart.findUnique({
      where: { user_id: userId, submission_id: submissionId },
    });
  }
}
