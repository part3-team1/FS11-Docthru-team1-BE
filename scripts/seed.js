import { PrismaClient } from '#generated/prisma/client.js';
import { faker } from '@faker-js/faker';

const NUM_USERS = 10;
const xs = (n) => Array.from({ length: n }, (_, i) => i + 1);
const makeUserInput = () => ({
  email: faker.internet.email(),
  passwordHash: null,
  nickname: faker.internet.username().slice(0, 20),
  role: 'USER',
  grade: faker.helpers.arrayElement(['NORMAL', 'EXPERT']),
  status: 'ACTIVE',
  provider: faker.helpers.arrayElement(['LOCAL', 'GOOGLE']),
  participationCount: faker.number.int({ min: 0, max: 20 }),
  bestSelectionCount: faker.number.int({ min: 0, max: 5 }),
});

const makeChallengeRequestInput = (userId) => ({
  requestedBy: userId,
  title: faker.lorem.sentence({ min: 3, max: 6 }),
  docUrl: faker.internet.url(),
  description: faker.lorem.paragraphs(2),
  category: faker.helpers.arrayElement(['Next.js', 'React', 'TypeScript', 'Node.js', 'Modern JS']),
  documentType: faker.helpers.arrayElement(['공식문서', '블로그', '튜토리얼', '가이드']),
  dueDate: faker.date.future({ years: 1 }),
  maxParticipants: faker.number.int({ min: 5, max: 30 }),
  status: 'APPROVED',
});

const makeChallengeInput = (req) => ({
  requestId: req.id,
  title: req.title,
  docUrl: req.docUrl,
  description: req.description,
  category: req.category,
  documentType: req.documentType,
  dueDate: req.dueDate,
  maxParticipants: req.maxParticipants,
  currentParticipants: 0,
  status: faker.helpers.arrayElement(['OPENED', 'CLOSED']),
  approvedAt: new Date(),
});

const makeSubmissionInput = (userId, challengeId) => ({
  userId,
  challengeId,
  title: faker.lorem.sentence({ min: 3, max: 5 }),
  content: { blocks: [{ type: 'paragraph', text: faker.lorem.paragraphs(3) }] },
  heartCount: 0,
  isBest: false,
  isBlocked: false,
  isDeleted: false,
});

const makeFeedbackInput = (userId, submissionId) => ({
  userId,
  submissionId,
  content: faker.lorem.sentences({ min: 1, max: 3 }),
  isBlocked: false,
});

const makeNotificationInput = (userId) => ({
  userId,
  type: faker.helpers.arrayElement([
    'CHALLENGE_APPROVED', 'CHALLENGE_REJECTED', 'SUBMISSION_BEST',
    'FEEDBACK_RECEIVED', 'HEART_RECEIVED',
  ]),
  message: faker.lorem.sentence(),
  isRead: faker.datatype.boolean(),
});

const resetDb = (prisma) =>
  prisma.$transaction([
    prisma.report.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.heart.deleteMany(),
    prisma.feedback.deleteMany(),
    prisma.submission.deleteMany(),
    prisma.draft.deleteMany(),
    prisma.editRequest.deleteMany(),
    prisma.participation.deleteMany(),
    prisma.challenge.deleteMany(),
    prisma.challengeRequest.deleteMany(),
    prisma.user.deleteMany(),
  ]);

const seedUsers = async (prisma) => {
  await prisma.user.createMany({
    data: [
      { email: 'admin@docthru.com', passwordHash: null, nickname: '어드민', role: 'ADMIN', grade: 'EXPERT', status: 'ACTIVE', provider: 'LOCAL' },
      { email: 'master@docthru.com', passwordHash: null, nickname: '마스터', role: 'MASTER', grade: 'EXPERT', status: 'ACTIVE', provider: 'LOCAL' },
    ],
  });

  const userData = xs(NUM_USERS).map(makeUserInput);
  await prisma.user.createMany({ data: userData });

  return prisma.user.findMany({
    where: { role: 'USER' },
    select: { id: true },
  });
};

const seedChallengeRequests = async (prisma, users) => {
  const data = users.slice(0, 5).map((u) => makeChallengeRequestInput(u.id));
  const titles = data.map((r) => r.title);
  await prisma.challengeRequest.createMany({ data });
  return prisma.challengeRequest.findMany({
    where: { title: { in: titles } },
    select: { id: true, title: true, docUrl: true, description: true, category: true, documentType: true, dueDate: true, maxParticipants: true },
  });
};

const seedChallenges = async (prisma, requests) => {
  const data = requests.map(makeChallengeInput);
  const requestIds = data.map((c) => c.requestId);
  await prisma.challenge.createMany({ data });
  return prisma.challenge.findMany({
    where: { requestId: { in: requestIds } },
    select: { id: true },
  });
};

const seedParticipations = async (prisma, users, challenges) => {
  const pairs = new Set();
  const data = [];

  for (const challenge of challenges) {
    const participants = faker.helpers.arrayElements(users, { min: 2, max: 5 });
    for (const user of participants) {
      const key = `${challenge.id}_${user.id}`;
      if (pairs.has(key)) continue;
      pairs.add(key);
      data.push({ challengeId: challenge.id, userId: user.id });
    }
    await prisma.challenge.update({
      where: { id: challenge.id },
      data: { currentParticipants: participants.length },
    });
  }

  await prisma.participation.createMany({ data });
  return data;
};

const seedSubmissions = async (prisma, participations) => {
  const data = participations.map((p) => makeSubmissionInput(p.userId, p.challengeId));
  const challengeIds = [...new Set(data.map((s) => s.challengeId))];
  await prisma.submission.createMany({ data });
  return prisma.submission.findMany({
    where: { challengeId: { in: challengeIds } },
    select: { id: true, challengeId: true, userId: true },
  });
};

const seedFeedbacks = async (prisma, submissions, users) => {
  const data = submissions.flatMap((s) =>
    faker.helpers.arrayElements(users, { min: 1, max: 3 }).map((u) =>
      makeFeedbackInput(u.id, s.id)
    )
  );
  await prisma.feedback.createMany({ data });
};

const seedHearts = async (prisma, submissions, users) => {
  const pairs = new Set();
  const data = [];

  for (const submission of submissions) {
    const likers = faker.helpers.arrayElements(users, { min: 0, max: 4 });
    for (const user of likers) {
      const key = `${submission.id}_${user.id}`;
      if (pairs.has(key)) continue;
      pairs.add(key);
      data.push({ submissionId: submission.id, userId: user.id });
    }
    await prisma.submission.update({
      where: { id: submission.id },
      data: { heartCount: likers.length },
    });
  }

  await prisma.heart.createMany({ data });
};

const seedNotifications = async (prisma, users) => {
  const data = users.slice(0, 5).map((u) => makeNotificationInput(u.id));
  await prisma.notification.createMany({ data });
};

const seedReports = async (prisma, users, submissions) => {
  const data = xs(3).map(() => {
    const reporter = faker.helpers.arrayElement(users);
    const target = faker.helpers.arrayElement(users.filter((u) => u.id !== reporter.id));
    const submission = faker.helpers.arrayElement(submissions);
    return {
      reporterId: String(reporter.id),
      targetUserId: String(target.id),
      targetId: String(submission.id),
      reportType: 'SUBMISSION',
      reason: faker.lorem.sentence(),
    };
  });
  await prisma.report.createMany({ data });
};

async function main(prisma) {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('프로덕션 환경에서는 시딩을 실행하지 않습니다');
  }

  console.log('시딩 시작...');

  await resetDb(prisma);
  console.log('기존 데이터 삭제 완료');

  const users = await seedUsers(prisma);
  console.log(`ser ${users.length}명 생성 완료`);

  const requests = await seedChallengeRequests(prisma, users);
  console.log(`ChallengeRequest ${requests.length}개 생성 완료`);

  const challenges = await seedChallenges(prisma, requests);
  console.log(`Challenge ${challenges.length}개 생성 완료`);

  const participations = await seedParticipations(prisma, users, challenges);
  console.log(`Participation ${participations.length}개 생성 완료`);

  const submissions = await seedSubmissions(prisma, participations);
  console.log(`Submission ${submissions.length}개 생성 완료`);

  await seedFeedbacks(prisma, submissions, users);
  console.log('Feedback 생성 완료');

  await seedHearts(prisma, submissions, users);
  console.log('Heart 생성 완료');

  await seedNotifications(prisma, users);
  console.log('Notification 생성 완료');

  await seedReports(prisma, users, submissions);
  console.log('Report 생성 완료');

  console.log('시딩 완료!');
}

const prisma = new PrismaClient();

main(prisma)
  .catch((e) => {
    console.error('시딩 에러:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });