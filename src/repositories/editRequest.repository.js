export class EditRequestRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  createEditRequest(data) {
    return this.#prisma.editRequest.create({
      data: {
        challenge_id: data.challengeId,
        user_id: data.userId,
        reason: data.reason,
        change_content: data.changeContent,
      },
    });
  }
}
