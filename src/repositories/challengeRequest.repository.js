import { validateSort } from '#utils/sort.util.js';

export class ChallengeRequestRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  create(data) {
    return this.#prisma.challengeRequest.create({
      data: {
        requestedBy: data.userId,
        title: data.title,
        docUrl: data.docUrl,
        description: data.description,
        category: data.category,
        documentType: data.documentType,
        dueDate: new Date(data.dueDate),
        maxParticipants: Number(data.maxParticipants),
        status: 'PENDING',
      },
    });
  }

  findAll({
    skip = 0,
    take = 10,
    keyword = '',
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = {}) {
    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = validateSort({
      sortBy,
      sortOrder,
      allowedFields: ['createdAt', 'dueDate', 'status', 'title'],
    });

    const queryOptions = {
      ...(keyword && { title: { contains: keyword, mode: 'insensitive' } }),
      status: status ?? { not: 'DELETED' },
    };

    return this.#prisma
      .$transaction([
        this.#prisma.challengeRequest.findMany({
          where: queryOptions,
          skip: Number(skip),
          take: Number(take),
          orderBy: { [safeSortBy]: safeSortOrder },
          include: { user: { select: { nickname: true, status: true } } },
        }),
        this.#prisma.challengeRequest.count({ where: queryOptions }),
      ])
      .then(([requests, totalCount]) => {
        return { requests, totalCount };
      });
  }

  findById(id) {
    return this.#prisma.challengeRequest.findUnique({
      where: { id },
      include: {
        user: { select: { nickname: true, email: true, status: true } },
      },
    });
  }

  findAllByRequesterId(
    userId,
    {
      skip = 0,
      take = 10,
      keyword = '',
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = {},
  ) {
    const queryOptions = {
      requestedBy: userId,
      status: status ?? { not: 'DELETED' },
      ...(keyword && { title: { contains: keyword, mode: 'insensitive' } }),
    };

    return this.#prisma
      .$transaction([
        this.#prisma.challengeRequest.findMany({
          where: queryOptions,
          skip: Number(skip),
          take: Number(take),
          orderBy: { [sortBy]: sortOrder },
        }),
        this.#prisma.challengeRequest.count({ where: queryOptions }),
      ])
      .then(([requests, totalCount]) => {
        return { requests, totalCount };
      });
  }

  updateStatus(id, status, rejectionReason = null) {
    return this.#prisma.challengeRequest.update({
      where: { id },
      data: {
        status,
        ...(rejectionReason && { rejectionReason: rejectionReason }),
      },
    });
  }

  delete(id) {
    return this.#prisma.challengeRequest.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }
}
