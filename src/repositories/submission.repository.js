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
          orderBy: { heart_count: 'desc' },
          include: {
            user: {
              select: { nickname: true, grade: true },
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
      take: limit,
      orderBy: { heart_count: 'desc' },
      include: { user: { select: { nickname: true, grade: true } } },
    });
  }

  findSubmissionById(id) {
    return this.#prisma.submission.findUnique({
      where: { id },
      include: {
        user: { select: { nickname: true, grade: true } },
        challenge: { select: { title: true, doc_url: true } },
      },
    });
  }

  createSubmission(data) {
    return this.#prisma.submission.create({
      data: {
        challenge_id: data.challengeId,
        user_id: data.userId,
        content: data.content,
      },
    });
  }

  updateSubmission(id, data) {
    return this.#prisma.submission.update({ where: { id }, data });
  }

  deleteSubmission(id) {
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
