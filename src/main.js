import { config } from '#config';
import { createContainer } from './common/di/container.js';
import { setupGracefulShutdown } from './common/lifecycle/graceful_shutdown.js';
import { App } from './app.js';

async function bootstrap() {
  const { controller, authMiddleware, prisma } = createContainer();

  const app = new App(controller, authMiddleware);
  const server = app.listen(config.PORT);

  setupGracefulShutdown(server, prisma);
}

bootstrap();
