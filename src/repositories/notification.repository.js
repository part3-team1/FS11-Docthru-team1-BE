export class NotificationRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  create(data) {
    return this.#prisma.notification.create({
      data: {
        user_id: data.user_id,
        type: data.type,
        message: data.message,
        reason: data.reason,
      },
    });
  }

  findAllByUserId(user_id, { skip = 0, take = 10 } = {}) {
    return this.#prisma
      .$transaction([
        this.#prisma.notification.findMany({
          where: { user_id },
          skip: Number(skip),
          take: Number(take),
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            type: true,
            message: true,
            reason: true,
            is_read: true,
            created_at: true,
          },
        }),
        this.#prisma.notification.count({ where: { user_id } }),
      ])
      .then(([notifications, totalCount]) => {
        return { notifications, totalCount };
      });
  }

  //알림 클릭 했을때 읽은 알람 표시용
  markAsRead(id) {
    return this.#prisma.notification.update({
      where: { id },
      data: { is_read: true },
    });
  }

  //안 읽은 알림 표시(종모양 배지에 활용)
  countUnread(user_id) {
    return this.#prisma.notification.count({
      where: { user_id, is_read: false },
    });
  }

  delete(id) {
    return this.#prisma.notification.delete({
      where: { id },
    });
  }
}
