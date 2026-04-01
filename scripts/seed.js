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
    const adjs = [
      '유려한',
      '정갈한',
      '맥락있는',
      '치밀한',
      '사유하는',
      '투명한',
      '단단한',
      '고요한',
      '깊이있는',
      '기민한',
      '다정한',
      '우아한',
      '선명한',
      '여백의',
      '푸른',
      '새벽의',
    ];

    const nouns = [
      '역자',
      '문장가',
      '필사자',
      '로컬라이저',
      '텍스트',
      '노트',
      '로그',
      '기록자',
      '언어술사',
      '언어학자',
      '번역가',
      '뮤즈',
      '아카이브',
      '큐레이터',
      '해석자',
    ];

    const generateNickname = () => {
      const adj = faker.helpers.arrayElement(adjs);
      const noun = faker.helpers.arrayElement(nouns);
      const style = faker.helpers.arrayElement([
        `${adj}${noun}`,
        `${adj}_${noun}`,
        `#${adj}${noun}`,
      ]);
      const includeNumber = faker.datatype.boolean(0.3);

      return includeNumber ? `${style}${faker.number.int(999)}` : style;
    };

    return {
      email: faker.internet.email(),
      nickname: generateNickname(),
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
      this.#prisma.draft.deleteMany(),
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

    data.push({
      email: 'admin@test.com',
      nickname: '도담님관리자',
      passwordHash: this.#hashedPassword,
      role: 'ADMIN',
      grade: 'EXPERT',
      status: 'ACTIVE',
      provider: 'LOCAL',
    });

    data.push({
      email: 'general@test.com',
      nickname: '나는일반인',
      passwordHash: this.#hashedPassword,
      role: 'USER',
      grade: 'NORMAL',
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
            createdAt: faker.date.recent({ days: 7 }),
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
              approvedAt: faker.date.recent({ days: 7 }),
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

    const submissionTemplates = [
      {
        title: 'Introduction 섹션 초안 번역 및 용어 정리',
        blocks: [
          {
            type: 'paragraph',
            text: '공식 문서의 도입부인 Introduction 섹션은 전체 문서의 톤앤매너를 결정하는 중요한 부분입니다. 본 번역에서는 원문이 가진 기술적 엄밀함을 유지하면서도 입문자가 읽기에 거부감이 없는 평어체를 사용하였습니다. 특히 프레임워크의 핵심 가치를 설명하는 문장들은 직역보다는 의도를 살린 의역에 중점을 두었습니다.',
          },
          {
            type: 'paragraph',
            text: "용어 정리 단계에서는 프로젝트 전반에 걸쳐 사용될 핵심 키워드들을 추출하여 별도의 Glossary를 구축했습니다. 'Hydration', 'Pre-rendering' 등 맥락에 따라 해석이 달라질 수 있는 단어들은 팀 내 가이드라인을 준수하여 통일성을 확보하였으며, 모호한 표현은 주석을 통해 원문을 병기하였습니다.",
          },
        ],
      },
      {
        title: 'Day 2: 핵심 메커니즘 문맥 해석 완료',
        blocks: [
          {
            type: 'paragraph',
            text: '2일차 작업에서는 렌더링 파이프라인과 데이터 페칭 전략을 다루는 핵심 메커니즘 섹션을 집중적으로 해석했습니다. 단순히 텍스트를 옮기는 것을 넘어, 내부 동작 원리를 시각적으로 이해할 수 있도록 문장 구조를 재배치했습니다. 특히 서버 컴포넌트와 클라이언트 컴포넌트의 경계에서 발생하는 제약 사항들을 명확히 전달하는 데 주력했습니다.',
          },
          {
            type: 'paragraph',
            text: "원문에서 사용된 비유적인 표현들(예: 'Waterfall', 'Race condition')은 개발 현장에서 통용되는 관용구로 대체하여 가독성을 높였습니다. 문맥상 이해가 어려운 기술적 배경지식은 보충 설명을 추가하여 독자가 흐름을 놓치지 않도록 배려했습니다.",
          },
        ],
      },
      {
        title: '기술 용어(Terminology) 한국어 순화 제안',
        blocks: [
          {
            type: 'paragraph',
            text: "IT 업계에서 관행적으로 사용하는 외래어 중, 보다 직관적인 한국어로 대체 가능한 용어들을 선별하여 순화안을 작성했습니다. 예를 들어 'Callback'을 '되부름'으로 바꾸기보다는 '응답 처리'와 같이 역할 중심의 단어를 선택하여 실무적 수용성을 고려했습니다. 이는 단순한 언어 순화를 넘어 지식의 전파 장벽을 낮추는 과정입니다.",
          },
          {
            type: 'paragraph',
            text: '선정된 순화어들은 국립국어원의 권고안과 실제 커뮤니티의 사용 빈도를 대조하여 검증을 거쳤습니다. 억지스러운 한글화보다는 의미 전달이 명확한 한도 내에서 최대한 자연스러운 표현을 제안하였으며, 논란의 여지가 있는 용어들은 후보군을 두어 선택의 폭을 넓혔습니다.',
          },
        ],
      },
      {
        title: '복잡한 예제 코드 주석 번역 및 실행 테스트',
        blocks: [
          {
            type: 'paragraph',
            text: '문서 내에 포함된 대규모 예제 코드의 주석들을 모두 한글로 번역하고, 실제 로컬 환경에서 실행 테스트를 완료했습니다. 코드 내 주석은 개발자가 로직을 이해하는 데 결정적인 역할을 하므로, 간결하면서도 정확한 표현을 사용했습니다. 특히 비동기 처리 로직의 주의사항이나 에러 핸들링 부분은 강조 표시를 더해 가독성을 높였습니다.',
          },
          {
            type: 'paragraph',
            text: '번역된 주석이 실제 코드 가독성을 해치지 않는지 확인하기 위해 다양한 테마(Dark/Light mode)에서 가시성 테스트를 병행했습니다. 또한, 변수명이나 함수명은 원형을 유지하되 주석만으로 충분히 의미가 전달되도록 구성하여 학습자가 코드를 직접 수정하며 공부할 수 있도록 최적화했습니다.',
          },
        ],
      },
      {
        title: '중간 점검: 오역 검수 및 문장 다듬기',
        blocks: [
          {
            type: 'paragraph',
            text: "전체 작업량의 절반을 마친 시점에서 진행된 오역 검수 단계입니다. 원문의 의도와 상반되게 번역된 부분이나, 주술 관계가 호응하지 않아 비문으로 읽히는 문장들을 전면 수정했습니다. 특히 대명사 'It'이나 'They'가 지칭하는 대상이 한국어 문장에서 모호하게 표현된 부분들을 구체적인 명사로 치환하여 문장의 명확성을 확보했습니다.",
          },
          {
            type: 'paragraph',
            text: "문장 다듬기 과정에서는 '했다', '이다' 등의 종결 어미가 반복되어 지루함을 주는 구간을 리듬감 있게 수정했습니다. 또한 불필요한 수식어를 제거하여 핵심 정보 위주로 문장을 압축하였으며, 번역 투 표현(예: ~에 의한, ~을 통한)을 자연스러운 한국어 동사구로 전환하여 세련된 텍스트를 완성했습니다.",
          },
        ],
      },
      {
        title: '최종 제출: 전체 문서 기술 번역 가이드 준수 완료',
        blocks: [
          {
            type: 'paragraph',
            text: '본 작업물은 프로젝트 기술 번역 표준 가이드라인 v3.0의 모든 항목을 엄격히 준수하여 최종 완성되었습니다. 인용구 표기법, 코드 블록 레이아웃, 하이퍼링크 처리 등 기술 문서가 갖춰야 할 형식적 요건을 모두 충족하였으며, 오탈자 및 맞춤법 검사를 3회 이상 수행하여 무결성을 기했습니다.',
          },
          {
            type: 'paragraph',
            text: '번역가로서의 주관이 개입될 수 있는 특정 서술 방식에 대해서는 프로젝트 관리자와 사전 조율을 거쳤으며, 최종 결과물은 원문의 지식을 한국어 독자에게 가장 효율적으로 전달할 수 있는 상태임을 자부합니다. 추후 발생할 수 있는 업데이트 사항에 대해서는 유지보수 가이드를 별도로 첨부하였습니다.',
          },
        ],
      },
      {
        title: '트러블슈팅: 다의어(Contextual Meaning) 처리 과정',
        blocks: [
          {
            type: 'paragraph',
            text: "작업 중 마주한 가장 큰 난관은 문맥에 따라 의미가 달라지는 'State'와 'Context' 같은 다의어 처리였습니다. 어떤 문장에서는 '상태'로, 어떤 문장에서는 '정황'으로 해석되는 미묘한 차이를 구분하기 위해 전체 문서의 키워드 빈도수를 분석했습니다. 이를 통해 상황별 번역 우선순위를 정하고 일관된 흐름을 유지할 수 있었습니다.",
          },
          {
            type: 'paragraph',
            text: '특정 용어가 중의적으로 사용되어 오해를 불러일으킬 소지가 있는 경우에는 각주를 활용하여 원문의 뉘앙스를 상세히 설명했습니다. 이러한 트러블슈팅 과정은 단순한 번역을 넘어 기술적 이해도를 높이는 계기가 되었으며, 관련 논의 내용을 기록하여 향후 유사 사례 발생 시 참고할 수 있도록 정리했습니다.',
          },
        ],
      },
      {
        title: 'Next.js 15 공식 문서 신규 세션 해석본',
        blocks: [
          {
            type: 'paragraph',
            text: '최근 릴리스된 Next.js 15의 신규 기능인 캐싱 전략 변경과 서버 액션 업데이트 세션을 중점적으로 번역했습니다. 이전 버전과의 차이점을 설명하는 부분에서 독자가 혼란을 겪지 않도록 변경된 API 명세와 권장되는 사용 패턴을 대조하여 상세히 기술했습니다. 특히 성능 최적화와 관련된 복잡한 아키텍처 설명은 이해를 돕기 위해 단계별로 문장을 나누어 구성했습니다.',
          },
          {
            type: 'paragraph',
            text: "신규 세션에서 강조하는 'Partial Prerendering' 같은 최신 개념들은 국내 커뮤니티의 번역 관례를 참고하되, 공식 문서의 의도를 가장 정확하게 반영하는 용어를 채택했습니다. 번역과 동시에 실제 기능을 테스트 프로젝트에 적용해보며 텍스트의 실제 정확도를 검증하는 과정을 거쳤습니다.",
          },
        ],
      },
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

            const template = faker.helpers.arrayElement(submissionTemplates);

            return this.#prisma.submission.create({
              data: {
                challengeId: challengeId,
                userId: user.id,
                title: template.title,
                content: { blocks: template.blocks },
                heartCount: faker.number.int({ min: 0, max: 9999 }),
                isBest: faker.datatype.boolean(0.1),
                isBlocked: false,
                isDeleted: false,
                createdAt: faker.date.recent({ days: 7 }),
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
                createdAt: faker.date.recent({ days: 7 }),
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
              .catch((error) => {
                console.error(error);
              });
          }),
        );
      }),
    );
  }

  async #seedDrafts(userIds, challengeIds) {
    console.log('임시저장 데이터 생성 중...');

    const draftTemplates = [
      {
        title: '[초안] Next.js 렌더링 과정 요약',
        content: {
          blocks: [
            {
              type: 'paragraph',
              text: '1. 서버 컴포넌트와 클라이언트 컴포넌트 차이점 정리 중...',
            },
            {
              type: 'paragraph',
              text: '공식 문서 3페이지 하단 부분 번역 필요.',
            },
          ],
        },
      },
      {
        title: '용어 정리 메모',
        content: {
          blocks: [
            {
              type: 'paragraph',
              text: 'Hydration -> 수화? 채우기? 적절한 단어 고민해볼 것.',
            },
          ],
        },
      },
      {
        title: null,
        content: {
          blocks: [
            {
              type: 'paragraph',
              text: '이 문장은 나중에 수정할 예정입니다. 일단 저장.',
            },
          ],
        },
      },
    ];

    const draftUsers = faker.helpers.arrayElements(userIds, {
      min: Math.floor(userIds.length * 0.3),
      max: Math.floor(userIds.length * 0.5),
    });

    const drafts = draftUsers.flatMap((user) => {
      const count = faker.number.int({ min: 1, max: 5 });

      return Array.from({ length: count }, () => {
        const template = faker.helpers.arrayElement(draftTemplates);

        return {
          userId: user.id,
          challengeId: faker.helpers.arrayElement(challengeIds),
          title: template.title ?? '임시 저장 제목을 입력해주세요.',
          content: template.content,
          createdAt: faker.date.recent({ days: 7 }),
        };
      });
    });

    return await this.#prisma.draft.createMany({ data: drafts });
  }

  async #seedNotifications(userIds, challengeIds) {
    console.log('알림 데이터 생성 중...');

    const allNotifications = [];

    const challengeRequests = await this.#prisma.challengeRequest.findMany({
      where: { status: { in: ['APPROVED', 'REJECTED'] } },
    });

    const requestNotifications = challengeRequests.map((req) => ({
      userId: req.requestedBy,
      type:
        req.status === 'APPROVED' ? 'CHALLENGE_APPROVED' : 'CHALLENGE_REJECTED',
      message: `신청하신 [${req.title}]이 ${req.status === 'APPROVED' ? '승인' : '거절'}되었습니다.`,
      isRead: faker.datatype.boolean(0.5),
      createdAt: req.createdAt,
    }));

    const closedChallenges = await this.#prisma.challenge.findMany({
      where: { status: 'CLOSED' },
      include: { request: true },
    });

    const closedNotifications = closedChallenges.map((challenge) => ({
      userId: challenge.request.requestedBy,
      type: 'CHALLENGE_CLOSED',
      message: `[${challenge.title}]이 마감되었습니다.`,
      isRead: faker.datatype.boolean(0.5),
      createdAt: faker.date.recent({ days: 2 }),
    }));

    const submissions = await this.#prisma.submission.findMany({
      include: { challenge: { include: { request: true } } },
    });

    const submissionNotifications = submissions.map((sub) => ({
      userId: sub.challenge.request.requestedBy,
      type: 'SUBMISSION_CREATED',
      message: `[${sub.challenge.title}]에 작업물이 추가되었습니다.`,
      isRead: faker.datatype.boolean(0.5),
      createdAt: sub.createdAt,
    }));

    const feedbacks = await this.#prisma.feedback.findMany({
      include: { submission: { include: { challenge: true } } },
    });

    const feedbackNotifications = feedbacks.map((feed) => ({
      userId: feed.submission.userId,
      type: 'FEEDBACK_CREATED',
      message: `[${feed.submission.challenge.title}]에 도전한 작업물에 피드백이 추가되었습니다.`,
      isRead: faker.datatype.boolean(0.5),
      createdAt: feed.createdAt,
    }));

    const hearts = await this.#prisma.heart.findMany({
      include: { submission: { include: { challenge: true } } },
    });

    const heartNotifications = hearts.map((heart) => ({
      userId: heart.submission.userId,
      type: 'SUBMISSION_UPDATED',
      message: `[${heart.submission.challenge.title}]에 도전한 작업물에 하트❤️가 추가되었습니다.`,
      isRead: faker.datatype.boolean(0.5),
      createdAt: heart.createdAt,
    }));

    allNotifications.push(...requestNotifications);
    allNotifications.push(...closedNotifications);
    allNotifications.push(...submissionNotifications);
    allNotifications.push(...feedbackNotifications);
    allNotifications.push(...heartNotifications);

    if (allNotifications.length > 0) {
      return await this.#prisma.notification.createMany({
        data: allNotifications,
      });
    }
  }

  async run() {
    console.log('현재 NODE_ENV:', process.env.NODE_ENV);

    // if (process.env.NODE_ENV !== 'development') {
    //   throw new Error('프로덕션 환경에서는 시딩을 실행하지 않습니다.');
    // }

    // if (!process.env.DATABASE_URL?.includes('localhost')) {
    //   throw new Error(
    //     'localhost 데이터베이스에서만 시딩을 실행할 수 있습니다.',
    //   );
    // }

    console.log('시딩 시작...');

    this.#hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);
    await this.#resetDb();

    const users = await this.#seedUsers();
    console.log(`${users.length}명의 유저가 생성되었습니다.`);

    const challengeIds = await this.#seedChallenges(users);
    console.log(`${challengeIds.length}개의 챌린지가 생성되었습니다.`);

    if (challengeIds.length > 0) {
      const submissionIds = await this.#seedSubmissions(users, challengeIds);
      console.log(`${submissionIds.length}개의 작업물이 생성되었습니다.`);

      await this.#seedFeedbacks(users, submissionIds);
      console.log('피드백이 생성 완료되었습니다.');

      await this.#seedHearts(users, submissionIds);
      console.log('하트가 생성 완료되었습니다.');

      await this.#seedDrafts(users, challengeIds);
      console.log('임시저장이 생성 완료되었습니다.');

      await this.#seedNotifications(users, challengeIds);
      console.log('알림이 생성 완료되었습니다.');
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
