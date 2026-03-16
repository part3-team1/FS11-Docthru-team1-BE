export class UserRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  findAll({ skip = 0, take = 10 } = {}) {
    return this.#prisma.user.findMany({
      skip,
      take,
      orderBy: {
        created_at: 'desc',
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        role: true,
        grade: true,
        created_at: true,
      },
    });
  }

  findById(id) {
    return this.#prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nickname: true,
        role: true,
        grade: true,
        participation_count: true,
        best_selection_count: true,
      },
    });
  }

  findEmail(email, { inclusePassword = false } = {}) {
    return this.#prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        nickname: true,
        role: true,
        grade: true,
        participation_count: true,
        best_selection_count: true,
        ...(inclusePassword ? { password_hash: true } : {}),
      },
    });
  }

  create(data) {
    return this.#prisma.user.create({
      data: {
        email: data.email,
        password_hash: data.password,
        nickname: data.nickname,
        provider: data.provider || 'LOCAL',
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        role: true,
      },
    });
  }

  update(id, data) {
    return this.#prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        nickname: true,
        grade: true,
      },
    });
  }
}
