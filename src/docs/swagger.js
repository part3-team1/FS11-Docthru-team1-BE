import swaggerUi from 'swagger-ui-express';
import { createRequire } from 'module';
import { generateOpenApiDocument } from './openapi.js';

const require = createRequire(import.meta.url);

export function setupSwagger(app) {
  const document = generateOpenApiDocument();
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(document));
}