import express from 'express';
import cookieParser from 'cookie-parser';
import { config } from '#config';
import { errorHandler, cors, logger } from '#middlewares';
import { registerSwagger } from '#docs/swagger.js';
import { initScheduler } from '#utils/scheduler.util.js';

export class App {
  constructor(controller, authMiddleware) {
    this.app = express();
    this.middleware(authMiddleware);
    this.routes(controller);
    this.errorHandling();
  }

  middleware(authMiddleware) {
    this.app.use(cors);
    this.app.use(express.static('public'));
    this.app.use(express.json());
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
