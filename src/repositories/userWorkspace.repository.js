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
    //   due_date: new Date(data.dueDate),
    //   max_participants: Number(data.maxParticipants),
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

  //메소드 이름은 원하시는대로 변경하셔도 되고, 필요하시면 더 추가하셔도 됩니다!

  findAllByUserId(userId) {
    //모달에 목록리스트 그릴 때
  }

  findById(id) {
    //모달에서 특정 저장 불러올 때
  }

  findByUserAndChallenge(userId, challengeId) {
    //서비스의 getLatestUserWorkspace에 활용
  }

  deleteUserWorkspace(id) {
    //모달에서 직접 유저가 삭제할 때?
  }

  //최종제출 완료 후 임시저장에서 비워질 때
  deleteUserWorkspaceByChallenge(userId, challengeId) {
    return this.#prisma.userWorkspace.delelte({
      where: {
        user_id_challenge_id: { user_id: userId, challenge_id: challengeId },
      },
    });
  }
}
