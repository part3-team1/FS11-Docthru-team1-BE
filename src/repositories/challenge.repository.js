export class ChallengeRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  findAllchallenges({
    skip = 0,
    take = 10,
    keyword,
    sortBy = 'approved_at',
    sortOrder = 'desc',
    ...filters
  } = {}) {
    const queryOptions = {
      ...(keyword && { title: { contains: keyword, mode: 'insensitive' } }),
      ...filters,
      status: { not: 'DELETED' },
    };

    const orderBy = { [sortBy]: sortOrder };

    return this.#prisma
      .$transaction([
        this.#prisma.challenge.findMany({
          where: queryOptions,
          skip: Number(skip),
          take: Number(take),
          orderBy: orderBy,
        }),
        this.#prisma.challenge.count({ where: queryOptions }),
      ])
      .then(([challenges, totalCount]) => {
        return { challenges, totalCount };
      });
  }

  findChallengeById(id) {
    return this.#prisma.challenge.findUnique({ where: { id } });
  }

  createRequest(data) {
    return this.#prisma.challengeRequest.create({
      data: {
        requested_by: data.userId,
        title: data.title,
        doc_url: data.docUrl,
        description: data.description,
        category: data.category,
        document_type: data.documentType,
        due_date: data.dueDate,
        max_participants: data.maxParticipants,
      },
    });
  }

  joinChallenge(userId, challengeId) {
    return this.#prisma.$transaction([
      this.#prisma.participation.create({
        data: { user_id: userId, challenge_id: challengeId },
      }),
      this.#prisma.challenge.update({
        where: { id: challengeId },
        data: { current_participants: { increment: 1 } },
      }),
    ]);
  }

  //어드민 관련 API
  findRequestById(requestId) {
    return this.#prisma.challengeRequest.findUnique({
      where: { id: requestId },
    });
  }

  updateRequestStatus(requestId, status, rejectionReason = null) {
    return this.#prisma.challengeRequest.update({
      where: { id: requestId },
      data: { status, rejection_reason: rejectionReason },
    });
  }

  createChallenge(data) {
    return this.#prisma.challenge.create({
      data: {
        request_id: data.requestId,
        title: data.title,
        doc_url: data.docUrl,
        description: data.description,
        category: data.category,
        document_type: data.documentType,
        due_date: data.dueDate,
        max_participants: data.maxParticipants,
        status: 'OPENED',
        approved_at: new Date(),
      },
    });
  }

  updateChallenge(id, data) {
    return this.#prisma.challenge.update({ where: { id }, data });
  }

  deleteChallenge(id) {
    return this.#prisma.challenge.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }
}
