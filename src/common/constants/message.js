export const NOTIFICATION_MESSAGES = {
  CHALLENGE_APPROVED: (title) => `신청하신 [${title}] 챌린지가 승인되었습니다.`,
  CHALLENGE_REJECTED: (title) => `신청하신 [${title}] 챌린지가 거부되었습니다.`,
  CHALLENGE_PARTICIPATED: (title) => `[${title}] 챌린지에 참여했습니다.`,
  EDITREQUEST_APPROVED: (title) =>
    `요청하신 [${title}] 챌린지 내용이 관리자에 의해 변경되었습니다.`,
  USER_BANNED: '운영 정책 위반으로 계정이 정지되었습니다.',
  FEEDBACK_BANNED: '운영 정책 위반으로 댓글이 차단되었습니다',
  FEEDBACK_UPDATED: '사용자님의 댓글이 수정되었습니다.',
  SUBMISSION_CREATED: '작업물이 정상적으로 제출되었습니다.',
  SUBMISSION_BANNED: '운영 정책 위반으로 작업물이 차단되었습니다',
  HEART_TOGGLED: '사용자님의 작업물에 새로운 하트❤️가 달렸습니다.',
  REPORT_PROCESSED: '신고가 정상적으로 처리되었습니다.',
};
