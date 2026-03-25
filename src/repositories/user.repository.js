import { validateSort } from '#utils/sort.util.js';

export class UserRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  //페이지네이션 포함
  findAll({ skip = 0, take = 10, status, sortBy, sortOrder } = {}) {
    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = validateSort({
      sortBy,
      sortOrder,
      allowedFields: [
        'created_at',
        'nickname',
        'participation_count',
        'best_selection_count',
      ],
      defaultField: 'created_at',
    });

    return this.#prisma.user.findMany({
      where: { ...(status && { status }) },
      skip: Number(skip),
      take: Number(take),
      orderBy: {
        [safeSortBy]: safeSortOrder,
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
        refresh_token: true,
        created_at: true,
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

  findByNickname(nickname) {
    return this.#prisma.user.findFirst({
      where: { nickname, status: { not: 'WITHDRAWN' } },
      select: { id: true, nickname: true },
    });
  }

  create(data) {
    return this.#prisma.user.create({
      data: {
        email: data.email,
        password_hash: data.passwordHash,
        nickname: data.nickname,
        provider: data.provider || 'LOCAL',
        provider_id: data.providerId || null,
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
      data: {
        nickname: data.nickname,
        grade: data.grade,
        participation_count: data.participationCount,
        best_selection_count: data.bestSelectionCount,
      },
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
  deleteUser(id, { nickname, email, deletedAt }) {
    return this.#prisma.user.update({
      where: { id },
      data: {
        status: 'WITHDRAWN',
        deleted_at: deletedAt,
        nickname, //'탈퇴한 사용자'로 변경
        email,
        refresh_token: null, //강제 로그아웃
      },
    });
  }

  //마스터의 어드민 승격용
  updateRole(id, role) {
    return this.#prisma.user.update({
      where: { id },
      data: { role },
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
      data: { refresh_token:refreshToken },
    });
  }

  //소셜로그인 관련
  findBySocialAccount(provider, providerId) {
    return this.#prisma.user.findFirst({
      where: {
        provider,
        provider_id: String(providerId),
        status: { not: 'WITHDRAWN' },
      },
    });
  }

  connectSocialAccount(userId, { provider, providerId }) {
    return this.#prisma.user.update({
      where: { id: userId },
      data: { provider, provider_id: String(providerId) },
    });
  }

  createWithSocialAccount(data) {
    return this.#prisma.user.create({
      data: {
        email: data.email,
        nickname: data.nickname || data.name,
        provider: data.provider,
        provider_id: String(data.providerId),
        grade: 'NORMAL',
        status: 'ACTIVE',
      },
    });
  }
}
