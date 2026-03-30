export class DraftRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  create(data) {
    return this.#prisma.draft.create({
      data: {
        title: data.title,
        content: data.content,
        userId: data.userId,
        challengeId: data.challengeId,
      },
    });
  }

  findById(id) {
    return this.#prisma.draft.findUnique({
      where: { id },
    });
  }

  findByUserAndChallenge(userId, challengeId) {
    return this.#prisma.draft.findMany({
      where: {
        userId,
        challengeId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  delete(id) {
    return this.#prisma.draft.delete({
      where: { id },
    });
  }

  deleteByChallenge(userId, challengeId) {
    return this.#prisma.draft.deleteMany({
      where: { userId, challengeId },
    });
  }
}
