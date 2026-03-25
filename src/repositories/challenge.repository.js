import { validateSort } from '#utils/sort.util.js';

export class ChallengeRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  //페이지네이션, 필터링, 분류 포함
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
    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = validateSort({
      sortBy,
      sortOrder,
      allowedFields: [
        'approved_at',
        'due_date',
        'current_participants',
        'title',
      ],
      defaultField: 'approved_at',
    });

    const queryOptions = {
      ...(keyword && { title: { contains: keyword, mode: 'insensitive' } }),
      ...(category && { category }),
      ...(documentType && { document_type: documentType }),
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
      include: { request: true },
    });
  }

  findAllParticipating(userId, { skip = 0, take = 10, status } = {}) {
    const whereCondition = {
      user_id: userId,
      ...(status && { challenge: { status } }),
    };

    return this.#prisma
      .$transaction([
        this.#prisma.participation.findMany({
          where: whereCondition,
          skip: Number(skip),
          take: Number(take),
          include: { challenge: true },
        }),
        this.#prisma.participation.count({ where: whereCondition }),
      ])
      .then(([participations, totalCount]) => {
        return { participations, totalCount };
      });
  }

  //중복 참여 방지
  isParticipating(userId, challengeId) {
    return this.#prisma.participation.findUnique({
      where: {
        challenge_id_user_id: { challengeId, userId },
      },
    });
  }

  //챌린지 상세페이지 '작업 도전하기' 버튼 부분(참여 생성 + 인원 증가)
  join(userId, challengeId) {
    return this.#prisma.$transaction([
      this.#prisma.participation.create({
        data: { userId, challengeId },
      }),
      this.#prisma.challenge.update({
        where: { id: challengeId },
        data: { current_participants: { increment: 1 } },
      }),
    ]);
  }

  //챌린지 나가기(포기 + 인원 감소)
  leave(userId, challengeId) {
    return this.#prisma.$transaction([
      this.#prisma.participation.delete({
        where: {
          challenge_id_user_id: { userId, challengeId },
        },
      }),
      this.#prisma.challenge.update({
        where: { id: challengeId },
        data: { current_participants: { decrement: 1 } },
      }),
    ]);
  }

  //어드민 관련 (맨 아래 까지)
  create(data) {
    return this.#prisma.challenge.create({
      data: {
        request_id: data.requestId,
        title: data.title,
        doc_url: data.docUrl,
        description: data.description,
        category: data.category,
        document_type: data.documentType,
        due_date: new Date(data.dueDate),
        max_participants: Number(data.maxParticipants),
        status: 'OPENED',
        approved_at: new Date(),
      },
    });
  }

  update(id, data) {
    return this.#prisma.challenge.update({
      where: { id },
      data: {
        title: data.title,
        doc_url: data.docUrl,
        description: data.description,
        category: data.category,
        document_type: data.documentType,
        status: data.status,
        due_date: data.dueDate ? new Date(data.dueDate) : undefined,
        max_participants: data.maxParticipants
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
