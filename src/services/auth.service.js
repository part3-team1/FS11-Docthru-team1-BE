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
  async login({email,password}){
    await this.#userRepository.findUserByEmail(email);
    if (!authUser) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    const isPasswordValid = await this.#passwordProvider.compare(password,authUser.password);
    if(!isPasswordValid){
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  
  const tokens = this.#tokenProvider.generateTokens(authUser);
    await this.#userRepository.updateRefreshToken(authUser.id, tokens.refreshToken);

    return { user: authUser, tokens };
  }  
  async getMe(userId){
    const user = await this.#userRepository.findById(userId);
    if (!user) {
      throw new ('유저를 찾을 수 없습니다.');
    }
    return user;
  }
  async refreshTokens(refreshToken) {
    const payload = this.#tokenProvider.verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new Error('유효하지 않은 토큰입니다.');
    } 

    const user = await this.#userRepository.findById(payload.userId);

    if (!user) {
      throw new Error('유저를 찾을 수 없습니다.');
    }

    const tokens = this.#tokenProvider.generateTokens(user);
    await this.#userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    return { user, tokens };
  } 
}