import { validateSort } from '#utils/sort.util.js';

export class ChallengeRequestRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  create(data) {
    return this.#prisma.challengeRequest.create({
      data: {
        requested_by: data.userId,
        title: data.title,
        doc_url: data.docUrl,
        description: data.description,
        category: data.category,
        document_type: data.documentType,
        due_date: new Date(data.dueDate),
        max_participants: Number(data.maxParticipants),
        status: 'PENDING',
      },
    });
  }

  //어드민 관련 (맨 아래 까지)
  findAll({
    skip = 0,
    take = 10,
    keyword,
    status,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = {}) {
    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = validateSort({
      sortBy,
      sortOrder,
      allowedFields: ['created_at', 'due_date', 'status', 'title'],
      defaultField: 'created_at',
    });

    const queryOptions = {
      ...(keyword && { title: { contains: keyword, mode: 'insensitive' } }),
      status: status ? status : { not: 'DELETED' },
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

  findAllByRequesterId(userId, { skip = 0, take = 10 } = {}) {
    const queryOptions = { requested_by: userId, status: { not: 'DELETED' } };

    return this.#prisma
      .$transaction([
        this.#prisma.challengeRequest.findMany({
          where: queryOptions,
          skip: Number(skip),
          take: Number(take),
          orderBy: { created_at: 'desc' },
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
        ...(rejectionReason && { rejection_reason: rejectionReason }),
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
