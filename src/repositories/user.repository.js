import { validateSort } from '#utils/sort.util.js';

export class UserRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  async findAll({ skip = 0, take = 10, status, keyword, role, sortBy, sortOrder } = {}) {
    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = validateSort(
      sortBy,
      sortOrder,
      ['createdAt', 'nickname', 'participationCount', 'bestSelectionCount'],
    );

    const roleWhere = (() => {
      if (role === 'ADMIN') return { role: { in: ['ADMIN', 'MASTER'] } };
      if (role === 'EXPERT') return { role: 'USER', grade: 'EXPERT' };
      if (role === 'USER') return { role: 'USER', grade: 'NORMAL' };
      return {};
    })();

    const where = {
      ...(status && { status }),
      ...(keyword && { nickname: { contains: keyword, mode: 'insensitive' } }),
      ...roleWhere,
    };

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

  deleteUser(id, { nickname, email, deletedAt }) {
    return this.#prisma.user.update({
      where: { id },
      data: {
        status: 'WITHDRAWN',
        deletedAt,
        nickname,
        email,
        refreshToken: null,
      },
    });
  }

  updateRole(id, role) {
    return this.#prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  updateStatus(id, { status, isBanned }) {
    return this.#prisma.user.update({
      where: { id },
      data: {
        status,
        isBanned,
        ...(isBanned && { refreshToken: null }),
      },
    });
  }

  updateRefreshToken(id, refreshToken) {
    return this.#prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
  }

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
