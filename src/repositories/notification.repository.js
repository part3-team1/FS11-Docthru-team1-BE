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
      },
    });
  }

  findAllByUserId(userId) {
    return this.#prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }
}
