import express from 'express';
import cookieParser from 'cookie-parser';
import { config } from '#config';
import {
  errorHandler,
  cors,
  logger,
  securityHeaders,
  globalRateLimiter,
} from '#middlewares';
import { registerSwagger } from '#docs/swagger.js';
import { initScheduler } from '#utils/scheduler.util.js';

export class App {
  constructor(controller, authMiddleware) {
    this.app = express();
    // Render 등 리버스 프록시 1대 뒤에서 동작. secure 쿠키 판단과
    // 요청 제한의 클라이언트 IP 식별을 위해 신뢰할 프록시 홉 수를 명시.
    this.app.set('trust proxy', 1);
    this.middleware(authMiddleware);
    this.routes(controller);
    this.errorHandling();
  }

  middleware(authMiddleware) {
    this.app.use(securityHeaders);
    this.app.use(cors);
    this.app.use(globalRateLimiter);
    this.app.use(express.static('public'));
    this.app.use(express.json({ limit: '1mb' }));
    this.app.use(logger);
    this.app.use(cookieParser());
    this.app.use((req, res, next) =>
      authMiddleware.authenticate(req, res, next),
    );
  }

  routes(controller) {
    registerSwagger(this.app);
    this.app.use('/api', controller.routes());
  }

  errorHandling() {
    this.app.use(errorHandler);
  }

  listen(port) {
    return this.app.listen(port, () => {
      console.log(
        `[${config.NODE_ENV}] Swagger running at http://localhost:${port}/api/docs`,
      );
      console.log(
        `[${config.NODE_ENV}] Server running at http://localhost:${port}`,
      );

      initScheduler();
    });
  }
}
