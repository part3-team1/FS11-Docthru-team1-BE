import bcrypt from 'bcrypt';

export class PasswordProvider {
  #saltRounds;

  constructor() {
    this.#saltRounds = 10;
  }

  async hash(password) {
    try {
      return await bcrypt.hash(password, this.#saltRounds);
    } catch (error) {
      console.error('Hashing Error:', error);
      throw new Error('비밀번호 암호화 중 오류가 발생했습니다.');
    }
  }

  async compare(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('Compare Error:', error);
      return false;
    }
  }
}
