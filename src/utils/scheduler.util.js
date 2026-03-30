import cron from 'node-cron';
import { prisma } from '#db/prisma.js';

export const initScheduler = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('마감된 챌린지 상태 업데이트 실행 중...');

      const result = await prisma.challenge.updateMany({
        where: { status: 'OPENDED', dueDate: { lt: new Date() } },
        data: { status: 'CLOSED' },
      });

      console.log(`총 ${result.count}개의 챌린지가 'CLOSED' 처리되었습니다.`);
    } catch (error) {
      console.error('스케줄러 실행 중 에러 발생:', error);
    }
  });
};
