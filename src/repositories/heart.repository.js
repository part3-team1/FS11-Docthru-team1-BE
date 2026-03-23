export class HeartRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  create(user_id, submission_id) {
    return this.#prisma.$transaction([
      this.#prisma.heart.create({
        data: { user_id, submission_id },
      }),
      this.#prisma.submission.update({
        where: { id: submission_id },
        data: { heart_count: { increment: 1 } },
      }),
    ]);
  }

  delete(user_id, submission_id) {
    return this.#prisma.$transaction([
      this.#prisma.heart.delete({
        where: {
          submission_id_user_id: {
            user_id,
            submission_id,
          },
        },
      }),
      this.#prisma.submission.update({
        where: { id: submission_id },
        data: { heart_count: { decrement: 1 } },
      }),
    ]);
  }

  //중복 체크(유저 1명당 제출물에 1회 가능)
  checkDuplicate(user_id, submission_id) {
    return this.#prisma.heart.findUnique({
      where: { submission_id_user_id: { user_id, submission_id } },
    });
  }
}
