export class UserWorkspaceRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  saveUserWorkspace(userId, challengeId, data) {
    return this.#prisma.userWorkspace.upsert({
      where: {
        user_id_challenge_id: { user_id: userId, challenge_id: challengeId },
      },
      update: {
        ...data,
        updated_at: new Date(),
      },
      create: {
        ...data,
        user_id: userId,
        challenge_id: challengeId,
      },
    });
  }
}
