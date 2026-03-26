import { z } from 'zod';
import { createDocument } from 'zod-openapi';
import {
  authSchema,
  loginSchema,
  challengeSchema,
  reportSchema,
  roleUpdateSchema,
  userUpdateSchema,
  submissionSchema,
  feedbackSchema,
  socialLoginSchema,
} from '#schemas/validation.schema.js';

const successResponseSchema = z
  .object({
    success: z.literal(true),
    data: z.any().optional(),
  })
  .meta({ id: 'SuccessResponse', description: '기본 성공 응답' });

const errorResponseSchema = z
  .object({
    success: z.literal(false),
    message: z.string(),
    details: z.record(z.string(), z.array(z.string())).optional(),
  })
  .meta({ id: 'ErrorResponse', description: '공통 에러 응답' });

const reasonBodySchema = z
  .object({
    reason: z.string().min(1, '사유를 입력해주세요.'),
  })
  .meta({
    id: 'ReasonRequest',
    description: '거절/차단/삭제 사유 요청 데이터',
  });

export const openApiDocument = createDocument({
  openapi: '3.1.0',
  info: {
    title: 'Docthru By Team No.1 API ',
    version: '1.0.0',
    description: '1팀의 Docthru API 문서입니다.',
  },
  tags: [
    { name: 'Admin', description: '관리자 관련 API' },
    { name: 'Auth', description: '인증 및 회원가입 관련 API' },
    { name: 'Challenge', description: '챌린지 관련 API' },
    { name: 'Draft', description: '임시저장 관련 API' },
    { name: 'Feedback', description: '피드백 관련 API' },
    { name: 'Notification', description: '알림 관련 API' },
    { name: 'Report', description: '신고 기능 관련 API' },
    { name: 'Submission', description: '작업물 관련 API' },
    { name: 'User', description: '사용자 및 개인페이지 관련 API' },
  ],
  components: {
    securitySchemes: {
      accessTokenCookie: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
        description: '로그인 설정 시 설정되는 Access Token 쿠키',
      },
    },
  },
  paths: {
    //[draft] 추가 필요!!

    '/api/admin/requests/{id}/approve': {
      patch: {
        tags: ['Admin'],
        summary: '챌린지 개설 요청 승인',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: '승인할 요청의 ID',
          },
        ],
        responses: {
          200: {
            description: '승인 성공 및 챌린지 생성 완료',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/admin/requests/{id}/reject': {
      patch: {
        tags: ['Admin'],
        summary: '챌린지 개설 요청 거절',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: '거절할 요청의 ID',
          },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: reasonBodySchema } },
        },
        responses: {
          200: {
            description: '요청 거절 처리 완료',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/admin/requests/{id}': {
      delete: {
        tags: ['Admin'],
        summary: '챌린지 개설 요청 삭제',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: '삭제할 요청의 ID',
          },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: reasonBodySchema } },
        },
        responses: {
          204: {
            description: '삭제 완료',
          },
        },
      },
    },

    '/api/admin/users/{id}/ban': {
      patch: {
        tags: ['Admin'],
        summary: '악성 유저 차단',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: '차단할 유저의 ID',
          },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: reasonBodySchema } },
        },
        responses: {
          200: {
            description: '유저 차단 완료',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/admin/feedbacks/{id}/block': {
      patch: {
        tags: ['Admin'],
        summary: '악성 피드백 차단',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: '차단할 피드백의 ID',
          },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: reasonBodySchema } },
        },
        responses: {
          200: {
            description: '피드백 차단 완료',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: '이메일 회원가입',
        description:
          '회원가입 성공 시 쿠키에 Access Token과 Refresh Token이 구워집니다.',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: authSchema },
          },
        },
        responses: {
          201: {
            description: '회원가입 성공 및 토큰 발급',
            content: { 'application/json': { schema: successResponseSchema } },
          },
          400: {
            description: '입력값 검증 실패',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
        },
      },
    },

    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: '이메일 로그인',
        description:
          '로그인 성공 시 쿠키에 Access Token과 Refresh Token이 구워집니다.',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: loginSchema },
          },
        },
        responses: {
          200: {
            description: '로그인 성공 및 토큰 발급',
            content: { 'application/json': { schema: successResponseSchema } },
          },
          401: {
            description: '이메일 또는 비밀번호 불일치',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
        },
      },
    },

    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: '로그아웃',
        description:
          '서버에서 토큰을 만료 처리하고, 클라이언트의 인증 쿠키를 삭제합니다.',
        security: [{ accessTokenCookie: [] }],
        responses: {
          204: {
            description: '로그아웃 성공',
          },
        },
      },
    },

    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: '현재 로그인한 내 정보 조회',
        security: [{ accessTokenCookie: [] }],
        responses: {
          200: {
            description: '정보 조회 성공',
            content: { 'application/json': { schema: successResponseSchema } }, // 실제로는 data에 user 객체가 들어감
          },
          401: {
            description: '인증되지 않은 사용자 (토큰 만료/없음)',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
        },
      },
    },

    '/api/auth/withdraw': {
      delete: {
        tags: ['Auth'],
        summary: '회원 탈퇴',
        description: '계정을 삭제하고 모든 인증 쿠키를 지웁니다.',
        security: [{ accessTokenCookie: [] }],
        responses: {
          200: {
            description: '회원 탈퇴 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/auth/login/{provider}': {
      post: {
        tags: ['Auth'],
        summary: '소셜 로그인 (OAuth)',
        description:
          '제공자(구글 등)로부터 받은 인가 코드를 이용해 로그인/회원가입을 진행하고 쿠키를 굽습니다.',
        parameters: [
          {
            name: 'provider',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: '소셜 로그인 제공자 이름 (goole, kakao, naver)',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: socialLoginSchema },
          },
        },
        responses: {
          200: {
            description: '소셜 로그인(또는 회원가입) 성공 및 토큰 발급 완료',
            content: { 'application/json': { schema: successResponseSchema } },
          },
          400: {
            description: '인가 코드 누락 등 입력값 오류',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
        },
      },
    },

    '/api/challenges': {
      get: {
        tags: ['Challenge'],
        summary: '챌린지 목록 조회',
        description: '챌린지 목록을 불러옵니다.',

        parameters: [
          {
            name: 'skip',
            in: 'query',
            schema: { type: 'string' },
            description: '건너뛸 개수',
          },
          {
            name: 'take',
            in: 'query',
            schema: { type: 'string' },
            description: '가져올 개수',
          },
          {
            name: 'keyword',
            in: 'query',
            schema: { type: 'string' },
            description: '검색어',
          },
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string' },
            description: '카테고리 (DOCUMENTATION, BLOG)',
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string' },
            description: '상태',
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string' },
            description: '정렬 기준',
          },
          {
            name: 'sortOrder',
            in: 'query',
            schema: { type: 'string' },
            description: '정렬 방향',
          },
        ],
        responses: {
          200: {
            description: '조회 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/challenges/{id}': {
      get: {
        tags: ['Challenge'],
        summary: '특정 챌린지 상세 조회',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: '챌린지 ID',
          },
        ],
        responses: {
          200: {
            description: '조회 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },

      patch: {
        tags: ['Challenge'],
        summary: '챌린지 정보 수정',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: '수정할 챌린지 ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: challengeSchema },
          },
        },
        responses: {
          200: {
            description: '수정 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },

      delete: {
        tags: ['Challenge'],
        summary: '챌린지 삭제',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: '삭제할 챌린지 ID',
          },
        ],
        responses: {
          204: { description: '삭제 성공' },
        },
      },
    },

    '/api/challenges/{id}/join': {
      post: {
        tags: ['Challenge'],
        summary: '챌린지 참여하기',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: '참여할 챌린지 ID',
          },
        ],
        responses: {
          200: {
            description: '참여 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/challenges/{id}/leave': {
      delete: {
        tags: ['Challenge'],
        summary: '챌린지 참여 취소',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: '나갈 챌린지 ID',
          },
        ],
        responses: {
          200: {
            description: '취소 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/challengeRequests': {
      post: {
        tags: ['Challenge'],
        summary: '새로운 챌린지 개설 요청',
        description:
          '일반 유저가 관리자에게 새로운 챌린지 개설을 요청합니다. (관리자 승인 후 챌린지가 생성됩니다.)',
        security: [{ accessTokenCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: challengeSchema },
          },
        },
        responses: {
          201: {
            description: '챌린지 개설 요청 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/submissions/{submissionId}/feedbacks': {
      get: {
        tags: ['Feedback'],
        summary: '특정 작업물의 피드백 목록 조회',
        description:
          '작업물에 달린 피드백 목록을 페이지네이션 및 정렬하여 가져옵니다.',

        parameters: [
          {
            name: 'submissionId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: '작업물 ID',
          },
          {
            name: 'skip',
            in: 'query',
            schema: { type: 'string' },
            description: '건너뛸 개수',
          },
          {
            name: 'take',
            in: 'query',
            schema: { type: 'string' },
            description: '가져올 개수',
          },
          {
            name: 'sort_by',
            in: 'query',
            schema: { type: 'string' },
            description: '정렬 기준',
          },
          {
            name: 'sort_order',
            in: 'query',
            schema: { type: 'string' },
            description: '정렬 방향',
          },
        ],
        responses: {
          200: {
            description: '조회 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },

      post: {
        tags: ['Feedback'],
        summary: '피드백 작성',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          {
            name: 'submissionId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: '피드백을 남길 작업물 ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: feedbackSchema },
          },
        },
        responses: {
          201: {
            description: '피드백 작성 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/feedbacks/{id}': {
      patch: {
        tags: ['Feedback'],
        summary: '피드백 내용 수정',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: '수정할 피드백 ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: feedbackSchema },
          },
        },
        responses: {
          200: {
            description: '피드백 수정 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },

      delete: {
        tags: ['Feedback'],
        summary: '피드백 삭제',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: '삭제할 피드백 ID',
          },
        ],
        responses: {
          204: {
            description: '삭제 성공',
          },
        },
      },
    },

    '/api/challenges/{challengeId}/submissions': {
      get: {
        tags: ['Submission'],
        summary: '특정 챌린지의 작업물 목록 조회',
        description:
          '페이지네이션과 정렬 기능을 이용해 작업물 목록을 조회합니다.',
        parameters: [
          {
            name: 'challengeId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          { name: 'skip', in: 'query', schema: { type: 'string' } },
          { name: 'take', in: 'query', schema: { type: 'string' } },
          { name: 'sort_by', in: 'query', schema: { type: 'string' } },
          { name: 'sort_order', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: '조회 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },

      post: {
        tags: ['Submission'],
        summary: '작업물 제출',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          {
            name: 'challengeId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: submissionSchema } },
        },
        responses: {
          201: {
            description: '제출 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/challenges/{challengeId}/submissions/rankings': {
      get: {
        tags: ['Submission'],
        summary: '작업물 인기 랭킹 조회',
        description: '상위 랭킹의 작업물을 조회합니다.',
        parameters: [
          {
            name: 'challengeId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'string' },
            description: '가져올 개수',
          },
        ],
        responses: {
          200: {
            description: '랭킹 조회 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/submissions/{id}': {
      get: {
        tags: ['Submission'],
        summary: '작업물 상세 조회',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: '상세 조회 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },

      patch: {
        tags: ['Submission'],
        summary: '작업물 수정',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: submissionSchema } },
        },
        responses: {
          200: {
            description: '수정 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },

      delete: {
        tags: ['Submission'],
        summary: '작업물 삭제',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          204: { description: '삭제 성공' },
        },
      },
    },

    '/api/submissions/{id}/heart': {
      post: {
        tags: ['Submission'],
        summary: '작업물 좋아요 토글',
        description: '좋아요를 추가하거나 취소합니다.',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: '좋아요 토글 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/users/me': {
      get: {
        tags: ['User'],
        summary: '내 프로필 조회',
        security: [{ accessTokenCookie: [] }],
        responses: {
          200: {
            description: '조회 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },

      patch: {
        tags: ['User'],
        summary: '내 프로필 수정',
        security: [{ accessTokenCookie: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: userUpdateSchema } },
        },
        responses: {
          200: {
            description: '수정 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/users/me/submissions': {
      get: {
        tags: ['User'],
        summary: '내가 작성한 작업물 목록',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          { name: 'skip', in: 'query', schema: { type: 'string' } },
          { name: 'take', in: 'query', schema: { type: 'string' } },
          { name: 'sort_by', in: 'query', schema: { type: 'string' } },
          { name: 'sort_order', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: '조회 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/users/me/challenges': {
      get: {
        tags: ['User'],
        summary: '내가 참여한 챌린지 목록',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          { name: 'skip', in: 'query', schema: { type: 'string' } },
          { name: 'take', in: 'query', schema: { type: 'string' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string' } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: '조회 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/users/me/challengeRequests': {
      get: {
        tags: ['User'],
        summary: '내가 보낸 챌린지 개설 요청 목록',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          { name: 'skip', in: 'query', schema: { type: 'string' } },
          { name: 'take', in: 'query', schema: { type: 'string' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string' } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: '조회 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/users/me/hearts': {
      get: {
        tags: ['User'],
        summary: '내가 좋아요 한 작업물 목록',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          { name: 'skip', in: 'query', schema: { type: 'string' } },
          { name: 'take', in: 'query', schema: { type: 'string' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string' } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: '조회 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/users/me/feedbacks': {
      get: {
        tags: ['User'],
        summary: '내가 작성한 피드백 목록',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          { name: 'skip', in: 'query', schema: { type: 'string' } },
          { name: 'take', in: 'query', schema: { type: 'string' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string' } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: '조회 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/users': {
      get: {
        tags: ['Admin', 'User'],
        summary: '전체 유저 목록 조회 (관리자)',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          { name: 'skip', in: 'query', schema: { type: 'string' } },
          { name: 'take', in: 'query', schema: { type: 'string' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string' } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string' } },
          {
            name: 'role',
            in: 'query',
            schema: { type: 'string' },
            description: '역할 (USER, ADMIN, MASTER)',
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string' },
            description: '상태 (ACTIVE, BANNED 등)',
          },
        ],
        responses: {
          200: {
            description: '조회 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/users/{id}': {
      get: {
        tags: ['Admin', 'User'],
        summary: '특정 유저 상세 조회 (관리자)',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: '조회 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/users/{id}/role': {
      patch: {
        tags: ['Admin', 'User'],
        summary: '유저 권한 변경 (관리자)',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: '권한을 변경할 유저 ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: roleUpdateSchema,
            },
          },
        },
        responses: {
          200: {
            description: '권한 변경 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/reports': {
      get: {
        tags: ['Report', 'Admin'],
        summary: '전체 신고 목록 조회 (관리자)',
        description:
          '관리자가 접수된 신고 목록을 필터링 및 페이지네이션하여 조회합니다.',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          { name: 'skip', in: 'query', schema: { type: 'string' } },
          { name: 'take', in: 'query', schema: { type: 'string' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string' } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string' } },
          {
            name: 'report_type',
            in: 'query',
            schema: { type: 'string' },
            description: '신고 타입 (CHALLENGE, SUBMISSION, FEEDBACK)',
          },
        ],
        responses: {
          200: {
            description: '조회 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },

      post: {
        tags: ['Report'],
        summary: '콘텐츠 신고하기',
        description: '유저가 불건전한 챌린지, 작업물, 피드백을 신고합니다.',
        security: [{ accessTokenCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: reportSchema },
          },
        },
        responses: {
          201: {
            description: '신고 접수 완료',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/reports/{id}': {
      get: {
        tags: ['Report', 'Admin'],
        summary: '특정 신고 상세 조회 (관리자)',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: '조회할 신고 ID',
          },
        ],
        responses: {
          200: {
            description: '상세 조회 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/notifications': {
      get: {
        tags: ['Notification'],
        summary: '내 알림 목록 조회',
        description: '나에게 온 알림 목록을 페이지네이션하여 조회합니다.',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          {
            name: 'skip',
            in: 'query',
            schema: { type: 'string' },
            description: '건너뛸 개수',
          },
          {
            name: 'take',
            in: 'query',
            schema: { type: 'string' },
            description: '가져올 개수',
          },
        ],
        responses: {
          200: {
            description: '조회 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/notifications/unread-count': {
      get: {
        tags: ['Notification'],
        summary: '읽지 않은 알림 개수 조회',
        description: '아직 읽지 않은 알림의 총 개수를 반환합니다.',
        security: [{ accessTokenCookie: [] }],
        responses: {
          200: {
            description: '조회 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },

    '/api/notifications/{id}': {
      delete: {
        tags: ['Notification'],
        summary: '알림 삭제',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: '삭제할 알림 ID',
          },
        ],
        responses: {
          204: {
            description: '삭제 성공',
          },
        },
      },
    },

    '/api/notifications/{id}/read': {
      patch: {
        tags: ['Notification'],
        summary: '알림 읽음 처리',
        description: '특정 알림의 상태를 [읽음]으로 변경합니다.',
        security: [{ accessTokenCookie: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: '읽음 처리할 알림 ID',
          },
        ],
        responses: {
          200: {
            description: '읽음 처리 성공',
            content: { 'application/json': { schema: successResponseSchema } },
          },
        },
      },
    },
  },
});
