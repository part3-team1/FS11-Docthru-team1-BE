//서버구동 확인을 위해 작성, 수정 예정
import express from 'express';
import { prisma } from '#db/prisma.js';
import { config } from '#config';

const app = express();

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
