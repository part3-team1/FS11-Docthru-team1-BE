import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { signupSchema, loginSchema, googleLoginSchema, refreshTokenSchema } from '../common/schemas/auth.schema.js';

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

const ErrorResponse = registry.register('ErrorResponse', z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: '에러 메시지' }),
}).openapi('ErrorResponse'));

const Tokens = registry.register('Tokens', z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
}).openapi('Tokens'));

const User = registry.register('User', z.object({
  id: z.number(),
  email: z.string(),
  nickname: z.string(),
  role: z.enum(['USER', 'ADMIN', 'MASTER']),
  grade: z.enum(['NORMAL', 'EXPERT']),
  status: z.enum(['ACTIVE', 'BANNED', 'WITHDRAWN']),
  isBanned: z.boolean(),
  participationCount: z.number(),
  bestSelectionCount: z.number(),
  provider: z.enum(['LOCAL', 'GOOGLE', 'KAKAO', 'NAVER']),
  createdAt: z.string(),
}).openapi('User'));

const ChallengeRequest = registry.register('ChallengeRequest', z.object({
  id: z.number(),
  title: z.string(),
  docUrl: z.string(),
  description: z.string(),
  category: z.string(),
  documentType: z.string(),
  dueDate: z.string(),
  maxParticipants: z.number(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  rejectionReason: z.string().nullable(),
  createdAt: z.string(),
}).openapi('ChallengeRequest'));

const Challenge = registry.register('Challenge', z.object({
  id: z.number(),
  title: z.string(),
  docUrl: z.string(),
  description: z.string(),
  category: z.string(),
  documentType: z.string(),
  dueDate: z.string(),
  maxParticipants: z.number(),
  currentParticipants: z.number(),
  status: z.enum(['OPENED', 'CLOSED', 'DELETED']),
  approvedAt: z.string().nullable(),
}).openapi('Challenge'));

const Submission = registry.register('Submission', z.object({
  id: z.number(),
  title: z.string(),
  content: z.record(z.any()),
  heartCount: z.number(),
  isBest: z.boolean(),
  isBlocked: z.boolean(),
  isDeleted: z.boolean(),
  createdAt: z.string(),
  user: z.object({ id: z.number(), nickname: z.string() }),
  challenge: z.object({ id: z.number(), title: z.string() }),
}).openapi('Submission'));

const Feedback = registry.register('Feedback', z.object({
  id: z.number(),
  content: z.string(),
  isBlocked: z.boolean(),
  createdAt: z.string(),
  user: z.object({ id: z.number(), nickname: z.string() }),
}).openapi('Feedback'));

const Draft = registry.register('Draft', z.object({
  id: z.number(),
  challengeId: z.number(),
  title: z.string(),
  content: z.record(z.any()),
  createdAt: z.string(),
  updatedAt: z.string(),
}).openapi('Draft'));

const Notification = registry.register('Notification', z.object({
  id: z.number(),
  type: z.enum(['CHALLENGE_APPROVED', 'CHALLENGE_REJECTED', 'SUBMISSION_BEST', 'FEEDBACK_RECEIVED', 'HEART_RECEIVED', 'REPORT_RECEIVED', 'BANNED']),
  message: z.string(),
  reason: z.string().nullable(),
  isRead: z.boolean(),
  createdAt: z.string(),
}).openapi('Notification'));

const Report = registry.register('Report', z.object({
  id: z.string(),
  targetId: z.string(),
  reportType: z.enum(['CHALLENGE', 'FEEDBACK', 'SUBMISSION']),
  reason: z.string(),
  createdAt: z.string(),
}).openapi('Report'));

registry.registerPath({
  method: 'post', path: '/api/auth/signup', tags: ['Auth'], summary: '일반 회원가입',
  request: { body: { content: { 'application/json': { schema: signupSchema } } } },
  responses: {
    201: { description: '회원가입 성공', content: { 'application/json': { schema: z.object({ id: z.number(), email: z.string(), nickname: z.string(), createdAt: z.string() }) } } },
    409: { description: '이메일 또는 닉네임 중복', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'post', path: '/api/auth/login', tags: ['Auth'], summary: '일반 로그인',
  request: { body: { content: { 'application/json': { schema: loginSchema } } } },
  responses: {
    200: { description: '로그인 성공', content: { 'application/json': { schema: z.object({ tokens: Tokens, user: User }) } } },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'post', path: '/api/auth/google', tags: ['Auth'], summary: '구글 로그인',
  request: { body: { content: { 'application/json': { schema: googleLoginSchema } } } },
  responses: {
    200: { description: '구글 로그인 성공', content: { 'application/json': { schema: z.object({ tokens: Tokens, user: User, isNewUser: z.boolean() }) } } },
    401: { description: '유효하지 않은 구글 토큰', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'post', path: '/api/auth/logout', tags: ['Auth'], summary: '로그아웃',
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: '로그아웃 성공' },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'post', path: '/api/auth/token/refresh', tags: ['Auth'], summary: '토큰 재발급',
  request: { body: { content: { 'application/json': { schema: refreshTokenSchema } } } },
  responses: {
    200: { description: '재발급 성공', content: { 'application/json': { schema: Tokens } } },
    401: { description: '유효하지 않은 토큰', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'get', path: '/api/users/me', tags: ['Users'], summary: '내 프로필 조회',
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: '조회 성공', content: { 'application/json': { schema: User } } },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'patch', path: '/api/users/me', tags: ['Users'], summary: '내 프로필 수정',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'multipart/form-data': { schema: z.object({ nickname: z.string().optional(), profileImage: z.string().optional().openapi({ format: 'binary' }) }) } } } },
  responses: {
    200: { description: '수정 성공', content: { 'application/json': { schema: User } } },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
    409: { description: '닉네임 중복', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'delete', path: '/api/users/me', tags: ['Users'], summary: '회원 탈퇴',
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: '탈퇴 성공' },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'post', path: '/api/challenge-requests', tags: ['ChallengeRequest'], summary: '챌린지 신청',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            title: z.string().openapi({ example: '챌린지 제목' }),
            docUrl: z.string().url().openapi({ example: 'https://docs.example.com' }),
            description: z.string().openapi({ example: '챌린지 설명' }),
            category: z.string().openapi({ example: 'Next.js' }),
            documentType: z.string().openapi({ example: '공식문서' }),
            dueDate: z.string(),
            maxParticipants: z.number().openapi({ example: 10 }),
          }).openapi('CreateChallengeRequest'),
        },
      },
    },
  },
  responses: {
    201: { description: '신청 성공', content: { 'application/json': { schema: ChallengeRequest } } },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'get', path: '/api/challenge-requests', tags: ['ChallengeRequest'], summary: '내 챌린지 신청 목록',
  security: [{ bearerAuth: [] }],
  request: { query: z.object({ status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(), page: z.coerce.number().default(1), limit: z.coerce.number().default(10) }) },
  responses: {
    200: { description: '조회 성공', content: { 'application/json': { schema: z.object({ items: z.array(ChallengeRequest), total: z.number(), page: z.number(), limit: z.number() }) } } },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'get', path: '/api/challenges', tags: ['Challenge'], summary: '챌린지 목록 조회',
  request: { query: z.object({ status: z.enum(['OPENED', 'CLOSED', 'DELETED']).optional(), category: z.string().optional(), page: z.coerce.number().default(1), limit: z.coerce.number().default(10) }) },
  responses: {
    200: { description: '조회 성공', content: { 'application/json': { schema: z.object({ items: z.array(Challenge), total: z.number(), page: z.number(), limit: z.number(), totalPages: z.number() }) } } },
  },
});

registry.registerPath({
  method: 'get', path: '/api/challenges/{id}', tags: ['Challenge'], summary: '챌린지 상세 조회',
  request: { params: z.object({ id: z.string().openapi({ example: '1' }) }) },
  responses: {
    200: { description: '조회 성공', content: { 'application/json': { schema: Challenge } } },
    404: { description: '챌린지 없음', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'post', path: '/api/challenges/{id}/participate', tags: ['Challenge'], summary: '챌린지 참여',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().openapi({ example: '1' }) }) },
  responses: {
    201: { description: '참여 성공' },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
    409: { description: '이미 참여한 챌린지', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'post', path: '/api/challenges/{id}/edit-requests', tags: ['Challenge'], summary: '챌린지 수정 요청',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().openapi({ example: '1' }) }),
    body: { content: { 'application/json': { schema: z.object({ reason: z.string().openapi({ example: '수정 사유' }), changeContent: z.record(z.any()) }).openapi('CreateEditRequest') } } },
  },
  responses: {
    201: { description: '수정 요청 성공' },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: '챌린지 없음', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'get', path: '/api/submissions', tags: ['Submission'], summary: '작업물 목록 조회',
  security: [{ bearerAuth: [] }],
  request: { query: z.object({ challengeId: z.coerce.number().optional(), onlyMine: z.coerce.boolean().optional(), page: z.coerce.number().default(1), limit: z.coerce.number().default(10) }) },
  responses: {
    200: { description: '조회 성공', content: { 'application/json': { schema: z.object({ items: z.array(Submission), total: z.number(), page: z.number(), limit: z.number() }) } } },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'post', path: '/api/submissions', tags: ['Submission'], summary: '작업물 제출',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: z.object({ challengeId: z.number().openapi({ example: 1 }), title: z.string().openapi({ example: '작업물 제목' }), content: z.record(z.any()) }).openapi('CreateSubmission') } } } },
  responses: {
    201: { description: '제출 성공', content: { 'application/json': { schema: Submission } } },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'get', path: '/api/submissions/{id}', tags: ['Submission'], summary: '작업물 상세 조회',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().openapi({ example: '1' }) }) },
  responses: {
    200: { description: '조회 성공', content: { 'application/json': { schema: Submission } } },
    404: { description: '작업물 없음', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'patch', path: '/api/submissions/{id}', tags: ['Submission'], summary: '작업물 수정',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().openapi({ example: '1' }) }), body: { content: { 'application/json': { schema: z.object({ title: z.string().optional(), content: z.record(z.any()).optional() }).openapi('UpdateSubmission') } } } },
  responses: {
    200: { description: '수정 성공', content: { 'application/json': { schema: Submission } } },
    403: { description: '권한 없음', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: '작업물 없음', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'delete', path: '/api/submissions/{id}', tags: ['Submission'], summary: '작업물 삭제',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().openapi({ example: '1' }) }) },
  responses: {
    200: { description: '삭제 성공' },
    403: { description: '권한 없음', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: '작업물 없음', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'post', path: '/api/submissions/{id}/hearts', tags: ['Submission'], summary: '좋아요',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().openapi({ example: '1' }) }) },
  responses: {
    201: { description: '좋아요 성공' },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
    409: { description: '이미 좋아요한 작업물', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'delete', path: '/api/submissions/{id}/hearts', tags: ['Submission'], summary: '좋아요 취소',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().openapi({ example: '1' }) }) },
  responses: {
    200: { description: '좋아요 취소 성공' },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: '좋아요 없음', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'get', path: '/api/submissions/{id}/feedbacks', tags: ['Feedback'], summary: '피드백 목록 조회',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().openapi({ example: '1' }) }) },
  responses: {
    200: { description: '조회 성공', content: { 'application/json': { schema: z.object({ items: z.array(Feedback), total: z.number() }) } } },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'post', path: '/api/submissions/{id}/feedbacks', tags: ['Feedback'], summary: '피드백 작성',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().openapi({ example: '1' }) }), body: { content: { 'application/json': { schema: z.object({ content: z.string().openapi({ example: '피드백 내용' }) }).openapi('CreateFeedback') } } } },
  responses: {
    201: { description: '피드백 작성 성공', content: { 'application/json': { schema: Feedback } } },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'delete', path: '/api/feedbacks/{id}', tags: ['Feedback'], summary: '피드백 삭제',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().openapi({ example: '1' }) }) },
  responses: {
    200: { description: '삭제 성공' },
    403: { description: '권한 없음', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: '피드백 없음', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'get', path: '/api/drafts', tags: ['Draft'], summary: '임시저장 목록 조회',
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: '조회 성공', content: { 'application/json': { schema: z.object({ items: z.array(Draft) }) } } },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'post', path: '/api/drafts', tags: ['Draft'], summary: '임시저장',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: z.object({ challengeId: z.number().openapi({ example: 1 }), title: z.string().openapi({ example: '임시저장 제목' }), content: z.record(z.any()) }).openapi('CreateDraft') } } } },
  responses: {
    201: { description: '임시저장 성공', content: { 'application/json': { schema: Draft } } },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'patch', path: '/api/drafts/{id}', tags: ['Draft'], summary: '임시저장 수정',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().openapi({ example: '1' }) }), body: { content: { 'application/json': { schema: z.object({ title: z.string().optional(), content: z.record(z.any()).optional() }).openapi('UpdateDraft') } } } },
  responses: {
    200: { description: '수정 성공', content: { 'application/json': { schema: Draft } } },
    403: { description: '권한 없음', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: '임시저장 없음', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'delete', path: '/api/drafts/{id}', tags: ['Draft'], summary: '임시저장 삭제',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().openapi({ example: '1' }) }) },
  responses: {
    200: { description: '삭제 성공' },
    403: { description: '권한 없음', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: '임시저장 없음', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'get', path: '/api/notifications', tags: ['Notification'], summary: '알림 목록 조회',
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: '조회 성공', content: { 'application/json': { schema: z.object({ items: z.array(Notification), total: z.number() }) } } },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'patch', path: '/api/notifications/{id}/read', tags: ['Notification'], summary: '알림 읽음 처리',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().openapi({ example: '1' }) }) },
  responses: {
    200: { description: '읽음 처리 성공' },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: '알림 없음', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'post', path: '/api/reports', tags: ['Report'], summary: '신고',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            targetUserId: z.string().openapi({ example: 'user_id' }),
            targetId: z.string().openapi({ example: 'target_id' }),
            reportType: z.enum(['CHALLENGE', 'FEEDBACK', 'SUBMISSION']),
            reason: z.string().openapi({ example: '신고 사유' }),
          }).openapi('CreateReport'),
        },
      },
    },
  },
  responses: {
    201: { description: '신고 성공', content: { 'application/json': { schema: Report } } },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'get', path: '/api/admin/challenge-requests', tags: ['Admin'], summary: '챌린지 신청 목록 (어드민)',
  security: [{ bearerAuth: [] }],
  request: { query: z.object({ status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(), page: z.coerce.number().default(1), limit: z.coerce.number().default(10) }) },
  responses: {
    200: { description: '조회 성공', content: { 'application/json': { schema: z.object({ items: z.array(ChallengeRequest), total: z.number() }) } } },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
    403: { description: '권한 없음', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'patch', path: '/api/admin/challenge-requests/{id}/approve', tags: ['Admin'], summary: '챌린지 신청 승인',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().openapi({ example: '1' }) }) },
  responses: {
    200: { description: '승인 성공', content: { 'application/json': { schema: Challenge } } },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
    403: { description: '권한 없음', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: '신청 없음', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'patch', path: '/api/admin/challenge-requests/{id}/reject', tags: ['Admin'], summary: '챌린지 신청 거절',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().openapi({ example: '1' }) }), body: { content: { 'application/json': { schema: z.object({ rejectionReason: z.string().openapi({ example: '거절 사유' }) }).openapi('RejectChallengeRequest') } } } },
  responses: {
    200: { description: '거절 성공' },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
    403: { description: '권한 없음', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: '신청 없음', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'get', path: '/api/admin/edit-requests', tags: ['Admin'], summary: '수정 요청 목록 (어드민)',
  security: [{ bearerAuth: [] }],
  request: { query: z.object({ status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(), page: z.coerce.number().default(1), limit: z.coerce.number().default(10) }) },
  responses: {
    200: { description: '조회 성공' },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
    403: { description: '권한 없음', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'patch', path: '/api/admin/edit-requests/{id}/approve', tags: ['Admin'], summary: '수정 요청 승인',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().openapi({ example: '1' }) }) },
  responses: {
    200: { description: '승인 성공' },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
    403: { description: '권한 없음', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: '요청 없음', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'patch', path: '/api/admin/edit-requests/{id}/reject', tags: ['Admin'], summary: '수정 요청 거절',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().openapi({ example: '1' }) }) },
  responses: {
    200: { description: '거절 성공' },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
    403: { description: '권한 없음', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: '요청 없음', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'get', path: '/api/admin/reports', tags: ['Admin'], summary: '신고 목록 조회 (어드민)',
  security: [{ bearerAuth: [] }],
  request: { query: z.object({ reportType: z.enum(['CHALLENGE', 'FEEDBACK', 'SUBMISSION']).optional(), page: z.coerce.number().default(1), limit: z.coerce.number().default(10) }) },
  responses: {
    200: { description: '조회 성공', content: { 'application/json': { schema: z.object({ items: z.array(Report), total: z.number() }) } } },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
    403: { description: '권한 없음', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'patch', path: '/api/admin/users/{id}/ban', tags: ['Admin'], summary: '유저 정지',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().openapi({ example: '1' }) }), body: { content: { 'application/json': { schema: z.object({ reason: z.string().openapi({ example: '정지 사유' }) }).openapi('BanUser') } } } },
  responses: {
    200: { description: '정지 성공' },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
    403: { description: '권한 없음', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: '유저 없음', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'patch', path: '/api/admin/submissions/{id}/block', tags: ['Admin'], summary: '작업물 차단',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().openapi({ example: '1' }) }) },
  responses: {
    200: { description: '차단 성공' },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
    403: { description: '권한 없음', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: '작업물 없음', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'patch', path: '/api/admin/feedbacks/{id}/block', tags: ['Admin'], summary: '피드백 차단',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().openapi({ example: '1' }) }) },
  responses: {
    200: { description: '차단 성공' },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
    403: { description: '권한 없음', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: '피드백 없음', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'patch', path: '/api/admin/submissions/{id}/best', tags: ['Admin'], summary: '베스트 작업물 선정',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().openapi({ example: '1' }) }) },
  responses: {
    200: { description: '선정 성공' },
    401: { description: '인증 실패', content: { 'application/json': { schema: ErrorResponse } } },
    403: { description: '권한 없음', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: '작업물 없음', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: { title: 'Docthru API', version: '1.0.0', description: 'Docthru 백엔드 API 명세서' },
    servers: [{ url: 'http://localhost:3000', description: '개발 서버' }],
    components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
  });
}