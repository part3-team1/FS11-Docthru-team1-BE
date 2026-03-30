import { DRAFT_LIMIT, ERROR_MESSAGE } from '#constants';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '#exceptions';

export class DraftService {
  #draftRepository;

  constructor({ draftRepository }) {
    this.#draftRepository = draftRepository;
  }

  async getDraftList(userId, challengeId) {
    //모달 내 목록 조회 시
    const drafts = await this.#draftRepository.findByUserAndChallenge(
      userId,
      challengeId,
    );

    return { items: drafts, totalCount: drafts.length };
  }

  async getDraftById(userId, id) {
    //특정 임시저장본 상세조회
    const draft = await this.#draftRepository.findById(id);
    if (!draft) {
      throw new NotFoundException(ERROR_MESSAGE.DRAFT_NOT_FOUND);
    }

    if (draft.userId !== userId) {
      throw new ForbiddenException(ERROR_MESSAGE.FORBIDDEN);
    }

    return draft;
  }

  async saveDraft(userId, challengeId, data) {
    //임시 저장 시
    const drafts = await this.#draftRepository.findByUserAndChallenge(
      userId,
      challengeId,
    );

    if (drafts.length >= DRAFT_LIMIT) {
      throw new BadRequestException(ERROR_MESSAGE.DRAFT_LIMIT_EXCEEDED);
    }

    const title = data.title || '제목 없음';

    return await this.#draftRepository.create({
      ...data,
      title,
      userId,
      challengeId,
    });
  }

  async deleteDraft(userId, id) {
    //모달 내에서 특정 임시저장 삭제 시
    const draft = await this.getDraftById(userId, id);

    return await this.#draftRepository.delete(draft.id);
  }
}
