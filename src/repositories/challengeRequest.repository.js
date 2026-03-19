import { validateSort } from '#utils/sort.util.js';

export class ChallengeRequestRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  create(data) {
    return this.#prisma.challengeRequest.create({
      data: {
        requested_by: data.user_id,
        title: data.title,
        doc_url: data.doc_url,
        description: data.description,
        category: data.category,
        document_type: data.document_type,
        due_date: new Date(data.due_date),
        max_participants: Number(data.max_participants),
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
      ...(status && { status }),
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

  updateStatus(id, status, rejection_reason = null) {
    return this.#prisma.challengeRequest.update({
      where: { id },
      data: {
        status,
        ...(rejection_reason && { rejection_reason }),
      },
    });
  }

  delete(id) {
    return this.#prisma.challengeRequest.delete({ where: { id } });
  }
}
