import { z } from 'zod';
import { ERROR_MESSAGE, REPORT_REASON, VALIDATION_ERROR } from '#constants';

export const authSchema = z.object({
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
});

export const loginSchema = authSchema.omit({ nickname: true });
export const userUpdateSchema = authSchema.pick({ nickname: true });

export const challengeSchema = z.object({
  title: z
    .string()
    .min(10, VALIDATION_ERROR.MIN_TITLE)
    .max(50, VALIDATION_ERROR.MAX_TITLE),
  doc_url: z.string().url(),
  description: z.string().max(150, VALIDATION_ERROR.MAX_DESCRIPTION).optional(),
  max_participants: z.coerce
    .number()
    .int()
    .min(5, VALIDATION_ERROR.MIN_PARTICIPANTS)
    .max(20, VALIDATION_ERROR.MAX_PARTICIPANTS),
  category: z.enum(['DOCUMENTATION', 'BLOG'], {
    errorMap: () => ({ message: VALIDATION_ERROR.INVALID_CATEGORY }),
  }),
  document_type: z.enum(['NEXTJS', 'API', 'CAREER', 'MODERNJS', 'WEB'], {
    errorMap: () => ({ message: VALIDATION_ERROR.INVALID_DOCUMENT_TYPE }),
  }),
  due_date: z.string().datetime(),
});

export const feedbackSchema = z.object({
  content: z.string().max(500, VALIDATION_ERROR.MAX_FEEDBACK),
});

export const submissionSchema = z
  .object({
    title: z
      .string()
      .min(10, VALIDATION_ERROR.MIN_TITLE)
      .max(50, VALIDATION_ERROR.MAX_TITLE),
  })
  .passthrough();

export const reportSchema = z.object({
  report_type: z.enum(['CHALLENGE', 'SUBMISSION', 'FEEDBACK'], {
    errorMap: () => ({ message: VALIDATION_ERROR.INVALID_REPORT_TYPE }),
  }),
  target_id: z.string().cuid(VALIDATION_ERROR.INVALID_ID),
  reason: z.string().refine((value) => REPORT_REASON.includes(value), {
    message: VALIDATION_ERROR.INVALID_REPORT_REASON,
  }),
});

export const socialLoginSchema = z.object({
  code: z
    .string({ required_error: ERROR_MESSAGE.AUTH_CODE_REQUIRED })
    .min(1, ERROR_MESSAGE.AUTH_CODE_EMPTY),
  state: z.string().optional(),
});
