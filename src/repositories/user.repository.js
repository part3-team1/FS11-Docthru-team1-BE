export class UserRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  findAllUsers({ skip = 0, take = 10 } = {}) {
    return this.#prisma.user.findMany({
      skip: Number(skip),
      take: Number(take),
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

  findUserById(id) {
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

  findUserByEmail(email, { includePassword = false } = {}) {
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
        ...(includePassword ? { password_hash: true } : {}),
      },
    });
  }

  createUser(data) {
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

  updateUser(id, data) {
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

  // deleteUser(id) {
  //   return this.#prisma.user.delete({
  //     where: { id },
  //   });
  // }
}
