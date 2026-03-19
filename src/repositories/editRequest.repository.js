import { validateSort } from '#utils/sort.util.js';

export class EditRequestRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  create(data) {
    return this.#prisma.editRequest.create({
      data: {
        challenge_id: data.challenge_id,
        user_id: data.user_id,
        reason: data.reason,
        change_content: data.change_content,
        status: 'PENDING',
      },
    });
  }

  //어드민 관련 (맨 아래 까지)

  //페이지네이션 포함
  findAll({ skip = 0, take = 10, status } = {}) {
    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = validateSort({
      sortBy,
      sortOrder,
      allowedFields: ['created_at', 'status'],
      defaultField: 'created_at',
    });

    const queryOptions = { ...(status && { status }) };

    return this.#prisma
      .$transaction([
        this.#prisma.editRequest.findMany({
          where: { status },
          skip: Number(skip),
          take: Number(take),
          orderBy: { [safeSortBy]: safeSortOrder },
          include: {
            user: { select: { nickname: true, status: true } },
            challenge: { select: { id: true, title: true } },
          },
        }),
        this.#prisma.editRequest.count({ where: { queryOptions } }),
      ])
      .then(([requests, totalCount]) => {
        return { requests, totalCount };
      });
  }

  findById(id) {
    return this.#prisma.editRequest.findUnique({
      where: { id },
      include: {
        challenge: true,
        user: { select: { nickname: true, email: true, status: true } },
      },
    });
  }

  //상태 업데이트용
  updateStatus(id, status) {
    return this.#prisma.editRequest.update({
      where: { id },
      data: { status },
    });
  }
}
