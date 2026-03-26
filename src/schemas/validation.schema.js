import { z } from 'zod';
import { ERROR_MESSAGE, REPORT_REASON, VALIDATION_ERROR } from '#constants';

export const authSchema = z
  .object({
    email: z
      .string()
      .min(1, VALIDATION_ERROR.EMPTY_EMAIL)
      .email(VALIDATION_ERROR.INVALID_EMAIL)
      .max(50, VALIDATION_ERROR.MAX_EMAIL),
    nickname: z
      .string()
      .min(2, VALIDATION_ERROR.MIN_NICKNAME)
      .max(8, VALIDATION_ERROR.MAX_NICKNAME),
    password: z
      .string()
      .min(8, VALIDATION_ERROR.MIN_PASSWORD)
      .max(12, VALIDATION_ERROR.MAX_PASSWORD)
      .regex(/^[a-zA-Z0-9~!@#$%^&*]+$/, VALIDATION_ERROR.REGEX_PASSWORD),
  })
  .meta({
    id: 'SignUpRequest',
    description: '이메일 회원가입 요청 데이터',
  });

export const loginSchema = authSchema.omit({ nickname: true }).meta({
  id: 'LoginRequest',
  description: '이메일 로그인 요청 데이터',
});

export const userUpdateSchema = authSchema.pick({ nickname: true }).meta({
  id: 'UserUpdateRequest',
  description: '유저 프로필 수정 요청 데이터',
});

export const challengeSchema = z
  .object({
    title: z
      .string()
      .min(10, VALIDATION_ERROR.MIN_TITLE)
      .max(50, VALIDATION_ERROR.MAX_TITLE),
    docUrl: z.string().url(),
    description: z
      .string()
      .max(150, VALIDATION_ERROR.MAX_DESCRIPTION)
      .optional(),
    maxParticipants: z.coerce
      .number()
      .int()
      .min(5, VALIDATION_ERROR.MIN_PARTICIPANTS)
      .max(20, VALIDATION_ERROR.MAX_PARTICIPANTS),
    category: z.enum(['NEXTJS', 'API', 'CAREER', 'MODERNJS', 'WEB'], {
      errorMap: () => ({ message: VALIDATION_ERROR.INVALID_CATEGORY }),
    }),
    documentType: z.enum(['DOCUMENTATION', 'BLOG'], {
      errorMap: () => ({ message: VALIDATION_ERROR.INVALID_DOCUMENT_TYPE }),
    }),
    dueDate: z.string().datetime(),
  })
  .meta({
    id: 'ChallengeRequest',
    description: '신규 챌린지 생성 요청 데이터',
  });

export const feedbackSchema = z
  .object({
    content: z.string().max(500, VALIDATION_ERROR.MAX_FEEDBACK),
  })
  .meta({
    id: 'FeedbackRequest',
    description: '피드백 작성 및 수정 요청 데이터',
  });

export const submissionSchema = z
  .object({
    title: z
      .string()
      .min(10, VALIDATION_ERROR.MIN_TITLE)
      .max(50, VALIDATION_ERROR.MAX_TITLE),
  })
  .passthrough()
  .meta({
    id: 'SubmissionRequest',
    description: '챌린지 작업물 제출 요청 데이터',
  });

export const reportSchema = z
  .object({
    reportType: z.enum(['CHALLENGE', 'SUBMISSION', 'FEEDBACK'], {
      errorMap: () => ({ message: VALIDATION_ERROR.INVALID_REPORT_TYPE }),
    }),
    targetId: z.string().cuid(VALIDATION_ERROR.INVALID_ID),
    reason: z.string().refine((value) => REPORT_REASON.includes(value), {
      message: VALIDATION_ERROR.INVALID_REPORT_REASON,
    }),
  })
  .meta({
    id: 'ReportRequest',
    description: '콘텐츠 신고 요청 데이터',
  });

export const socialLoginSchema = z
  .object({
    code: z
      .string({ required_error: ERROR_MESSAGE.AUTH_CODE_REQUIRED })
      .min(1, ERROR_MESSAGE.AUTH_CODE_EMPTY),
    state: z.string().optional(),
  })
  .meta({
    id: 'SocialLoginRequest',
    description: '소셜 로그인 인증 코드 및 상태 값',
  });

export const roleUpdateSchema = z
  .object({ role: z.enum(['USER', 'ADMIN']) })
  .meta({ id: 'RoleUpdateRequest' });
