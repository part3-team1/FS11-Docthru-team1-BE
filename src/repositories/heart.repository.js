export class HeartRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  findAllByUserId(userId, { skip = 0, take = 10 } = {}) {
    return this.#prisma
      .$transaction([
        this.#prisma.heart.findMany({
          where: { user_id: userId },
          skip: Number(skip),
          take: Number(take),
          orderBy: { created_at: 'desc' },
          include: {
            submission: {
              include: {
                user: { select: { nickname: true } },
                challenge: { select: { title: true } },
              },
            },
          },
        }),
        this.#prisma.heart.count({ where: { user_id: userId } }),
      ])
      .then(([hearts, totalCount]) => {
        return { hearts, totalCount };
      });
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
      where: {
        submission_id_user_id: { user_id: userId, submission_id: submissionId },
      },
    });
  }
}
