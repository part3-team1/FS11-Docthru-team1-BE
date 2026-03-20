import { validateSort } from '#utils/sort.util.js';

export class SubmissionRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  //페이지네이션 포함
  findAllByChallengeId(
    challenge_id,
    { skip = 0, take = 5, sortBy, sortOrder } = {},
  ) {
    const { sortBy: safeSortBy, sortOrder: safeSortOrder } = validateSort({
      sortBy,
      sortOrder,
      allowedFields: ['heart_count', 'created_at'],
      defaultField: 'heart_count',
    });

    const whereCondition = {
      challenge_id,
      is_blocked: false,
      is_deleted: false,
    };

    return this.#prisma
      .$transaction([
        this.#prisma.submission.findMany({
          where: whereCondition,
          skip: Number(skip),
          take: Number(take),
          orderBy: [{ [safeSortBy]: safeSortOrder }, { created_at: 'desc' }],
          include: {
            user: {
              select: { nickname: true, grade: true, status: true },
            },
          },
        }),
        this.#prisma.submission.count({ where: whereCondition }),
      ])
      .then(([submissions, totalCount]) => {
        return { submissions, totalCount };
      });
  }

  //마이페이지용 내 작업물 모아보기
  findAllByUserId(user_id, { skip = 0, take = 10 } = {}) {
    return this.#prisma
      .$transaction([
        this.#prisma.submission.findMany({
          where: { user_id, is_deleted: false },
          skip: Number(skip),
          take: Number(take),
          orderBy: { created_at: 'desc' },
          include: {
            challenge: { select: { title: true, status: true } },
          },
        }),
        this.#prisma.submission.count({
          where: { user_id, is_deleted: false },
        }),
      ])
      .then(([submissions, totalCount]) => {
        return { submissions, totalCount };
      });
  }

  //상위 5위 조회 시
  findTopRankings(challenge_id, limit = 5) {
    return this.#prisma.submission.findMany({
      where: { challenge_id, is_blocked: false, is_deleted: false },
      take: Number(limit),
      orderBy: [
        { is_best: 'desc' },
        { heart_count: 'desc' },
        { created_at: 'desc' },
      ],
      include: {
        user: { select: { nickname: true, grade: true, status: true } },
      },
    });
  }

  findById(id) {
    return this.#prisma.submission.findUnique({
      where: { id },
      include: {
        user: { select: { nickname: true, grade: true, status: true } },
        challenge: { select: { title: true, doc_url: true, status: true } },
      },
    });
  }

  create(data) {
    return this.#prisma.submission.create({
      data: {
        challenge_id: data.challenge_id,
        user_id: data.user_id,
        title: data.title,
        content: data.content,
      },
    });
  }

  update(id, data) {
    return this.#prisma.submission.update({
      where: { id },
      data: { title: data.title, content: data.content },
    });
  }

  delete(id) {
    return this.#prisma.submission.update({
      where: { id },
      data: { is_deleted: true },
    });
  }

  //어드민 관련 (1등 왕관 표시용)
  updateBestStatus(id, is_best) {
    return this.#prisma.submission.update({
      where: { id },
      data: { is_best },
    });
  }

  //자동차단용
  updateBlockStatus(id, is_blocked) {
    return this.#prisma.submission.update({
      where: { id },
      data: { is_blocked },
    });
  }
}
