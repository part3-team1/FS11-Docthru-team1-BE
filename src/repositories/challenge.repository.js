export class ChallengeRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  //페이지네이션, 필터링, 분류 포함
  findAllchallenges({
    skip = 0,
    take = 10,
    keyword,
    category,
    documentType,
    status,
    sortBy = 'approved_at',
    sortOrder = 'desc',
    ...rest
  } = {}) {
    const queryOptions = {
      ...(keyword && { title: { contains: keyword, mode: 'insensitive' } }),
      ...(category && { category }),
      ...(documentType && { document_type: documentType }),
      ...(status && { status }),
      ...rest,
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

  //챌린지 상세페이지 '작업 도전하기' 버튼 부분(참여 생성 + 인원 증가)
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

  //어드민 관련 (맨 아래 까지)
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
    const { documentType, ...rest } = data;

    return this.#prisma.challenge.update({
      where: { id },
      data: { ...rest, ...(documentType && { document_type: documentType }) },
    });
  }

  deleteChallenge(id) {
    return this.#prisma.challenge.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }
}
