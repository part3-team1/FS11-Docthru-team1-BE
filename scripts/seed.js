import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { fakerKO as faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const SEED_PASSWORD = 'Test1234!';

class Seeder {
  #prisma;
  #numUserToCreate;
  #hashedPassword;

  constructor(prisma, numUsersToCreate = 15) {
    this.#prisma = prisma;
    this.#numUserToCreate = numUsersToCreate;
  }

  #xs(n) {
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  #makeUserInput() {
    return {
      email: faker.internet.email(),
      nickname: `${faker.word.adjective()}${faker.word.noun()}${faker.number.int(999)}`,
      passwordHash: this.#hashedPassword,
      role: 'USER',
      grade: faker.helpers.arrayElement(['NORMAL', 'EXPERT']),
      status: 'ACTIVE',
      provider: faker.helpers.arrayElement(['LOCAL', 'GOOGLE']),
    };
  }

  async #resetDb() {
    console.log('기존 데이터를 삭제하는 중...');

    return this.#prisma.$transaction([
      this.#prisma.notification.deleteMany(),
      this.#prisma.heart.deleteMany(),
      this.#prisma.feedback.deleteMany(),
      this.#prisma.submission.deleteMany(),
      this.#prisma.participation.deleteMany(),
      this.#prisma.challenge.deleteMany(),
      this.#prisma.challengeRequest.deleteMany(),
      this.#prisma.user.deleteMany(),
    ]);
  }

  async #seedUsers() {
    const data = this.#xs(this.#numUserToCreate).map(() =>
      this.#makeUserInput(),
    );

    //테스트용 마스터 계정
    data.push({
      email: 'master@test.com',
      nickname: '갓은결',
      passwordHash: this.#hashedPassword,
      role: 'MASTER',
      grade: 'EXPERT',
      status: 'ACTIVE',
      provider: 'LOCAL',
    });

    return await this.#prisma.user.createManyAndReturn({
      data,
      select: { id: true },
    });
  }

  async #seedChallenges(userIds) {
    console.log('챌린지 데이터 생성 중...');

    const challengeTitles = [
      'Next.js 공식 문서 모아보기',
      'TypeScript 핵심 개념 정리하기',
      'React Server Components 마스터',
      'App Router 마이그레이션 챌린지',
      'Tailwind CSS로 클론 코딩하기',
      'Prisma ORM 실전 활용법 연구',
      'Next.js 성능 최적화 가이드 작성',
      'API 라우트 보안 설정 체크리스트',
    ];

    const descriptions = [
      '외국어로 된 기술 공식 문서를 함께 번역하며 국내 개발 생태계에 기여하는 챌린지입니다.',
      '단순한 직역을 넘어, 한국 개발자들이 이해하기 쉬운 기술 용어로 순화하고 의역하는 모임입니다.',
      '최신 프레임워크의 업데이트 로그를 빠르게 해석하여 핵심 변경 사항을 공유하고 기록합니다.',
      '영어 공식 문서의 복잡한 문장을 분석하고, 기술적 맥락(Context)에 맞는 정확한 해석법을 연구합니다.',
      '매일 1개 섹션 이상의 기술 문서를 번역하고, 용어집(Glossary)을 구축하여 데이터베이스화합니다.',
      '해외 아티클을 읽고 한국 상황에 맞는 실무 가이드라인으로 재구성하여 포스팅하는 것이 목표입니다.',
      '모호한 기술 용어들의 정의를 명확히 하고, 커뮤니티 표준 번역안을 도출하기 위해 토론합니다.',
      '공식 예제 코드에 달린 영문 주석을 한글로 번역하며 코드의 동작 원리를 깊이 있게 파헤칩니다.',
      '번역기의 오역을 찾아내고, 실제 작동하는 코드와 대조하여 더 정확한 설명으로 수정하는 도전입니다.',
      '글로벌 기술 트렌드를 빠르게 습득하기 위해 원문을 함께 읽고 해석 노트를 공유하며 성장합니다.',
    ];

    const randomStatus = [
      'PENDING',
      'PENDING',
      'APPROVED',
      'APPROVED',
      'REJECTED',
      'DELETED',
    ];

    const result = await Promise.all(
      userIds.map(async (user) => {
        const request = await this.#prisma.challengeRequest.create({
          data: {
            requestedBy: user.id,
            title: faker.helpers.arrayElement(challengeTitles),
            docUrl: faker.internet.url(),
            description: faker.helpers.arrayElement(descriptions),
            category: faker.helpers.arrayElement([
              'NEXTJS',
              'API',
              'CAREER',
              'MODERNJS',
              'WEB',
            ]),
            documentType: faker.helpers.arrayElement(['DOCUMENTATION', 'BLOG']),
            dueDate: faker.date.future({ years: 1 }),
            maxParticipants: faker.number.int({ min: 5, max: 20 }),
            status: faker.helpers.arrayElement(randomStatus),
          },
        });

        if (request.status === 'APPROVED') {
          const challenge = await this.#prisma.challenge.create({
            data: {
              requestId: request.id,
              title: request.title,
              docUrl: request.docUrl,
              description: request.description,
              category: request.category,
              documentType: request.documentType,
              dueDate: request.dueDate,
              maxParticipants: request.maxParticipants,
              status: faker.helpers.arrayElement([
                'OPENED',
                'CLOSED',
                'DELETED',
              ]),
            },
          });

          await this.#prisma.participation.create({
            data: {
              userId: user.id,
              challengeId: challenge.id,
            },
          });

          return challenge.id;
        }
        return null;
      }),
    );

    const challengeIds = result.filter((id) => id !== null);
    return challengeIds;
  }

  async #seedSubmissions(userIds, challengeIds) {
    console.log('작업물 데이터 생성 중...');

    const submissionTitles = [
      'Introduction 섹션 초안 번역 및 용어 정리',
      'Day 2: 핵심 메커니즘 문맥 해석 완료',
      '기술 용어(Terminology) 한국어 순화 제안',
      '복잡한 예제 코드 주석 번역 및 실행 테스트',
      '중간 점검: 오역 검수 및 문장 다듬기',
      '최종 제출: 전체 문서 기술 번역 가이드 준수 완료',
      '트러블슈팅: 다의어(Contextual Meaning) 처리 과정',
      'Next.js 15 공식 문서 신규 세션 해석본',
    ];

    const result = await Promise.all(
      challengeIds.map(async (challengeId) => {
        const participants = faker.helpers.arrayElements(userIds, {
          min: 1,
          max: 3,
        });

        return Promise.all(
          participants.map(async (user) => {
            await this.#prisma.participation.upsert({
              where: {
                challengeId_userId: {
                  challengeId: challengeId,
                  userId: user.id,
                },
              },
              update: {},
              create: { challengeId: challengeId, userId: user.id },
            });

            return this.#prisma.submission.create({
              data: {
                challengeId: challengeId,
                userId: user.id,
                title: faker.helpers.arrayElement(submissionTitles),
                content: {
                  blocks: [
                    { type: 'paragraph', text: faker.lorem.paragraphs(2) },
                  ],
                },
                heartCount: faker.number.int({ min: 0, max: 9999 }),
                isBest: faker.datatype.boolean(0.1),
                isBlocked: false,
                isDeleted: false,
              },
            });
          }),
        );
      }),
    );

    const submissionIds = result.flat().map((sub) => sub.id);
    return submissionIds;
  }

  async #seedFeedbacks(userIds, submissionIds) {
    console.log('피드백 데이터 생성 중...');

    const comments = [
      '번역이 정말 매끄럽네요! 기술적인 뉘앙스도 잘 살리신 것 같아요. 👍',
      '혹시 이 부분 원문의 "Inversion of Control"은 어떻게 해석하셨나요?',
      '깔끔한 정리 감사합니다! 덕분에 막혔던 부분이 해결됐어요.',
      '이 용어는 커뮤니티 관례에 따라 그대로 두는 게 더 자연스러울 것 같습니다.',
      '와, 이 긴 문장을 한눈에 들어오게 번역하시다니 대단하세요. 🔥',
      '저도 같은 구간 번역 중인데, 이 해석이 훨씬 정확한 것 같네요. 배우고 갑니다!',
      '오타가 하나 있어요! 3번째 줄 "데이터"가 "대이더"로 되어 있네요.',
      '함께 번역하면서 공부하니까 능률이 엄청 올라가는 것 같아요! 화이팅!',
    ];
    await Promise.all(
      submissionIds.map(async (submissionId) => {
        const commenters = faker.helpers.arrayElements(userIds, {
          min: 1,
          max: 5,
        });

        return Promise.all(
          commenters.map(async (user) => {
            return this.#prisma.feedback.create({
              data: {
                submissionId: submissionId,
                userId: user.id,
                content: faker.helpers.arrayElement(comments),
                isBlocked: false,
              },
            });
          }),
        );
      }),
    );
  }

  async #seedHearts(userIds, submissionIds) {
    console.log('좋아요 데이터 생성 중...');

    await Promise.all(
      submissionIds.map(async (submissionId) => {
        const likers = faker.helpers.arrayElements(userIds, { min: 0, max: 5 });

        return Promise.all(
          likers.map((user) => {
            this.#prisma.heart
              .upsert({
                where: {
                  submissionId_userId: {
                    submissionId: submissionId,
                    userId: user.id,
                  },
                },
                update: {},
                create: { submissionId: submissionId, userId: user.id },
              })
              .catch(() => {});
          }),
        );
      }),
    );
  }

  async run() {
    console.log('현재 NODE_ENV:', process.env.NODE_ENV);

    if (process.env.NODE_ENV !== 'development') {
      throw new Error('프로덕션 환경에서는 시딩을 실행하지 않습니다.');
    }

    if (!process.env.DATABASE_URL?.includes('localhost')) {
      throw new Error(
        'localhost 데이터베이스에서만 시딩을 실행할 수 있습니다.',
      );
    }

    console.log('시딩 시작...');

    this.#hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);
    await this.#resetDb();

    const users = await this.#seedUsers();
    console.log(`${users.length}명의 유저가 생성되었습니다.`);

    const challengeIds = await this.#seedChallenges(users.slice(0, 10));
    console.log(`${challengeIds.length}개의 챌린지가 생성되었습니다.`);

    if (challengeIds.length > 0) {
      const submissionIds = await this.#seedSubmissions(users, challengeIds);
      console.log(`${submissionIds.length}개의 작업물이 생성되었습니다.`);

      await this.#seedFeedbacks(users, submissionIds);
      console.log('피드백이 생성 완료되었습니다.');

      await this.#seedHearts(users, submissionIds);
      console.log('하트가 생성 완료되었습니다.');
    }

    console.log(`마스터 계정: master@test.com / 비밀번호: ${SEED_PASSWORD}`);
    console.log('데이터 시딩 완료!');
  }
}
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const NUMBER_CREATED_USER = 20;
const seeder = new Seeder(prisma, NUMBER_CREATED_USER);

seeder
  .run()
  .catch((error) => {
    console.error('시딩 에러:', error);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
