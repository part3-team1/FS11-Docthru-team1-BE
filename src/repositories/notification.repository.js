export class NotificationRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  createNotification(data) {
    return this.#prisma.notification.create({
      data: {
        user_id: data.userId,
        type: data.type,
        message: data.message,
        reason: data.reason,
        is_read: false,
      },
    });
  }

  findAllByUserId(userId, { take = 10 } = {}) {
    return this.#prisma.notification.findMany({
      where: { user_id: userId },
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
    });
  }

  //알림 클릭 했을때 읽은 알람 표시용
  markAsRead(id) {
    return this.#prisma.notification.update({
      where: { id },
      data: { is_read: true },
    });
  }
}
