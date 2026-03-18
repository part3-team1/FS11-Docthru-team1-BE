export class SubmissionRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  //페이지네이션 포함
  findAllByChallengeId(challengeId, { skip = 0, take = 5 } = {}) {
    return this.#prisma
      .$transaction([
        this.#prisma.submission.findMany({
          where: { challenge_id: challengeId },
          skip: Number(skip),
          take: Number(take),
          orderBy: [{ heart_count: 'desc' }, { created_at: 'desc' }],
          include: {
            user: {
              select: { nickname: true, grade: true, status: true },
            },
          },
        }),
        this.#prisma.submission.count({ where: { challenge_id: challengeId } }),
      ])
      .then(([submissions, totalCount]) => {
        return { submissions, totalCount };
      });
  }

  //상위 5위 조회 시
  findTopRankings(challengeId, limit = 5) {
    return this.#prisma.submission.findMany({
      where: { challenge_id: challengeId },
      take: Number(limit),
      orderBy: [{ is_best: 'desc' }, { heart_count: 'desc' }],
      include: {
        user: { select: { nickname: true, grade: true, status: true } },
      },
    });
  }

  findById(id) {
    return this.#prisma.submission.findUnique({
      where: { id },
      include: {
        user: { select: { nickname: true, grade: true, status: true } },
        challenge: { select: { title: true, doc_url: true } },
      },
    });
  }

  create(data) {
    return this.#prisma.submission.create({
      data: {
        challenge_id: data.challengeId,
        user_id: data.userId,
        title: data.title,
        content: data.content,
      },
    });
  }

  update(id, data) {
    return this.#prisma.submission.update({
      where: { id },
      data: { title: data.title, content: data.content },
    });
  }

  delete(id) {
    return this.#prisma.submission.delete({
      where: { id },
    });
  }

  //어드민 관련 (1등 왕관 표시용)
  updateBestStatus(id, isBest) {
    return this.#prisma.submission.update({
      where: { id },
      data: { is_best: isBest },
    });
  }
}
