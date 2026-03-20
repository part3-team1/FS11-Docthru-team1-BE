export const PRISMA_ERROR = {
  UNIQUE_CONSTRAINT: 'P2002',
  RECORD_NOT_FOUND: 'P2025',
};

export const ERROR_MESSAGE = {
  EMAIL_ALREADY_EXISTS: '이미 사용 중인 이메일입니다.',
  NICKNAME_ALREADY_EXISTS: '이미 사용 중인 닉네임입니다.',
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  INVALID_TOKEN: '유효하지 않은 토큰입니다.',
  USER_NOT_FOUND: '유저를 찾을 수 없습니다.',
  USER_NOT_FOUND_FORM_TOKEN: '토큰에서 유저를 찾을수 없습니다.',

  INVALID_GOOGLE_TOKEN: '유효하지 않은 Google 토큰입니다.',
  NO_REFRESH_TOKEN: 'Refresh Token이 없습니다.',

  CHALLENGE_NOT_FOUND: '챌린지를 찾을 수 없습니다.',
  ALREADY_APPLIED: '이미 신청한 챌린지 입니다.',
  MY_CHALLENGE_NOT_FOUND: '나의 챌린지를 찾을 수 없습니다.',

  SUBMISSION_NOT_FOUND: '작업물을 찾을 수 없습니다.',
  SUBMISSION_FORBIDDEN: '작업물에 대한 권한이 없습니다.',

  ATTEMPT_NOT_FOUND: '도전 내역을 찾을 수 없습니다.',
  ATTEMPT_FORBIDDEN: '도전 내역에 대한 권한이 없습니다.',
  TEMP_NOT_FOUND: '저장된 임시작업이 없습니다.',
  APPLICATION_NOT_FOUND: '신청 내역을 찾을 수 없습니다.',
  FEEDBACK_TARGET_NOT_FOUND: '피드백 대상 작업물을 찾을 수 없습니다',

  INVALID_INPUT: 'Invalid input',
  VALIDATION_FAILED: 'Validation failed',

  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  BAD_REQUEST: '잘못된 요청입니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  CONFLICT: '이미 존재하는 리소스입니다.',
  INTERNAL_SERVER_ERROR: '서버 오류가 발생했습니다.',
};

export const VALIDATION_ERROR = {
  MIN_NICKNAME: '닉네임은 최소 2자 이상이어야 합니다.',
  MAX_NICKNAME: '닉네임은 최대 8자까지 가능합니다.',
  MIN_PASSWORD: '비밀번호는 최소 8자 이상이어야 합니다.',
  MAX_PASSWORD: '비밀번호는 최대 12자까지 가능합니다.',
  REGEX_PASSWORD:
    '비밀번호는 영문, 숫자 및 허용된 특수문자(~!@#$%^&*)만 가능합니다.',
  MIN_TITLE: '제목은 최소 10자 이상이어야 합니다.',
  MAX_TITLE: '제목은 최대 50자까지 가능합니다.',
  MAX_DESCRIPTION: '소개는 최대 150자까지 가능합니다.',
  MAX_PARTICIPANTS: '참여인원은 최소 5명 이상이어야 합니다.',
  MIN_PARTICIPANTS: '참여인원은 최대 20명까지 참여가 가능합니다.',
  MAX_FEEDBACK: '댓글은 최대 500자까지 가능합니다.',
  INVALID_ID: '유효하지 않은 아이디 형식입니다.',
  INVALID_REPORT_REASON: '유효하지 않은 신고 사유입니다.',
};
