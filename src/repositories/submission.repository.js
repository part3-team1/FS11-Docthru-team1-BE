import { validateSort } from '#utils/sort.util.js';

export class SubmissionRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  findAllByChallengeId(
    challengeId,
    { skip = 0, take = 5, sortBy, sortOrder } = {},
  ) {
    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = validateSort(
      sortBy,
      sortOrder,
      ['createdAt', 'heartCount'],
    );

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

  findAllByUserId(userId, { skip = 0, take = 10, keyword = '' } = {}) {
    const queryOptions = {
      userId: userId,
      isDeleted: false,
      ...(keyword && {
        title: { contains: keyword, mode: 'insensitive' },
      }),
    };

    return this.#prisma
      .$transaction([
        this.#prisma.submission.findMany({
          where: queryOptions,
          skip: Number(skip),
          take: Number(take),
          orderBy: { createdAt: 'desc' },
          include: {
            challenge: {
              select: {
                id: true,
                title: true,
                status: true,
                category: true,
                documentType: true,
              },
            },
          },
        }),
        this.#prisma.submission.count({ where: queryOptions }),
      ])
      .then(([submissions, totalCount]) => {
        return { submissions, totalCount };
      });
  }

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
        challenge: {
          select: {
            title: true,
            docUrl: true,
            status: true,
            category: true,
            documentType: true,
          },
        },
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

  updateBestStatus(id, isBest) {
    return this.#prisma.submission.update({
      where: { id },
      data: { isBest },
    });
  }

  updateBlockStatus(id, isBlocked) {
    return this.#prisma.submission.update({
      where: { id },
      data: { isBlocked },
    });
  }
}
