import express from 'express';
import cookieParser from 'cookie-parser';
import { prisma } from '#db/prisma.js';
import { config } from '#config';
import { setupSwagger } from './docs/swagger.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

setupSwagger(app);

app.use(errorMiddleware);

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('데이터베이스 연결 성공!');

    app.listen(config.PORT, () => {
      console.log(`Server is running at: http://localhost:${config.PORT}`);
    });
  } catch (error) {
    console.log('데이터베이스 연결 실패!');
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();