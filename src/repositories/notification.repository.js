export class NotificationRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  create(data) {
    return this.#prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        message: data.message,
        reason: data.reason,
      },
    });
  }

  findAllByUserId(userId, { skip = 0, take = 10 } = {}) {
    return this.#prisma
      .$transaction([
        this.#prisma.notification.findMany({
          where: { userId: userId },
          skip: Number(skip),
          take: Number(take),
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            message: true,
            reason: true,
            isRead: true,
            createdAt: true,
          },
        }),
        this.#prisma.notification.count({ where: { userId: userId } }),
      ])
      .then(([notifications, totalCount]) => {
        return { notifications, totalCount };
      });
  }

  findById(id) {
    return this.#prisma.notification.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        isRead: true,
      },
    });
  }

  markAsRead(id) {
    return this.#prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  countUnread(userId) {
    return this.#prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  delete(id) {
    return this.#prisma.notification.delete({
      where: { id },
    });
  }
}
