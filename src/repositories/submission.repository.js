import { validateSort } from '#utils/sort.util.js';

export class SubmissionRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  //페이지네이션 포함
  findAllByChallengeId(
    challengeId,
    { skip = 0, take = 5, sortBy, sortOrder } = {},
  ) {
    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = validateSort({
      sortBy,
      sortOrder,
      allowedFields: ['heartCount', 'createdAt'],
      defaultField: 'heartCount',
    });

    const whereCondition = {
      challengeId,
      isBlocked: false,
      isDeleted: false,
    };

    return this.#prisma
      .$transaction([
        this.#prisma.submission.findMany({
          where: whereCondition,
          skip: Number(skip),
          take: Number(take),
          orderBy: [{ [safeSortBy]: safeSortOrder }, { createdAt: 'desc' }],
          include: {
            user: {
              select: { nickname: true, grade: true, status: true },
            },
          },
        }),
        this.#prisma.submission.count({ where: whereCondition }),
      ])
      .then(([submissions, totalCount]) => {
        return { submissions, totalCount };
      });
  }

  //마이페이지용 내 작업물 모아보기
  findAllByUserId(userId, { skip = 0, take = 10 } = {}) {
    return this.#prisma
      .$transaction([
        this.#prisma.submission.findMany({
          where: { userId: userId, isDeleted: false },
          skip: Number(skip),
          take: Number(take),
          orderBy: { createdAt: 'desc' },
          include: {
            challenge: { select: { title: true, status: true } },
          },
        }),
        this.#prisma.submission.count({
          where: { userId, isDeleted: false },
        }),
      ])
      .then(([submissions, totalCount]) => {
        return { submissions, totalCount };
      });
  }

  //상위 5위 조회 시
  findTopRankings(challengeId, limit = 5) {
    return this.#prisma.submission.findMany({
      where: {
        challengeId,
        isBlocked: false,
        isDeleted: false,
      },
      take: Number(limit),
      orderBy: [
        { isBest: 'desc' },
        { heartCount: 'desc' },
        { createdAt: 'desc' },
      ],
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
        challenge: { select: { title: true, docUrl: true, status: true } },
      },
    });
  }

  create(data) {
    return this.#prisma.submission.create({
      data: {
        challengeId: data.challengeId,
        userId: data.userId,
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
    return this.#prisma.submission.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  //어드민 관련 (1등 왕관 표시용)
  updateBestStatus(id, isBest) {
    return this.#prisma.submission.update({
      where: { id },
      data: { isBest },
    });
  }

  //자동차단용
  updateBlockStatus(id, isBlocked) {
    return this.#prisma.submission.update({
      where: { id },
      data: { isBlocked },
    });
  }
}
