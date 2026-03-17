export class AuthService {
  #userRepository;
  #passwordProvider;
  #tokenProvider;

  constructor({ userRepository, passwordProvider, tokenProvider }) {
    this.#userRepository = userRepository;
    this.#passwordProvider = passwordProvider;
    this.#tokenProvider = tokenProvider;
  }

  async signup({ email, password, nickname }) {
    const existingUser = await this.#userRepository.findUserByEmail(email);

    if (existingUser) {
      throw new Error('이미 사용 중인 이메일입니다.');
    }

    const hashed = await this.#passwordProvider.hash(password);

    return this.#userRepository.createUser({
      email,
      password: hashed,
      nickname,
    });
  }

  //비번 검증, 등급 승격 체크, 토큰 발급
  async login(){

  }
}
