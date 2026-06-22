import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

// 보안 응답 헤더. 이 서버는 JSON API이고 프론트엔드는 별도 도메인이므로
// - contentSecurityPolicy: 비활성 (CSP는 프론트엔드가 자신의 문서에 설정. 켜두면 Swagger UI가 깨짐)
// - crossOriginResourcePolicy: cross-origin (다른 도메인의 프론트엔드가 응답을 소비할 수 있도록)
export const securityHeaders = helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

// 전역 요청 제한. 비정상적인 트래픽/스크래핑/DoS에 대한 백스톱.
// 일반 사용에는 넉넉하므로 프론트엔드 정상 동작을 막지 않음. 필요시 수치 조정.
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  limit: 1000, // IP당 15분에 1000회
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
});

// 인증 엔드포인트(로그인/회원가입) 무차별 대입 방어.
// skipSuccessfulRequests: 성공한 요청은 카운트하지 않으므로 정상 사용자는 영향 없음.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  limit: 10, // IP당 15분에 실패 10회
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
  },
});
