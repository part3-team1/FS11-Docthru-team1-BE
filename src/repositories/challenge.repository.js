import { validateSort } from '#utils/sort.util.js';

export class ChallengeRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  findAll({
    skip = 0,
    take = 10,
    keyword,
    category,
    documentType,
    status,
    sortBy,
    sortOrder,
  } = {}) {
    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = validateSort(
      sortBy,
      sortOrder,
      ['approvedAt', 'dueDate', 'currentParticipants', 'title'],
    );

    const queryOptions = {
      ...(keyword && { title: { contains: keyword, mode: 'insensitive' } }),
      ...(category && { category }),
      ...(documentType && { documentType: documentType }),
      status: status ? status : { not: 'DELETED' },
    };

    return this.#prisma
      .$transaction([
        this.#prisma.challenge.findMany({
          where: queryOptions,
          skip: Number(skip),
          take: Number(take),
          orderBy: { [safeSortBy]: safeSortOrder },
        }),
        this.#prisma.challenge.count({ where: queryOptions }),
      ])
      .then(([challenges, totalCount]) => {
        return { challenges, totalCount };
      });
  }

  findById(id) {
    return this.#prisma.challenge.findUnique({
      where: { id },
      include: {
        request: {
          include: {
            user: { select: { id: true, nickname: true, grade: true } },
          },
        },
        participations: {
          include: {
            user: { select: { id: true, nickname: true, grade: true } },
          },
        },
        submissions: {
          where: { isDeleted: false, isBlocked: false },
          include: {
            user: { select: { id: true, nickname: true, grade: true } },
          },
        },
        drafts: { select: { id: true, userId: true } },
      },
    });
  }

  findAllParticipating(userId, { skip = 0, take = 10, status, keyword } = {}) {
    const whereCondition = {
      userId: userId,
      ...(status && { challenge: { status } }),
      ...(keyword && {
        challenge: {
          title: { contains: keyword, mode: 'insensitive' },
        },
      }),
    };

    return this.#prisma
      .$transaction([
        this.#prisma.participation.findMany({
          where: whereCondition,
          skip: Number(skip),
          take: Number(take),
          include: {
            challenge: {
              include: {
                submissions: {
                  where: { userId, isDeleted: false },
                  select: { id: true },
                  orderBy: { createdAt: 'desc' },
                },
              },
            },
          },
        }),
        this.#prisma.participation.count({ where: whereCondition }),
      ])
      .then(([participations, totalCount]) => {
        return { participations, totalCount };
      });
  }

  isParticipating(userId, challengeId) {
    return this.#prisma.participation.findUnique({
      where: {
        challengeId_userId: { challengeId, userId },
      },
    });
  }

  join(userId, challengeId) {
    return this.#prisma.$transaction([
      this.#prisma.participation.create({
        data: { userId, challengeId },
      }),
      this.#prisma.challenge.update({
        where: { id: challengeId },
        data: { currentParticipants: { increment: 1 } },
      }),
    ]);
  }

  leave(userId, challengeId) {
    return this.#prisma.$transaction([
      this.#prisma.participation.delete({
        where: {
          challengeId_userId: { userId, challengeId },
        },
      }),
      this.#prisma.challenge.update({
        where: { id: challengeId },
        data: { currentParticipants: { decrement: 1 } },
      }),
    ]);
  }

  create(data) {
    return this.#prisma.challenge.create({
      data: {
        requestId: data.requestId,
        title: data.title,
        docUrl: data.docUrl,
        description: data.description,
        category: data.category,
        documentType: data.documentType,
        dueDate: new Date(data.dueDate),
        maxParticipants: Number(data.maxParticipants),
        status: 'OPENED',
        approvedAt: new Date(),
      },
    });
  }

  update(id, data) {
    return this.#prisma.challenge.update({
      where: { id },
      data: {
        title: data.title,
        docUrl: data.docUrl,
        description: data.description,
        category: data.category,
        documentType: data.documentType,
        status: data.status,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        maxParticipants: data.maxParticipants
          ? Number(data.maxParticipants)
          : undefined,
      },
    });
  }

  delete(id) {
    return this.#prisma.challenge.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }
}
