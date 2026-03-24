# DOCTHRU BE 설명

## 환경 설정

프로젝트 루트에 `env` 폴더를 생성해주세요.

- **개발용:** `env/.env.development`
- **운영용:** `env/.env.production`

---

## 설치 및 실행 순서

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

## 사용 기술 스택 / 라이브러리

node.js, express, postgresSQL, prisma /
zod, bycript, awilix, faker, change-case, cookie-parser, date-fns, axios

## 디렉터리 구조

```text
├── env
├── node_modules
├── prisma
│   └── schema.prisma
├── public
├── scripts
│   └── seed.js
├── prisma/
│   └── schema.prisma
├── src/
│   ├── common/
│   │     └── constants
│   │     └── di
│   │     └── exceptions
│   │     └── lifecycle
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
