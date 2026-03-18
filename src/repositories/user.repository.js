export class UserRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  //페이지네이션 포함
  findAll({ skip = 0, take = 10, status } = {}) {
    return this.#prisma.user.findMany({
      where: { ...(status && { status }) },
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
        status: true,
        is_banned: true,
        participation_count: true,
        best_selection_count: true,
        created_at: true,
        deleted_at: true,
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
        status: true,
        is_banned: true,
        participation_count: true,
        best_selection_count: true,
      },
    });
  }

  findByEmail(email, { includePassword = false } = {}) {
    return this.#prisma.user.findFirst({
      where: { email, status: { not: 'WITHDRAWN' } },
      select: {
        id: true,
        email: true,
        nickname: true,
        role: true,
        grade: true,
        status: true,
        is_banned: true,
        participation_count: true,
        best_selection_count: true,
        ...(includePassword ? { password_hash: true } : {}),
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
        grade: 'NORMAL',
        status: 'ACTIVE',
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

  //자진 탈퇴
  deleteUser(id, { nickname, email }) {
    return this.#prisma.user.update({
      where: { id },
      data: {
        status: 'WITHDRAWN',
        deleted_at: new Date(),
        nickname, //'탈퇴한 사용자'로 변경
        email,
        refresh_token: null, //강제 로그아웃
      },
    });
  }

  //강제 정지 및 탈퇴
  updateStatus(id, { status, isBanned }) {
    return this.#prisma.user.update({
      where: { id },
      data: {
        status,
        is_banned: isBanned,
        ...(isBanned && { refresh_token: null }), //접속 차단
      },
    });
  }

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
      where: {
        provider: provider,
        provider_id: providerId,
        status: { not: 'WITHDRAWN' },
      },
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
        status: 'ACTIVE',
      },
    });
  }
}
