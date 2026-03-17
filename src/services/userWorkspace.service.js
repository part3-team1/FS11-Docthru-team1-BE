export class UserWorkspaceService {
  #userWorkspaceRepository;

  constructor({ userWorkspaceRepository }) {
    this.#userWorkspaceRepository = userWorkspaceRepository;
  }

  //메소드 이름은 원하시는대로 변경하셔도 되고, 필요하시면 더 추가하셔도 됩니다!

  async getListUserWorkspace(userId) {
    // //모달 내 목록 조회 시 (예시입니다. 주석 해제 후 확인해주세요!)
    // const list = await this.#userWorkspaceRepository.findAllByUserId(userId);
    // return { totalCount: list.length, items: list };
  }

  async getLatestUserWorkspace(userId, challengeId) {
    //페이지 진입 시 '이전 작업물을 불러오시겠어요?' 모달에 사용
  }

  async saveUserWorkspace(userId, challengeId, data) {
    //임시 저장 시
  }

  async deleteUserWorkspace(id) {
    //모달 내에서 특정 임시저장 삭제 시
  }
}
