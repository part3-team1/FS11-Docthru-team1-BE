export class HeartService {
  #heartRepository;

  constructor({ heartRepository }) {
    this.#heartRepository = heartRepository;
  }

  async getMyHearts(userId, query) {
    const result = await this.#heartRepository.findAllByUserId(userId, query);

    return { items: result.hearts, totalCount: result.totalCount };
  }
}
