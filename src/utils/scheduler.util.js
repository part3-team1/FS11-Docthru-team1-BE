import cron from 'node-cron';
import { prisma } from '#db/prisma.js';

const updateExpiredChallenge = async () => {
  try {
    console.log('마감된 챌린지 상태 업데이트 실행 중...');

    const result = await prisma.challenge.updateMany({
      where: { status: 'OPENED', dueDate: { lt: new Date() } },
      data: { status: 'CLOSED' },
    });

    if (result.count > 0) {
      console.log(`총 ${result.count}개의 챌린지가 'CLOSED' 처리되었습니다.`);
    }
  } catch (error) {
    console.error('챌린지 마감 스케줄러 실행 중 에러 발생:', error);
  }
};

export const initScheduler = async () => {
  try {
    await updateExpiredChallenge();

    cron.schedule('0 0 * * *', updateExpiredChallenge);

    console.log(
      '스케줄러 프로세스가 성공적으로 완료되었습니다. (서버 실행 시/ 매일 00:00 에 실행)',
    );
  } catch (error) {
    console.error('스케줄러 프로세스 중 에러 발생:', error);
  }
};
