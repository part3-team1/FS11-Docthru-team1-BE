export class DraftRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  create(userId, challengeId, data) {
    //새 임시저장 생성(복수 저장 가능)
  }

  update(id, data) {
    //기존 임시저장  덮어쓰기
  }

  findAllByUserId(userId) {
    //전체 임시저장 목록(마이페이지용)
  }

  findById(id) {
    //모달에서 특정 저장 불러올 때
  }

  findByUserAndChallenge(userId, challengeId) {
    //임시 저장 목록(모달 리스트용)
  }

  findLatest(userId, challengeId) {
    //가장 최근 임시저장 불러오기
  }

  delete(id) {
    //모달에서 직접 유저가 삭제할 때
  }

  //최종제출 완료 후 임시저장에서 비우기
  deleteByChallenge(userId, challengeId) {
    return this.#prisma.draft.deleteMany({
      where: { userId, challengeId },
    });
  }
}
