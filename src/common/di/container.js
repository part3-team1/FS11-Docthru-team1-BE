import {
  createContainer as createAwilixContainer,
  asClass,
  asValue,
  InjectionMode,
  Lifetime,
} from 'awilix';
import { prisma } from '#db/prisma.js';
import {
  ChallengeRepository,
  ChallengeRequestRepository,
  DraftRepository,
  FeedbackRepository,
  HeartRepository,
  NotificationRepository,
  ReportRepository,
  SubmissionRepository,
  UserRepository,
} from '#repositories';
import {
  AdminService,
  AuthService,
  SocialAuthService,
  ChallengeService,
  DraftService,
  FeedbackService,
  NotificationService,
  ReportService,
  SubmissionService,
  UserService,
} from '#services';
import {
  Controller,
  AdminController,
  AuthController,
  SocialAuthController,
  ChallengeController,
  ChallengeRequestController,
  DraftController,
  FeedbackController,
  NotificationController,
  ReportController,
  SubmissionController,
} from '#controllers';
import { PasswordProvider, TokenProvider, CookieProvider } from '#providers';
import { AuthMiddleware } from '#middlewares';

export const createContainer = () => {
  const container = createAwilixContainer({
    injectionMode: InjectionMode.PROXY,
    strict: true,
  });

  container.register({
    prisma: asValue(prisma),
    passwordProvider: asClass(PasswordProvider, {
      lifetime: Lifetime.SINGLETON,
    }),
    tokenProvider: asClass(TokenProvider, { lifetime: Lifetime.SINGLETON }),
    cookieProvider: asClass(CookieProvider, { lifetime: Lifetime.SINGLETON }),

    userRepository: asClass(UserRepository, { lifetime: Lifetime.SINGLETON }),
    challengeRepository: asClass(ChallengeRepository, {
      lifetime: Lifetime.SINGLETON,
    }),
    challengeRequestRepository: asClass(ChallengeRequestRepository, {
      lifetime: Lifetime.SINGLETON,
    }),
    draftRepository: asClass(DraftRepository, { lifetime: Lifetime.SINGLETON }),
    feedbackRepository: asClass(FeedbackRepository, {
      lifetime: Lifetime.SINGLETON,
    }),
    heartRepository: asClass(HeartRepository, { lifetime: Lifetime.SINGLETON }),
    notificationRepository: asClass(NotificationRepository, {
      lifetime: Lifetime.SINGLETON,
    }),
    reportRepository: asClass(ReportRepository, {
      lifetime: Lifetime.SINGLETON,
    }),
    submissionRepository: asClass(SubmissionRepository, {
      lifetime: Lifetime.SINGLETON,
    }),

    adminService: asClass(AdminService, { lifetime: Lifetime.SINGLETON }),
    authService: asClass(AuthService, { lifetime: Lifetime.SINGLETON }),
    socialAuthService: asClass(SocialAuthService, {
      lifetime: Lifetime.SINGLETON,
    }),
    challengeService: asClass(ChallengeService, {
      lifetime: Lifetime.SINGLETON,
    }),
    draftService: asClass(DraftService, { lifetime: Lifetime.SINGLETON }),
    feedbackService: asClass(FeedbackService, { lifetime: Lifetime.SINGLETON }),
    notificationService: asClass(NotificationService, {
      lifetime: Lifetime.SINGLETON,
    }),
    reportService: asClass(ReportService, { lifetime: Lifetime.SINGLETON }),
    submissionService: asClass(SubmissionService, {
      lifetime: Lifetime.SINGLETON,
    }),
    userService: asClass(UserService, { lifetime: Lifetime.SINGLETON }),

    authMiddleware: asClass(AuthMiddleware, { lifetime: Lifetime.SINGLETON }),

    adminController: asClass(AdminController, { lifetime: Lifetime.SINGLETON }),
    authController: asClass(AuthController, { lifetime: Lifetime.SINGLETON }),
    socialAuthController: asClass(SocialAuthController, {
      lifetime: Lifetime.SINGLETON,
    }),
    challengeController: asClass(ChallengeController, {
      lifetime: Lifetime.SINGLETON,
    }),
    challengeRequestController: asClass(ChallengeRequestController, {
      lifetime: Lifetime.SINGLETON,
    }),
    draftController: asClass(DraftController, { lifetime: Lifetime.SINGLETON }),
    feedbackController: asClass(FeedbackController, {
      lifetime: Lifetime.SINGLETON,
    }),
    notificationController: asClass(NotificationController, {
      lifetime: Lifetime.SINGLETON,
    }),
    reportController: asClass(ReportController, {
      lifetime: Lifetime.SINGLETON,
    }),
    submissionController: asClass(SubmissionController, {
      lifetime: Lifetime.SINGLETON,
    }),

    controller: asClass(Controller, { lifetime: Lifetime.SINGLETON }),
  });

  return container.cradle;
};
