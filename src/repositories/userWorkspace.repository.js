export class UserWorkspaceRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  //로컬스토리지 관련

  saveUserWorkspace(userId, challengeId, data) {
    // //일단 예시로 작성해봤습니다! 주석 해제 후 확인해주세요!
    // const userWorkspaceData = {
    //   title: data.title || '제목 없음',
    //   doc_url: data.docUrl,
    //   description: data.description,
    //   category: data.category,
    //   document_type: data.documentType,
    //   due_date: data.dueDate,
    //   max_participants: data.maxParticipants,
    // };
    // return this.#prisma.userWorkspace.upsert({
    //   where: {
    //     user_id_challenge_id: { user_id: userId, challenge_id: challengeId },
    //   },
    //   update: {
    //     ...userWorkspaceData,
    //     updated_at: new Date(),
    //   },
    //   create: {
    //     ...userWorkspaceData,
    //     user_id: userId,
    //     challenge_id: challengeId,
    //   },
    // });
  }

  findAllByUserId(userId) {
    //모달에 목록리스트 그릴 때
  }

  findById(id) {
    //모달에서 특정 저장 불러올 때
  }

  deleteUserWorkspace(id) {
    //제출 완료 후 또는 유저가 삭제할 때?
  }

  //필요하시면 추가 또는 삭제하시면 됩니다!!
}
