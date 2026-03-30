export class DraftRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  create(data) {
    //새 임시저장 생성
    return this.#prisma.draft.create({
      data: {
        title: data.title,
        content: data.content,
        userId: data.userId,
        challengeId: data.challengeId,
      },
    });
  }

  findById(id) {
    //모달에서 특정 저장 불러올 때
    return this.#prisma.draft.findUnique({
      where: { id },
    });
  }

  findByUserAndChallenge(userId, challengeId) {
    //임시 저장 목록(모달 리스트용)
    return this.#prisma.draft.findMany({
      where: {
        userId,
        challengeId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  delete(id) {
    //모달에서 직접 유저가 삭제할 때
    return this.#prisma.draft.delete({
      where: { id },
    });
  }

  //최종제출 완료 후 임시저장에서 비우기
  deleteByChallenge(userId, challengeId) {
    return this.#prisma.draft.deleteMany({
      where: { userId, challengeId },
    });
  }
}
