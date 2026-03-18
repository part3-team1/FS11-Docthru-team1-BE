import { email } from 'zod';

export class EditRequestRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  createEditRequest(data) {
    return this.#prisma.editRequest.create({
      data: {
        challenge_id: data.challengeId,
        user_id: data.userId,
        reason: data.reason,
        change_content: data.changeContent,
        status: 'PENDING',
      },
    });
  }

  //어드민 관련 (맨 아래 까지)

  //페이지네이션 포함
  findAllEditRequests({ skip = 0, take = 10, status } = {}) {
    const queryOptions = { ...(status && { status }) };

    return this.#prisma
      .$transaction([
        this.#prisma.editRequest.findMany({
          where: { status },
          skip: Number(skip),
          take: Number(take),
          orderBy: { created_at: 'desc' },
          include: {
            user: { select: { nickname: true, status: true } },
            challenge: { select: { id: true, title: true } },
          },
        }),
        this.#prisma.editRequest.count({ where: { status } }),
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
