export const PRISMA_ERROR = {
  UNIQUE_CONSTRAINT: 'P2002',
  RECORD_NOT_FOUND: 'P2025',
  FOREIGN_KEY_CONSTRAINT: 'P2003',
  NULL_CONSTRAINT: 'P2011',
};

export const ERROR_MESSAGE = {
  // 인증 및 계정 관련
  USER_BANNED: '운영 정책 위반으로 계정이 정지되었습니다.',
  USER_WITHDRAWN: '계정이 탈퇴 처리되었습니다.',
  DUPLICATE_EMAIL: '이미 사용 중인 이메일입니다.',
  DUPLICATE_NICKNAME: '이미 사용 중인 닉네임입니다.',
  INVALID_LOGIN: '이메일 또는 비밀번호가 올바르지 않습니다.',
  INVALID_TOKEN: '유효하지 않거나 만료된 토큰입니다.',
  TOKEN_MISMATCH: '보안 인증 정보가 일치하지 않습니다.',
  LOGIN_REQUIRED: '로그인이 필요합니다.',
  USER_NOT_FOUND: '유저를 찾을 수 없습니다.',
  ACCOUNT_NOT_FOUND: '계정을 찾을 수 없습니다.',
  INACTIVE_ACCOUNT: '사용 권한이 없는 계정입니다.',
  CANNOT_BAN_MASTER: '마스터 계정은 정지하거나 차단할 수 없습니다.',
  AUTH_CODE_REQUIRED: '인증코드는 필수입니다.',
  AUTH_CODE_EMPTY: '인증코드가 비어있습니다.',
  
  //소셜 인증 관련
  INVALID_SOCIAL_AUTH: '소셜 인증 정보가 유효하지 않습니다.',
  FAILED_SOCIAL_AUTH: '소셜 인증에 실패했습니다',
  UNSUPPORTED_PROVIDER: '지원하지 않는 소셜 제공자입니다.',
  CANNOT_GET_GOOGLE_TOKEN: 'Google 토큰 요청에 실패했습니다.',
  CANNOT_GET_GOOGEL_PROFILE: 'Google 프로필 조회에 실패했습니다.',

  // 챌린지 관련
  CHALLENGE_NOT_FOUND: '챌린지를 찾을 수 없습니다.',
  CHALLENGE_ALREADY_CLOSED: '이미 마감된 챌린지입니다.',
  CHALLENGE_ALREADY_FINISHED: '이미 완료된 챌린지입니다.',
  CHALLENGE_ALREADY_DELETED: '이미 삭제된 챌린지입니다.',
  CHALLENGE_FOR_EDIT_NOT_FOUND: '수정할 챌린지를 찾을 수 없습니다.',
  CHALLENGE_NOT_OPENED: '현재 참여가능한 상태의 챌린지가 아닙니다.',
  CHALLENGE_EXPIRED: '챌린지의 기간이 이미 종료되었습니다.',
  CHALLENGE_FULL: '참여 인원이 초과되었습니다.',
  ALREADY_PARTICIPATING_CHALLENGE: '이미 참여 중인 챌린지입니다.',
  CHALLENGE_EDIT_RESTRICTED_WITH_PARTICIPANTS:
    '참여 인원이 있는 챌린지는 수정할 수 없습니다',
  NOT_PARTICIPATING_CHALLENGE: '참여 중인 챌린지가 아닙니다.',
  CANNOT_LEAVE_CHALLENGE: '마감된 챌린지는 참여 취소가 불가능합니다',

  // 작업물 관련
  SUBMISSION_NOT_FOUND: '작업물을 찾을 수 없습니다.',
  SUBMISSION_ACCESS_DENIED: '작업물에 접근 권한이 없습니다.',
  CANNOT_LIKE_OWN_SUBMISSION: '본인의 작업물에는 좋아요를 누를 수 없습니다.',

  // 신고 관련
  REPORT_ALREADY_EXISTS: '이미 신고한 내역이 있습니다.',
  INVALID_REPORT_TARGET_TYPE: '유효하지 않은 신고 대상 타입입니다.',
  REPORT_TARGET_NOT_FOUND: '신고 대상을 찾을 수 없습니다.',
  REPORT_NOT_FOUND: '신고 내역을 찾을 수 없습니다.',

  // 알림 관련
  NOTIFICATION_NOT_FOUND: '알림을 찾을 수 없습니다.',
  NOTIFICATION_ACCESS_DENIED: '본인의 알림만 관리할 수 있습니다.',

  // 피드백 관련
  FEEDBACK_NOT_FOUND: '댓글을 찾을 수 없습니다.',
  FEEDBACK_ACCESS_DENIED: '해당 피드백을 수정할 권한이 없습니다.',
  FEEDBACK_BANNED: '댓글이 차단되었습니다.',

  //기타
  INVALID_INPUT: '입력값이 잘못되었습니다.',
  VALIDATION_FAILED: '검증에 실패했습니다.',
  REQUEST_DENIED: '신청이 거부되었습니다.',
  ALREADY_APPROVED: '이미 승인된 요청입니다.',
  ONLY_MASTER_ALLOWED: '마스터 계정만 접근 가능합니다.',
  NOT_CHANGE_ROLE_SELF: '마스터 본인의 권한은 변경할 수 없습니다.',

  //기본 에러 메시지
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  BAD_REQUEST: '잘못된 요청입니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  CONFLICT: '이미 존재하는 리소스입니다.',
  INVALID_TOKEN: '유효하지 않은 토큰입니다.',
  INTERNAL_SERVER_ERROR: '서버 오류가 발생했습니다.',
};

export const VALIDATION_ERROR = {
  EMPTY_EMAIL: '이메일을 입력해주세요.',
  MAX_EMAIL: '이메일은 50자까지 가능합니다.',
  INVALID_EMAIL: '사용할 수 없는 이메일 형식입니다.',
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
  INVALID_CATEGORY: '유효하지 않은 카테고리 형식입니다.',
  INVALID_DOCUMENT_TYPE: '유효하지 않은 리포트 형식입니다.',
  INVALID_REPORT_TYPE: '유효하지 않은 신고 형식입니다.',
  INVALID_REPORT_REASON: '유효하지 않은 신고 사유입니다.',
};
