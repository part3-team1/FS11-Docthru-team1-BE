import swaggerUi from 'swagger-ui-express';
import { isProduction } from '#config';
import { openApiDocument } from './openapi.js';

const swaggerHandler = swaggerUi.setup(openApiDocument, { explorer: true });

export const registerSwagger = (app) => {
  // 운영 환경에서는 API 명세를 공개하지 않아 공격 표면을 줄인다.
  // 운영에서 문서가 필요하면 사내망/Basic Auth 뒤에서만 노출할 것.
  if (isProduction) {
    return;
  }

  app.get('/api/openapi.json', (_req, res) => {
    res.status(200).json(openApiDocument);
  });

  app.use('/api/docs', swaggerUi.serve);
  app.get('/api/docs', swaggerHandler);
};
