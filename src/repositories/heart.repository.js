export class HeartRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  findAllByUserId(userId, { skip = 0, take = 10 } = {}) {
    return this.#prisma
      .$transaction([
        this.#prisma.heart.findMany({
          where: { userId: userId },
          skip: Number(skip),
          take: Number(take),
          orderBy: { createdAt: 'desc' },
          include: {
            submission: {
              include: {
                user: { select: { nickname: true } },
                challenge: { select: { title: true,category:true,documentType:true } },
              },
            },
          },
        }),
        this.#prisma.heart.count({ where: { userId: userId } }),
      ])
      .then(([hearts, totalCount]) => {
        return { hearts, totalCount };
      });
  }

  create(userId, submissionId) {
    return this.#prisma.$transaction([
      this.#prisma.heart.create({
        data: { userId, submissionId },
      }),
      this.#prisma.submission.update({
        where: { id: submissionId },
        data: { heartCount: { increment: 1 } },
      }),
    ]);
  }

  delete(userId, submissionId) {
    return this.#prisma.$transaction([
      this.#prisma.heart.delete({
        where: {
          submissionId_userId: { userId, submissionId },
        },
      }),
      this.#prisma.submission.update({
        where: { id: submissionId },
        data: { heartCount: { decrement: 1 } },
      }),
    ]);
  }

  checkDuplicate(userId, submissionId) {
    return this.#prisma.heart.findUnique({
      where: {
        submissionId_userId: { userId, submissionId },
      },
    });
  }
}
