# DOCTHRU BE 서버

## ⚙️ 환경 설정

프로젝트 루트에 `env` 폴더를 생성해주세요.

- **개발용:** `env/.env.development`
- **운영용:** `env/.env.production`

---

## 🚩 설치 및 실행 순서

### 1. 의존성 설치

패키지 매니저로 `pnpm` 사용합니다.

```bash
pnpm install
```

### 2. 데이터베이스 동기화

```bash
pnpm run prisma:push
pnpm run prisma:generate
```

### 3. 서버실행

```bash
pnpm run dev
```

## 📝 프로젝트 소개

**DOCTHRU(독스루)** 는 개발 문서, 기술 블로그 등 영문 기술 문서를 함께 번역하며 성장하는 참여형 번역 챌린지 플랫폼입니다. 혼자 하기 버거운 기술 문서 번역을 챌린지 형태로 함께 수행하고, 서로의 작업물에 피드백을 남기며 양질의 번역 결과물을 만들어내는 것을 목표로 합니다.

## ✨ 주요 기능

### 🏆 챌린지 및 명예의 전당

- **자동화된 라이프사이클:** 신청-승인-모집-마감 전 과정을 자동 관리합니다.

- **실시간 참여 제어:** 인원 제한 및 기한에 따른 참여 권한을 실시간으로 제어합니다.

- **명예의 전당:** 마감 후 추천순 상위 5인 캐러셀 전시 및 1위 특별 배지를 부여합니다.

### ✍️ 번역 에디터 및 작업물 관리

- **동시 조회 에디터:** 번역 중 원문을 동시에 확인 가능한 임베디드 뷰를 제공합니다.

- **임시 저장/불러오기:** 작업 중인 데이터를 서버에 자동 보관하며 재접속 시 모달로 복구합니다.

- **상호 피드백:** 하트(추천)와 댓글 기능을 통해 유저 간 집단지성 번역을 지원합니다.

### 👤 유저 등급 및 어드민 권한

- **전문가 승격 시스템:** 챌린지 참여 및 추천 선정 횟수에 따른 등급 체계를 운영합니다.

- **통합 관리 모드:** 어드민 전용 페이지를 통한 챌린지 승인, 유저 및 콘텐츠 관리를 지원합니다.

- **신고 및 제재 시스템:** 부적절한 컨텐츠를 신고할 수 있으며, 3회 누적시 자동 또는 어드민의 판단으로 유저 제재를 수행합니다.

### 🔔 알림 및 대시보드

- **스마트 알림:** 상태 변경, 신규 피드백, 마감 임박 등 주요 이벤트를 실시간 안내합니다.

- **개인 대시보드:** 참여 중인 챌린지 및 활동 기록을 한눈에 관리합니다.

### 🛠 기술적 강점

- **Layerd Architecture:** 계층화된 구조로 유지보수성을 극대화했습니다.

- **보안 인증:** Google OAuth 2.0 및 JWT 기반의 안전한 권한 관리를 구현했습니다.

## 🔗 배포 주소

- BE: https://fs11-docthru-team1-be.onrender.com

## 🔧 사용 기술 스택 / 라이브러리

### Tech Stack

<p>
  <img src="https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white">
  <img src="https://img.shields.io/badge/express-000000?style=for-the-badge&logo=express&logoColor=white">
  <img src="https://img.shields.io/badge/postgresql-4169E1?style=for-the-badge&logo=postgresql&logoColor=white">
  <img src="https://img.shields.io/badge/prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white">
</p>

### Libraries & Tools

- **Validation**: Zod

- **Security**: Bcrypt, Cookie-parser

- **Architecture**: Awilix (Dependency Injection)

- **Utilities**: Date-fns, Node-cron

- **Development**: Faker (Seed Data), Nodemon

## 📂 디렉터리 구조

```text
├── env/
├── node_modules/
├── prisma
│   └── schema.prisma
├── public/
├── scripts
│   └── seed.js
├── src/
│   ├── common/
│   │     └── constants/
│   │     └── di/
│   │     └── exceptions/
│   │     └── lifecycle/
│   ├── config/
│   ├── controllers/
│   ├── db/
│   ├── docs/
│   ├── middlewares/
│   ├── providers/
│   ├── repository/
│   ├── schemas/
│   ├── services/
│   ├── utils/
├── app.js
└── main.js
```
