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
        password_hash: data.password_hash,
        nickname: data.nickname,
        provider: data.provider || 'LOCAL',
        provider_id: data.provider_id || null,
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

  //마스터의 어드민 승격용
  updateRole(id, role) {
    return this.#prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  //강제 정지 및 탈퇴
  updateStatus(id, { status, is_banned }) {
    return this.#prisma.user.update({
      where: { id },
      data: {
        status,
        is_banned,
        ...(is_banned && { refresh_token: null }), //접속 차단
      },
    });
  }

  //리프레시 토큰 저장용
  updateRefreshToken(id, refresh_token) {
    return this.#prisma.user.update({
      where: { id },
      data: { refresh_token },
    });
  }

  //소셜로그인 관련
  findBySocialAccount(provider, provider_id) {
    return this.#prisma.user.findFirst({
      where: {
        provider,
        provider_id: String(provider_id),
        status: { not: 'WITHDRAWN' },
      },
    });
  }

  connectSocialAccount(userId, { provider, provider_id }) {
    return this.#prisma.user.update({
      where: { id: userId },
      data: { provider, provider_id: String(provider_id) },
    });
  }

  createWithSocialAccount(data) {
    return this.#prisma.user.create({
      data: {
        email: data.email,
        nickname: data.nickname || data.name,
        provider: data.provider,
        provider_id: String(data.provider_id),
        grade: 'NORMAL',
        status: 'ACTIVE',
      },
    });
  }
}
