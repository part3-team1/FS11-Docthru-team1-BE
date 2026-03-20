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
    document_type,
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
      ...(document_type && { document_type }),
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

  //중복 참여 방지
  isParticipating(user_id, challenge_id) {
    return this.#prisma.participation.findUnique({
      where: {
        challenge_id_user_id: { challenge_id, user_id },
      },
    });
  }

  //챌린지 상세페이지 '작업 도전하기' 버튼 부분(참여 생성 + 인원 증가)
  join(user_id, challenge_id) {
    return this.#prisma.$transaction([
      this.#prisma.participation.create({
        data: { user_id, challenge_id },
      }),
      this.#prisma.challenge.update({
        where: { id: challenge_id },
        data: { current_participants: { increment: 1 } },
      }),
    ]);
  }

  //챌린지 나가기(포기 + 인원 감소)
  leave(user_id, challenge_id) {
    return this.#prisma.$transaction([
      this.#prisma.participation.delete({
        where: {
          challenge_id_user_id: { user_id, challenge_id },
        },
      }),
      this.#prisma.challenge.update({
        where: { id: challenge_id },
        data: { current_participants: { decrement: 1 } },
      }),
    ]);
  }

  //어드민 관련 (맨 아래 까지)
  create(data) {
    return this.#prisma.challenge.create({
      data: {
        request_id: data.request_id,
        title: data.title,
        doc_url: data.doc_url,
        description: data.description,
        category: data.category,
        document_type: data.document_type,
        due_date: new Date(data.due_date),
        max_participants: Number(data.max_participants),
        status: 'OPENED',
        approved_at: new Date(),
      },
    });
  }

  update(id, data) {
    const updateData = { ...data };

    if (data.due_date) {
      updateData.due_date = new Date(data.due_date);
    }
    if (data.max_participants) {
      updateData.max_participants = Number(data.max_participants);
    }

    return this.#prisma.challenge.update({
      where: { id },
      data: updateData,
    });
  }

  delete(id) {
    return this.#prisma.challenge.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }
}
