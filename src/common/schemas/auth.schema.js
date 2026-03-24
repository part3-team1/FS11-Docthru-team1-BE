import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const signupSchema = z.object({
  email: z.email().openapi({ example: 'test@test.com' }),
  password: z.string().min(8).regex(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).+$/).openapi({ example: 'Test1234!' }),
  nickname: z.string().min(2).max(20).openapi({ example: '테스터' }),
}).openapi('SignupRequest');

export const loginSchema = z.object({
  email: z.email().openapi({ example: 'test@test.com' }),
  password: z.string().min(1).openapi({ example: 'Test1234!' }),
}).openapi('LoginRequest');

export const googleLoginSchema = z.object({
  idToken: z.string().min(1).openapi({ example: 'google_id_token' }),
}).openapi('GoogleLoginRequest');

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional().openapi({ example: 'refresh_token' }),
}).openapi('RefreshTokenRequest');