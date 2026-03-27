import { validateSort } from '#utils/sort.util.js';

export class UserRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  //페이지네이션 포함
  async findAll({ skip = 0, take = 10, status, sortBy, sortOrder } = {}) {
    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = validateSort({
      sortBy,
      sortOrder,
      allowedFields: [
        'createdAt',
        'nickname',
        'participationCount',
        'bestSelectionCount',
      ],
    });

    const where = { ...(status && { status }) };

    return this.#prisma
      .$transaction([
        this.#prisma.user.findMany({
          where,
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
            isBanned: true,
            participationCount: true,
            bestSelectionCount: true,
            createdAt: true,
            deletedAt: true,
            participations: {
              orderBy: { joinedAt: 'desc' },
              select: {
                challenge: {
                  select: { title: true },
                },
              },
            },
          },
        }),
        this.#prisma.user.count({ where }),
      ])
      .then(([users, totalCount]) => {
        return { users, totalCount };
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
        isBanned: true,
        participationCount: true,
        bestSelectionCount: true,
        refreshToken: true,
        createdAt: true,
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
        isBanned: true,
        participationCount: true,
        bestSelectionCount: true,
        ...(includePassword ? { passwordHash: true } : {}),
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
        passwordHash: data.passwordHash,
        nickname: data.nickname,
        provider: data.provider || 'LOCAL',
        providerId: data.providerId || null,
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
        participationCount: data.participationCount,
        bestSelectionCount: data.bestSelectionCount,
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        grade: true,
        participationCount: true,
        bestSelectionCount: true,
      },
    });
  }

  //자진 탈퇴
  deleteUser(id, { nickname, email, deletedAt }) {
    return this.#prisma.user.update({
      where: { id },
      data: {
        status: 'WITHDRAWN',
        deletedAt,
        nickname, //'탈퇴한 사용자'로 변경
        email,
        refreshToken: null, //강제 로그아웃
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
        isBanned,
        ...(isBanned && { refreshToken: null }), //접속 차단
      },
    });
  }

  //리프레시 토큰 저장용
  updateRefreshToken(id, refreshToken) {
    return this.#prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
  }

  //소셜로그인 관련
  findBySocialAccount(provider, providerId) {
    return this.#prisma.user.findFirst({
      where: {
        provider,
        providerId: String(providerId),
        status: { not: 'WITHDRAWN' },
      },
    });
  }

  connectSocialAccount(userId, { provider, providerId }) {
    return this.#prisma.user.update({
      where: { id: userId },
      data: { provider, providerId: String(providerId) },
    });
  }

  createWithSocialAccount(data) {
    return this.#prisma.user.create({
      data: {
        email: data.email,
        nickname: data.nickname || data.name,
        provider: data.provider,
        providerId: String(data.providerId),
        grade: data.grade || 'NORMAL',
        status: data.status || 'ACTIVE',
      },
    });
  }
}
