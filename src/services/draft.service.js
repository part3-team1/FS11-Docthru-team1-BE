export class DraftService {
  #draftRepository;

  constructor({ draftRepository }) {
    this.#draftRepository = draftRepository;
  }

  async getListDraft(user_id, challenge_id) {
    // //모달 내 목록 조회 시 (예시입니다. 주석 해제 후 확인해주세요!)
    // const drafts = await this.#draftRepository.findByUserAndChallenge(
    //   user_id,
    //   challenge_id,
    // );
    // return { totalCount: drafts.length, items: drafts };
  }

  async getLatestDraft(user_id, challenge_id) {
    //페이지 진입 시 '이전 작업물을 불러오시겠어요?' 모달에 사용
  }

  async getDraft(id) {
    //특정 임시저장본 상세조회
  }

  async saveDraft(user_id, challenge_id, data) {
    //임시 저장 시
  }

  async deleteDraft(id) {
    //모달 내에서 특정 임시저장 삭제 시
  }
}
