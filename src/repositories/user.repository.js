export class UserRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  //페이지네이션 포함
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
        participation_count: true,
        best_selection_count: true,
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
        participation_count: true,
        best_selection_count: true,
      },
    });
  }

  // deleteUser(id) {
  //   return this.#prisma.user.delete({
  //     where: { id },
  //   });
  // }

  //리프레시 토큰 저장용
  updateRefreshToken(id, refreshToken) {
    return this.#prisma.user.update({
      where: { id },
      data: { refresh_token: refreshToken },
    });
  }

  //소셜로그인 관련
  findBySocialAccount(provider, providerId) {
    return this.#prisma.user.findFirst({
      where: { provider: provider, provider_id: providerId },
    });
  }

  connectSocialAccount(userId, { provider, providerId }) {
    return this.#prisma.user.update({
      where: { id: userId },
      data: { provider: provider, provider_id: providerId },
    });
  }

  creatWithSocialAccount(data) {
    return this.#prisma.user.create({
      data: {
        email: data.email,
        nickname: data.name,
        provider: data.provider,
        provider_id: data.providerId,
        grade: 'NORMAL',
      },
    });
  }
}
