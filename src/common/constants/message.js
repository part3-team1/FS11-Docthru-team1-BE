export const NOTIFICATION_MESSAGES = {
  CHALLENGE_APPROVED: (title) =>
    `[${title}] 챌린지가 성공적으로 승인되었습니다.`,
  CHALLENGE_REJECTED: (title) => `[${title}] 챌린지가 거부되었습니다.`,
  CHALLENGE_CLOSED: (title) => `[${title}] 챌린지가 마감되었습니다.`,
  CHALLENGE_DELETED: (title) =>
    `[${title}] 챌린지가 관리자에 의해 삭제되었습니다.`,
  CHALLENGE_PARTICIPATED: (title) =>
    `[${title}] 챌린지에 새로운 참여자가 있습니다.`,
  REQUEST_DELETED: (title) =>
    `신청하신 [${title}] 챌린지 요청이 관리자에 의해 삭제되었습니다.`,
  SUBMISSION_ADDED: (title) =>
    `[${title}] 챌린지에 성공적으로 작업물이 추가되었습니다.`,
  SUBMISSION_DELETED: (title) =>
    `[${title}] 작업물이 성공적으로 삭제되었습니다.`,
  SUBMISSION_BANNED: (title) =>
    `[${title}] 작업물이 운영 정책 위반으로 삭제되었습니다.`,
  FEEDBACK_ADDED: (title) =>
    `[${title}] 챌린지 작업물에 댓글이 추가되었습니다.`,
  FEEDBACK_MODIFIED: (title) =>
    `[${title}] 챌린지 작업물에 작성한 댓글이 수정되었습니다.`,
  AUTO_BLOCKED: (title) =>
    `해당 [${title}](이)가 신고 누적으로 자동 차단되었습니다.`,
  USER_BANNED: '운영 정책 위반으로 계정 이용이 제한되었습니다.',
  FEEDBACK_DELETED: '운영 정책 위반으로 댓글이 삭제되었습니다.',
  FEEDBACK_BANNED: '운영 정책 위반으로 댓글이 차단되었습니다.',
  HEART_TOGGLED: '사용자님의 작업물에 새로운 하트❤️가 달렸습니다.',
  REPORT_PROCESSED: '신고가 정상적으로 처리되었습니다.',
};
